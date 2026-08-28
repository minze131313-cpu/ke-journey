// 画廊频道：按时间线展示旅途实拍，支持多维度标签筛选与照片管理。
const data = require("../data.js");
const photo = require("../utils/photo.js");

const PHASE_ORDER = ["旅程中", "去程中", "回程中", "出发前", "已结束"];
const TYPE_LABELS = {
  landscape: "风景", architecture: "人文建筑", people: "人物", road: "道路", vehicle: "车辆",
  food: "美食", animal: "动物", plant: "植物", water: "水面", sky: "天空与光线", night: "夜景",
};
const WEATHER_LABELS = {
  sunny: "晴", cloudy: "多云", overcast: "阴", rain: "雨", snow: "雪", fog: "雾", indoor: "室内",
};

function dateLabel(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = (startOfDay(now) - startOfDay(d)) / 86400000;
  const p = (n) => (n < 10 ? "0" + n : "" + n);
  if (diff === 0) return "今天";
  if (diff === 1) return "昨天";
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

Page({
  data: {
    slug: data.slug,
    cardTitle: data.card.title,
    cloudOk: false,
    photos: [],
    sections: [],
    filters: { phase: "", city: "", type: "", time: "", weather: "" },
    options: { phases: [], cities: [], types: [], times: [], weathers: [] },
    scaleClass: "scale-1x",
  },

  onShow() {
    this.setData({ scaleClass: this.scaleClass(getApp().globalData.textScale) });
    this.load();
    wx.setNavigationBarTitle({ title: "旅行画廊" });
  },

  scaleClass(scale) {
    return scale >= 1.5 ? "scale-3x" : scale > 1 ? "scale-2x" : "scale-1x";
  },

  load() {
    const env = getApp().globalData.cloudEnv;
    if (!env || !wx.cloud) {
      this.setData({ cloudOk: false, photos: [], sections: [] });
      return;
    }
    wx.cloud
      .database()
      .collection("user_photos")
      .where({ journeySlug: data.slug })
      .orderBy("createdAt", "desc")
      .limit(300)
      .get()
      .then((res) => {
        const photos = (res.data || []).map((d) => {
          const dTime = new Date(d.takenAt);
          const p = (n) => (n < 10 ? "0" + n : "" + n);
          return {
            ...d,
            timeText: `${p(dTime.getHours())}:${p(dTime.getMinutes())}`,
            dateKey: dateLabel(d.takenAt),
            typeLabel: TYPE_LABELS[d.photoType] || d.photoType || "",
            weatherLabel: WEATHER_LABELS[d.weather] || d.weather || "",
          };
        });
        const uniq = (fn) => [...new Set(photos.map(fn).filter(Boolean))];
        this.setData({
          cloudOk: true,
          photos,
          options: {
            phases: uniq((x) => x.phaseLabel),
            cities: uniq((x) => x.city),
            types: uniq((x) => x.typeLabel),
            times: uniq((x) => x.timeBucket),
            weathers: uniq((x) => x.weatherLabel),
          },
        });
        this.applyFilters();
      })
      .catch(() => this.setData({ cloudOk: false, photos: [], sections: [] }));
  },

  applyFilters() {
    const { filters, photos } = this.data;
    const filtered = photos.filter((p) => {
      if (filters.phase && p.phaseLabel !== filters.phase) return false;
      if (filters.city && p.city !== filters.city) return false;
      if (filters.type && p.typeLabel !== filters.type) return false;
      if (filters.time && p.timeBucket !== filters.time) return false;
      if (filters.weather && p.weatherLabel !== filters.weather) return false;
      return true;
    });
    const groups = {};
    for (const p of filtered) {
      if (!groups[p.dateKey]) groups[p.dateKey] = [];
      groups[p.dateKey].push(p);
    }
    const sections = Object.keys(groups).map((key) => ({ dateKey: key, items: groups[key] }));
    this.setData({ sections });
  },

  toggleFilter(e) {
    const { group, value } = e.currentTarget.dataset;
    const filters = { ...this.data.filters };
    filters[group] = filters[group] === value ? "" : value;
    this.setData({ filters });
    this.applyFilters();
  },

  clearFilters() {
    this.setData({ filters: { phase: "", city: "", type: "", time: "", weather: "" } });
    this.applyFilters();
  },

  onPhotoTap(e) {
    const poiId = e.currentTarget.dataset.poiId;
    if (poiId && poiId !== "__unmatched__") {
      wx.navigateTo({ url: `/journeys/${data.slug}/poi/poi?id=${poiId}` });
    }
  },

  onPhotoLongPress(e) {
    const id = e.currentTarget.dataset.id;
    const fileID = e.currentTarget.dataset.fileid;
    const self = this;
    wx.showActionSheet({
      itemList: ["修改阶段", "重新分析", "删除"],
      success: (r) => {
        if (r.tapIndex === 0) self.pickPhase(id);
        else if (r.tapIndex === 1) self.reAnalyze(id);
        else if (r.tapIndex === 2) self.confirmDelete(id, fileID);
      },
    });
  },

  pickPhase(id) {
    const self = this;
    const phases = ["出发前", "去程中", "旅程中", "回程中", "已结束"];
    const keyOf = { 出发前: "before", 去程中: "outbound", 旅程中: "journey", 回程中: "returning", 已结束: "ended" };
    wx.showActionSheet({
      itemList: phases,
      success: (r) => {
        const phase = keyOf[phases[r.tapIndex]];
        wx.cloud
          .callFunction({ name: "analyze-photo", data: { action: "set-phase", id, phase } })
          .then((res) => {
            if (!(res.result && res.result.ok)) throw new Error("修改失败");
            wx.showToast({ title: "阶段已更新", icon: "none" });
            self.load();
          })
          .catch(() => wx.showToast({ title: "修改失败", icon: "none" }));
      },
    });
  },

  reAnalyze(id) {
    const self = this;
    wx.showLoading({ title: "重新分析中…", mask: true });
    wx.cloud
      .callFunction({
        name: "analyze-photo",
        data: {
          action: "re-analyze",
          id,
          places: photo.slimPlaces(data.trip.places),
          routes: photo.slimRoutes(data.trip.days.map((d) => d.route)),
        },
      })
      .then((res) => {
        wx.hideLoading();
        if (!(res.result && res.result.ok)) throw new Error("分析失败");
        wx.showToast({ title: "分析已更新", icon: "none" });
        self.load();
      })
      .catch((err) => {
        wx.hideLoading();
        wx.showToast({ title: String((err && err.message) || "分析失败").slice(0, 40), icon: "none" });
      });
  },

  confirmDelete(id, fileID) {
    const self = this;
    wx.showModal({
      title: "删除这张实拍？",
      content: "照片与分析记录会从云端一并删除",
      confirmText: "删除",
      confirmColor: "#e55748",
      success: (r) => {
        if (!r.confirm) return;
        wx.cloud
          .callFunction({ name: "analyze-photo", data: { action: "delete", id, fileID } })
          .then(() => self.load())
          .catch(() => wx.showToast({ title: "删除失败", icon: "none" }));
      },
    });
  },

  goTrip() {
    wx.navigateBack({ fail: () => wx.navigateTo({ url: `/journeys/${data.slug}/trip/trip` }) });
  },

  onShareAppMessage() {
    return { title: `${data.card.title} · 旅行画廊`, path: `/journeys/${data.slug}/gallery/gallery` };
  },
});
