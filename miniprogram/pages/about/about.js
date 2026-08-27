Page({
  data: { diag: null, imgErrors: [] },

  onShow() {
    this.setData({
      diag: wx.getStorageSync("kej:diagnostics") || null,
      imgErrors: wx.getStorageSync("kej:imgErrors") || [],
    });
  },
});
