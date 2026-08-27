// 旅途实拍模块（分包内共享）：
// 拍照 → 定位 → 匹配最近旅程节点 → 上传云存储 → 云函数 DeepSeek 视觉分析 → 归档展示
const THRESHOLD_KM = 10; // 超过 10 公里视为未匹配节点

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

function nearestPlace(places, lat, lng) {
  let best = null;
  let bestKm = Infinity;
  for (const p of places) {
    const km = haversineKm(lat, lng, p.coords[1], p.coords[0]);
    if (km < bestKm) {
      bestKm = km;
      best = p;
    }
  }
  return { place: best, km: bestKm };
}

function cloudReady() {
  const env = getApp().globalData.cloudEnv;
  if (!env) {
    wx.showToast({ title: "未配置云开发环境ID", icon: "none" });
    return false;
  }
  return true;
}

function ensurePrivacy() {
  return new Promise((resolve) => {
    if (wx.requirePrivacyAuthorize) {
      wx.requirePrivacyAuthorize({
        success: () => resolve(true),
        fail: () => {
          wx.showToast({ title: "需同意隐私协议后才能拍照打卡", icon: "none" });
          resolve(false);
        },
      });
    } else {
      resolve(true);
    }
  });
}

function choosePhoto() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["camera"],
      sizeType: ["compressed"],
      camera: "back",
      success: (res) => resolve(res.tempFiles[0].tempFilePath),
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf("cancel") >= 0) resolve(null);
        else reject(err);
      },
    });
  });
}

function getLocation() {
  return new Promise((resolve) => {
    wx.getLocation({
      type: "gcj02",
      isHighAccuracy: true,
      success: (res) => resolve({ lat: res.latitude, lng: res.longitude }),
      fail: () => resolve(null),
    });
  });
}

async function analyze(fileID, journeySlug, poiId, place, km, takenAt, lat, lng) {
  const res = await wx.cloud.callFunction({
    name: "analyze-photo",
    data: {
      action: "analyze",
      fileID,
      journeySlug,
      poiId,
      placeName: place ? place.name : "未匹配节点",
      region: place ? place.region : "",
      takenAt,
      lat,
      lng,
      distanceKm: km,
    },
  });
  const result = res.result || {};
  if (!result.ok) throw new Error(result.error || "分析失败");
  return result;
}

// 完整拍照打卡流程。成功后返回：
// { fileID, category, categoryLabel, caption, poiId, placeName, region,
//   distanceKm, nearestName, nearestKm, assigned }
// assigned=false 表示超出匹配阈值（照片进入「未归档」，可在实拍足迹里手动归属）。
// onDone(result) 在归档完成后触发（用于刷新列表）。
async function run({ places, journeySlug, preferredPoiId = null, onDone = null }) {
  if (!cloudReady()) return null;
  if (!(await ensurePrivacy())) return null;
  const filePath = await choosePhoto();
  if (!filePath) return null;

  const takenAt = new Date().toISOString();
  const loc = await getLocation();

  let target = null;
  let km = null;
  if (loc) {
    const match = nearestPlace(places, loc.lat, loc.lng);
    target = match.place;
    km = match.km;
  }

  let poiId;
  if (preferredPoiId) poiId = preferredPoiId;
  else if (target && km <= THRESHOLD_KM) poiId = target.id;
  else poiId = "__unmatched__";

  wx.showLoading({ title: "上传并分析中…", mask: true });
  try {
    const ext = (filePath.split(".").pop() || "jpg").toLowerCase();
    const cloudPath = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const up = await wx.cloud.uploadFile({ cloudPath, filePath });
    const result = await analyze(
      up.fileID,
      journeySlug,
      poiId,
      target,
      km,
      takenAt,
      loc ? loc.lat : null,
      loc ? loc.lng : null,
    );
    wx.hideLoading();
    const assigned = poiId !== "__unmatched__";
    const payload = {
      ...result,
      poiId,
      placeName: assigned && target ? target.name : "未归档",
      region: assigned && target ? target.region : "",
      distanceKm: km,
      nearestName: target ? target.name : null,
      nearestKm: km,
      assigned,
      hasLocation: !!loc,
    };
    if (onDone) onDone(payload);
    return payload;
  } catch (err) {
    wx.hideLoading();
    wx.showToast({ title: String((err && err.message) || err).slice(0, 40), icon: "none" });
    return null;
  }
}

module.exports = { run, nearestPlace, haversineKm, THRESHOLD_KM };
