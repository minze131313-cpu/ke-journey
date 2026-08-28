// POI 详情页：对应 Web 版 app/[journey]/poi/[id]/page.tsx，按 poiOrder 提供前后导航。
const data = require("../data.js");
const photo = require("../utils/photo.js");

// 本地图片：数据中的根绝对路径 → 相对本页（journeys/<slug>/poi/）的相对路径
function rel(src) {
  return src.replace(/^\/journeys\/[^/]+\/assets\//, "../assets/");
}

Page({
  data: {
    id: "",
    detail: null,
    galleryItems: [],
    galleryIndex: 0,
    sections: [],
    highlights: [],
    actions: [],
    cautions: [],
    sources: [],
    stats: [],
    prev: null,
    next: null,
    slug: data.slug,
    cardTitle: data.card.title,
    scaleClass: "scale-1x",
    imgErrors: [],
    userPhotos: [],
    photoResult: null,
  },

  onLoad(options) {
    const id = options.id;
    this._id = id;
    const detail = data.poiDetails[id];
    if (!detail) {
      this.setData({ id });
      return;
    }
    const order = data.poiOrder;
    const idx = order.indexOf(id);
    this.setData({
      id,
      detail: { ...detail, hero: { ...detail.hero, src: rel(detail.hero.src) } },
      galleryItems: detail.gallery.map((a) => ({
        src: rel(a.src),
        caption: a.caption,
        credit: a.credit,
        contextLabel: a.contextLabel || "",
      })),
      sections: detail.sections,
      highlights: detail.highlights,
      actions: detail.actions,
      cautions: detail.cautions,
      sources: detail.sources.map((s) => ({
        name: s.name,
        meta: [s.publisher, s.note].filter(Boolean).join(" · "),
        url: s.url,
      })),
      stats: detail.stats,
      prev: idx > 0 ? order[idx - 1] : null,
      next: idx < order.length - 1 ? order[idx + 1] : null,
      scaleClass: this.scaleClass(getApp().globalData.textScale),
    });
    wx.setNavigationBarTitle({ title: detail.place.name });
  },

  onShow() {
    this.setData({ scaleClass: this.scaleClass(getApp().globalData.textScale) });
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
    if (!env || !wx.cloud || !this._id) {
      this.setData({ userPhotos: [] });
      return;
    }
    wx.cloud
      .database()
      .collection("user_photos")
      .where({ poiId: this._id })
      .orderBy("createdAt", "desc")
      .limit(20)
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
      routes: data.trip.days.map((d) => d.route),
      journeySlug: data.slug,
      preferredPoiId: this._id,
      onDone: (payload) => {
        this.loadUserPhotos();
        this.setData({
          photoResult: {
            ...payload,
            kmText: payload.distanceKm != null ? `约 ${payload.distanceKm.toFixed(1)} km` : "",
          },
        });
      },
    });
  },

  closeResult() {
    this.setData({ photoResult: null });
  },

  noop() {},

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

  onGalleryChange(e) {
    this.setData({ galleryIndex: e.detail.current });
  },

  onImgError(e) {
    const item = {
      page: "poi",
      name: e.currentTarget.dataset.name || "img",
      src: e.currentTarget.dataset.src || "",
      err: (e.detail && e.detail.errMsg) || "",
    };
    const list = this.data.imgErrors.slice();
    list.push(item);
    this.setData({ imgErrors: list });
    const all = wx.getStorageSync("kej:imgErrors") || [];
    all.push(item);
    wx.setStorageSync("kej:imgErrors", all);
  },

  copySource(e) {
    wx.setClipboardData({ data: e.currentTarget.dataset.url });
  },

  openNavigate() {
    const p = this.data.detail.place;
    wx.openLocation({ latitude: p.coords[1], longitude: p.coords[0], name: p.name, scale: 14 });
  },

  goNeighbor(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.redirectTo({ url: `/journeys/${data.slug}/poi/poi?id=${id}` });
  },

  onShareAppMessage() {
    const place = this.data.detail.place;
    return {
      title: `${place.name} · ${data.card.title}`,
      path: `/journeys/${data.slug}/poi/poi?id=${this.data.id}`,
    };
  },
});
