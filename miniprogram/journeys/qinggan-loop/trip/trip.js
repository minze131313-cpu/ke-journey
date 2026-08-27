// 行程主页：以「天」为索引的行程列表为核心；路线地图、路况、清单为页面中下部的辅助区块。
// 列表项点击进入当天详情页；地图仅作参考（筛选/选日/节点查看）。
const data = require("../data.js");
const photo = require("../utils/photo.js");

const CATEGORIES = [
  { key: "all", label: "全部" },
  { key: "scenic", label: "景点" },
  { key: "city", label: "城镇" },
  { key: "supply", label: "补给" },
  { key: "warning", label: "风险" },
];

const CAT_LABELS = { scenic: "景点", city: "城镇", supply: "补给", warning: "风险" };
const CAT_COLORS = { scenic: "#f1a530", city: "#07877e", supply: "#3288d8", warning: "#e55748" };

function placeInDay(place, day) {
  if (day === 0) return true;
  if (place.day === day) return true;
  const extra = data.config.extendedStayDays[place.id];
  return Array.isArray(extra) && extra.indexOf(day) >= 0;
}

Page({
  data: {
    slug: data.slug,
    card: data.card,
    config: data.config,
    categories: CATEGORIES,
    category: "all",
    dayOptions: [],
    day: 0,
    markers: [],
    polylines: [],
    mapScale: Math.round(data.config.mapZoom),
    legend: [
      { key: "scenic", label: "景点", color: CAT_COLORS.scenic },
      { key: "city", label: "城镇/住宿", color: CAT_COLORS.city },
      { key: "supply", label: "补给", color: CAT_COLORS.supply },
      { key: "warning", label: "风险", color: CAT_COLORS.warning },
    ],
    tripDays: [],
    roads: data.config.roads,
    checklistGroups: [],
    emergency: data.config.checklist.emergency,
    selectedPlace: null,
    mapReady: false,
    mapStatus: "地图加载中",
    favorite: false,
    scaleClass: "scale-1x",
    anchor: "",
    userPhotos: [],
  },

  onLoad(options) {
    const slug = options.slug || data.slug;
    const checked = wx.getStorageSync(`kej:checklist:${slug}`) || {};
    this._slug = slug;
    this.setData({
      slug,
      favorite: getApp().isFavorite(slug),
      scaleClass: this.scaleClass(getApp().globalData.textScale),
      dayOptions: [{ day: 0, label: "全览" }].concat(
        data.trip.days.map((d) => ({ day: d.day, label: `D${d.day}` })),
      ),
      tripDays: data.trip.days.map((d) => ({
        day: d.day,
        title: d.title,
        start: d.start,
        end: d.end,
        km: d.km,
        drive: d.drive,
        stay: d.stay,
        summary: d.summary,
        stops: d.stops.map((id) => {
          const p = data.poiDetails[id].place;
          return { id, name: p.name, color: CAT_COLORS[p.category], catLabel: CAT_LABELS[p.category] };
        }),
      })),
      checklistGroups: data.config.checklist.groups.map((g, gi) => ({
        title: g.title,
        items: g.items.map((text, ii) => ({
          text,
          key: `${gi}-${ii}`,
          done: !!checked[`${gi}-${ii}`],
        })),
      })),
    });
    wx.setNavigationBarTitle({ title: data.card.title });
    this.refreshMap();
  },

  onReady() {
    this.mapCtx = wx.createMapContext("trip-map", this);
  },

  onShow() {
    const app = getApp();
    this.setData({
      scaleClass: this.scaleClass(app.globalData.textScale),
      favorite: app.isFavorite(this._slug),
    });
    this.loadUserPhotos();
  },

  // ============ 实拍打卡 ============

  formatTime(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const p = (n) => (n < 10 ? "0" + n : "" + n);
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  },

  loadUserPhotos() {
    const env = getApp().globalData.cloudEnv;
    if (!env || !wx.cloud) {
      this.setData({ userPhotos: [] });
      return;
    }
    wx.cloud
      .database()
      .collection("user_photos")
      .where({ journeySlug: this._slug })
      .orderBy("createdAt", "desc")
      .limit(30)
      .get()
      .then((res) => {
        this.setData({
          userPhotos: res.data.map((d) => ({ ...d, timeText: this.formatTime(d.takenAt) })),
        });
      })
      .catch(() => this.setData({ userPhotos: [] }));
  },

  onTakePhoto() {
    photo.run({
      places: data.trip.places,
      journeySlug: this._slug,
      onDone: (result, poiId) => {
        this.loadUserPhotos();
        if (poiId && poiId !== "__unmatched__") {
          wx.navigateTo({ url: `/journeys/${data.slug}/poi/poi?id=${poiId}` });
        }
      },
    });
  },

  onPhotoTap(e) {
    const poiId = e.currentTarget.dataset.poiId;
    if (poiId && poiId !== "__unmatched__") {
      wx.navigateTo({ url: `/journeys/${data.slug}/poi/poi?id=${poiId}` });
    }
  },

  deletePhoto(e) {
    const { id, fileid } = e.currentTarget.dataset;
    wx.showModal({
      title: "删除这张实拍？",
      content: "照片与分析记录会从云端一并删除",
      confirmText: "删除",
      confirmColor: "#e55748",
      success: (r) => {
        if (!r.confirm) return;
        wx.cloud
          .callFunction({ name: "analyze-photo", data: { action: "delete", id, fileID: fileid } })
          .then(() => this.loadUserPhotos())
          .catch(() => wx.showToast({ title: "删除失败", icon: "none" }));
      },
    });
  },

  scaleClass(scale) {
    return scale >= 1.5 ? "scale-3x" : scale > 1 ? "scale-2x" : "scale-1x";
  },

  polylineFor(d) {
    return {
      points: d.route.map(([lng, lat]) => ({ longitude: lng, latitude: lat })),
      color: d.color,
      width: 6,
      arrowLine: true,
    };
  },

  refreshMap() {
    const { category, day } = this.data;
    const markers = data.trip.places
      .filter((p) => (category === "all" || p.category === category) && placeInDay(p, day))
      .map((p) => {
        const terminal = data.config.terminalPlaceId === p.id;
        return {
          id: p.id,
          latitude: p.coords[1],
          longitude: p.coords[0],
          iconPath: terminal ? "/assets/markers/terminal.png" : `/assets/markers/${p.category}.png`,
          width: terminal ? 32 : 24,
          height: terminal ? 32 : 24,
        };
      });
    const polylines = [];
    if (day === 0) {
      for (const d of data.trip.days) {
        if (d.route.length >= 2) polylines.push(this.polylineFor(d));
      }
    } else {
      const d = data.trip.days.find((x) => x.day === day);
      if (d && d.route.length >= 2) polylines.push(this.polylineFor(d));
    }
    for (const road of data.config.closedRoads) {
      polylines.push({
        points: road.path.map(([lng, lat]) => ({ longitude: lng, latitude: lat })),
        color: road.color,
        width: 5,
        dottedLine: true,
      });
    }
    this.setData({ markers, polylines });
  },

  fitView() {
    if (!this.mapCtx) return;
    const { day } = this.data;
    let points;
    if (day === 0) {
      points = data.trip.places.map((p) => ({ latitude: p.coords[1], longitude: p.coords[0] }));
    } else {
      const d = data.trip.days.find((x) => x.day === day);
      points = (d ? d.route : []).map(([lng, lat]) => ({ longitude: lng, latitude: lat }));
      if (points.length === 1) {
        points.push({ longitude: points[0].longitude + 0.01, latitude: points[0].latitude + 0.01 });
      }
      if (points.length === 0) {
        points = data.trip.places
          .filter((p) => placeInDay(p, day))
          .map((p) => ({ latitude: p.coords[1], longitude: p.coords[0] }));
      }
    }
    if (points.length > 0) {
      this.mapCtx.includePoints({ points, padding: [80, 80, 80, 80] });
    }
  },

  onMapUpdated() {
    if (!this.data.mapReady) {
      this.setData({ mapReady: true, mapStatus: "地图已连接" });
      this.fitView();
    }
  },

  tapCategory(e) {
    this.setData({ category: e.currentTarget.dataset.key });
    this.refreshMap();
  },

  tapDay(e) {
    this.setData({ day: e.currentTarget.dataset.day });
    this.refreshMap();
    this.fitView();
  },

  scrollToAnchor(anchor) {
    if (!anchor) return;
    // 吸顶导航高度约 45px，offsetTop 让目标区块顶到导航下方
    wx.pageScrollTo({
      selector: `#${anchor}`,
      offsetTop: -45,
      duration: 300,
      fail: () => {
        // 低版本基础库不支持 selector：测量目标位置后按 scrollTop 滚动
        wx.createSelectorQuery()
          .select(`#${anchor}`)
          .boundingClientRect((rect) => {
            if (rect) wx.pageScrollTo({ scrollTop: rect.top, duration: 300 });
          })
          .exec();
      },
    });
  },

  jumpTo(e) {
    const anchor = e.currentTarget.dataset.anchor;
    this.setData({ anchor });
    this.scrollToAnchor(anchor);
  },

  onMarkerTap(e) {
    const place = data.trip.places.find((p) => p.id === e.detail.markerId);
    if (!place) return;
    this.setData({
      selectedPlace: {
        place,
        catLabel: CAT_LABELS[place.category],
        catColor: CAT_COLORS[place.category],
      },
    });
  },

  openDetail() {
    wx.navigateTo({
      url: `/journeys/${data.slug}/poi/poi?id=${this.data.selectedPlace.place.id}`,
    });
  },

  openNavigate() {
    const p = this.data.selectedPlace.place;
    wx.openLocation({ latitude: p.coords[1], longitude: p.coords[0], name: p.name, scale: 14 });
  },

  openStop(e) {
    wx.navigateTo({ url: `/journeys/${data.slug}/poi/poi?id=${e.currentTarget.dataset.id}` });
  },

  openRoute(e) {
    const day = e.currentTarget.dataset.day;
    wx.navigateTo({ url: `/journeys/${data.slug}/route/route?day=${day}` });
  },

  toggleCheck(e) {
    const { gi, ii, key } = e.currentTarget.dataset;
    const done = !this.data.checklistGroups[gi].items[ii].done;
    this.setData({ [`checklistGroups[${gi}].items[${ii}].done`]: done });
    const stored = wx.getStorageSync(`kej:checklist:${this._slug}`) || {};
    stored[key] = done;
    wx.setStorageSync(`kej:checklist:${this._slug}`, stored);
  },

  toggleFavorite() {
    const favorite = getApp().toggleFavorite(this._slug);
    this.setData({ favorite });
    wx.showToast({ title: favorite ? "已收藏" : "已取消收藏", icon: "none" });
  },

  focusAlertDay() {
    const day = this.data.roads.alert ? this.data.roads.alert.focusDay : 0;
    if (day) {
      this.setData({ day, anchor: "sec-map" });
      this.refreshMap();
      this.fitView();
      this.scrollToAnchor("sec-map");
    }
  },

  onShareAppMessage() {
    return {
      title: `${data.card.title} · 自驾路书`,
      path: `/journeys/${data.slug}/trip/trip?slug=${data.slug}`,
    };
  },
});
