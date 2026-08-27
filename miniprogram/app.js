// KEJourney 小程序全局状态：大字模式与收藏，均持久化到本地 storage。
const { cloudEnv } = require("./config.js");

const SCALE_KEY = "kej:textScale";
const FAV_KEY = "kej:favorites";

App({
  globalData: { textScale: 1, favorites: [], cloudEnv: cloudEnv || "" },

  onLaunch() {
    const scale = wx.getStorageSync(SCALE_KEY);
    if (typeof scale === "number" && scale >= 1 && scale <= 1.5) {
      this.globalData.textScale = scale;
    }
    const favs = wx.getStorageSync(FAV_KEY);
    if (Array.isArray(favs)) this.globalData.favorites = favs;
    // 云开发初始化（未配置环境 ID 时跳过，拍照功能降级提示）
    if (wx.cloud && cloudEnv) {
      wx.cloud.init({ env: cloudEnv, traceUser: true });
    }
    // 设备诊断信息（供真机问题排查，见「关于」页）
    try {
      const account = wx.getAccountInfoSync ? wx.getAccountInfoSync().miniProgram : null;
      const base = wx.getAppBaseInfo ? wx.getAppBaseInfo() : wx.getSystemInfoSync();
      const dev = wx.getDeviceInfo ? wx.getDeviceInfo() : {};
      wx.setStorageSync("kej:diagnostics", {
        platform: dev.platform || base.platform,
        system: dev.system || "",
        sdk: base.SDKVersion,
        envVersion: account ? account.envVersion : "unknown",
        version: account ? account.version : "unknown",
      });
    } catch (err) {
      wx.setStorageSync("kej:diagnostics", { error: String(err) });
    }
  },

  setTextScale(scale) {
    this.globalData.textScale = scale;
    wx.setStorageSync(SCALE_KEY, scale);
  },

  isFavorite(slug) {
    return this.globalData.favorites.indexOf(slug) >= 0;
  },

  toggleFavorite(slug) {
    const favs = this.globalData.favorites;
    const i = favs.indexOf(slug);
    if (i >= 0) favs.splice(i, 1);
    else favs.push(slug);
    wx.setStorageSync(FAV_KEY, favs);
    return this.isFavorite(slug);
  },
});
