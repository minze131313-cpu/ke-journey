// 首页：旅程目录（data/journeys.json 驱动，与 Web 版 registry 同源）
const { journeys } = require("../../data/journeys.js");

const SCALE_LABELS = { 1: "标准", 1.25: "大", 1.5: "特大" };

Page({
  data: { items: [], scaleClass: "scale-1x", scaleLabel: "标准", imgErrors: [] },

  onShow() {
    this.refresh();
  },

  refresh() {
    const app = getApp();
    const scale = app.globalData.textScale;
    this.setData({
      items: journeys.map((entry) => ({
        ...entry.card,
        slug: entry.slug,
        // 本地图片使用相对路径（从本页 pages/index/ 起算）
        image: entry.card.image.replace("/assets/cards/", "../../assets/cards/"),
        stats: [entry.card.days, entry.card.distance, entry.card.season, entry.card.difficulty],
        favorite: app.isFavorite(entry.slug),
      })),
      scaleClass: scale >= 1.5 ? "scale-3x" : scale > 1 ? "scale-2x" : "scale-1x",
      scaleLabel: SCALE_LABELS[scale] || "标准",
    });
  },

  onImgError(e) {
    const item = {
      page: "index",
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

  openJourney(e) {
    wx.navigateTo({ url: `/journeys/${e.currentTarget.dataset.slug}/trip/trip` });
  },

  toggleFavorite(e) {
    const { slug, index } = e.currentTarget.dataset;
    const favorite = getApp().toggleFavorite(slug);
    this.setData({ [`items[${index}].favorite`]: favorite });
    wx.showToast({ title: favorite ? "已收藏" : "已取消收藏", icon: "none" });
  },

  cycleTextScale() {
    const app = getApp();
    const next = app.globalData.textScale >= 1.5 ? 1 : app.globalData.textScale >= 1.25 ? 1.5 : 1.25;
    app.setTextScale(next);
    this.refresh();
  },

  openAbout() {
    wx.navigateTo({ url: "/pages/about/about" });
  },

  onShareAppMessage() {
    return { title: "KEJourney · 自驾旅行路书", path: "/pages/index/index" };
  },
});
