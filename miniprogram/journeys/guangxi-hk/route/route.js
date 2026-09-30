// 逐日路线详情页：对应 Web 版 app/[journey]/route/[day]/page.tsx
const data = require("../data.js");

// 本地图片：数据中的根绝对路径 → 相对本页（journeys/<slug>/route/）的相对路径
function rel(src) {
  return src.replace(/^\/journeys\/[^/]+\/assets\//, "../assets/");
}

Page({
  data: {
    day: 0,
    detail: null,
    galleryItems: [],
    galleryIndex: 0,
    sections: [],
    sources: [],
    cautions: [],
    rhythm: [],
    stats: [],
    prev: null,
    next: null,
    slug: data.slug,
    cardTitle: data.card.title,
    scaleClass: "scale-1x",
    imgErrors: [],
    dayMarkers: [],
    dayPolylines: [],
    dayMapReady: false,
  },

  onLoad(options) {
    const day = Number(options.day);
    const detail = data.routeDetails[String(day)];
    if (!detail) {
      this.setData({ day });
      return;
    }
    const days = data.trip.days;
    const idx = days.findIndex((d) => d.day === day);
    this.setData({
      day,
      detail: { ...detail, hero: { ...detail.hero, src: rel(detail.hero.src) } },
      galleryItems: detail.gallery.map((a) => ({
        src: rel(a.src),
        caption: a.caption,
        credit: a.credit,
        contextLabel: a.contextLabel || "",
      })),
      dayMarkers: this.buildDayMarkers(detail),
      dayPolylines: this.buildDayPolylines(detail),
      sections: detail.sections,
      sources: detail.sources.map((s) => ({
        name: s.name,
        meta: [s.publisher, s.note].filter(Boolean).join(" · "),
        url: s.url,
      })),
      cautions: detail.cautions,
      rhythm: detail.rhythm,
      stats: detail.stats,
      prev: idx > 0 ? days[idx - 1].day : null,
      next: idx < days.length - 1 ? days[idx + 1].day : null,
      scaleClass: this.scaleClass(getApp().globalData.textScale),
    });
    wx.setNavigationBarTitle({ title: `D${day} · ${detail.day.title}` });
  },

  onShow() {
    this.setData({ scaleClass: this.scaleClass(getApp().globalData.textScale) });
  },

  // 当天路线地图（辅助参考）：当天节点 + 当天折线 + 封闭路段虚线
  buildDayMarkers(detail) {
    return detail.day.stops.map((id) => {
      const p = data.poiDetails[id].place;
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
  },

  buildDayPolylines(detail) {
    const polylines = [];
    if (detail.day.route.length >= 2) {
      polylines.push({
        points: detail.day.route.map(([lng, lat]) => ({ longitude: lng, latitude: lat })),
        color: detail.day.color,
        width: 6,
        arrowLine: true,
      });
    }
    for (const road of data.config.closedRoads) {
      polylines.push({
        points: road.path.map(([lng, lat]) => ({ longitude: lng, latitude: lat })),
        color: road.color,
        width: 5,
        dottedLine: true,
      });
    }
    return polylines;
  },

  onReady() {
    this.dayMapCtx = wx.createMapContext("day-map", this);
  },

  onDayMapUpdated() {
    if (this.data.dayMapReady) return;
    const route = this.data.detail.day.route;
    const points = route.map(([lng, lat]) => ({ longitude: lng, latitude: lat }));
    if (points.length === 1) {
      points.push({ longitude: points[0].longitude + 0.01, latitude: points[0].latitude + 0.01 });
    }
    if (points.length > 0 && this.dayMapCtx) {
      this.dayMapCtx.includePoints({ points, padding: [70, 70, 70, 70] });
    }
    this.setData({ dayMapReady: true });
  },

  openFullMap() {
    wx.navigateTo({ url: `/journeys/${data.slug}/trip/trip` });
  },

  scaleClass(scale) {
    return scale >= 1.5 ? "scale-3x" : scale > 1 ? "scale-2x" : "scale-1x";
  },

  onGalleryChange(e) {
    this.setData({ galleryIndex: e.detail.current });
  },

  onImgError(e) {
    const item = {
      page: "route",
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

  goDay(e) {
    const day = e.currentTarget.dataset.day;
    if (!day) return;
    wx.redirectTo({ url: `/journeys/${data.slug}/route/route?day=${day}` });
  },

  onShareAppMessage() {
    return {
      title: `D${this.data.day} ${this.data.detail.day.title} · ${data.card.title}`,
      path: `/journeys/${data.slug}/route/route?day=${this.data.day}`,
    };
  },
});
