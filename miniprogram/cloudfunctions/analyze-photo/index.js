// 云函数 analyze-photo：旅途实拍的照片分析与影像库
// 环境变量（云开发控制台「云函数-配置-环境变量」）：
//   DEEPSEEK_API_KEY  必填，platform.deepseek.com 的 API Key
//   DEEPSEEK_MODEL    可选，默认 deepseek-v4-flash-vision-exp
//   DEEPSEEK_BASE_URL 可选，默认 https://api.deepseek.com
//   TENCENT_LBS_KEY   可选，腾讯位置服务 WebService Key（逆地址解析；缺省时地点·城市标签为空）
// 动作：analyze（拍照归档+分析）/ assign（手动归属节点）/ set-phase（手动改旅程阶段）/
//       re-analyze（重新分析）/ delete（删除）
const cloud = require("wx-server-sdk");
const https = require("https");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const COLLECTION = "user_photos";
const DEFAULT_MODEL = "deepseek-v4-flash-vision-exp";
const DEFAULT_BASE = "https://api.deepseek.com";

const PHASES = ["before", "outbound", "journey", "returning", "ended"];
const PHASE_LABELS = {
  before: "出发前",
  outbound: "去程中",
  journey: "旅程中",
  returning: "回程中",
  ended: "已结束",
};
const ANCHOR_PHASES = ["outbound", "journey", "returning"];

const CATEGORIES = ["scenic", "city", "supply", "warning"];
const CATEGORY_LABELS = { scenic: "景点", city: "城镇住宿", supply: "补给", warning: "风险路段" };

const PHOTO_TYPES = ["landscape", "architecture", "people", "road", "vehicle", "food", "animal", "plant", "water", "sky", "night"];
const PHOTO_TYPE_LABELS = {
  landscape: "风景", architecture: "人文建筑", people: "人物", road: "道路", vehicle: "车辆",
  food: "美食", animal: "动物", plant: "植物", water: "水面", sky: "天空与光线", night: "夜景",
};

const WEATHERS = ["sunny", "cloudy", "overcast", "rain", "snow", "fog", "indoor"];
const WEATHER_LABELS = {
  sunny: "晴", cloudy: "多云", overcast: "阴", rain: "雨", snow: "雪", fog: "雾", indoor: "室内",
};

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        raw += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(raw);
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    });
    req.on("error", reject);
  });
}

function httpsPost(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        raw += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(raw);
        else reject(new Error(`DeepSeek HTTP ${res.statusCode}: ${raw.slice(0, 300)}`));
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// ============ 地理计算 ============

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

function pointToSegmentKm(lat, lng, a, b) {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const kx = Math.cos((lat1 + lat2) / 2 * Math.PI / 180) * 111.32;
  const ky = 110.95;
  const x = (lng - lng1) * kx;
  const y = (lat - lat1) * ky;
  const dx = (lng2 - lng1) * kx;
  const dy = (lat2 - lat1) * ky;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : (x * dx + y * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = t * dx;
  const py = t * dy;
  return Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
}

function minDistToRoute(lat, lng, places, routes) {
  let dNode = Infinity;
  for (const p of places || []) {
    const d = haversineKm(lat, lng, p.coords[1], p.coords[0]);
    if (d < dNode) dNode = d;
  }
  let dLine = Infinity;
  for (const route of routes || []) {
    if (!Array.isArray(route) || route.length < 2) continue;
    for (let i = 0; i < route.length - 1; i++) {
      const d = pointToSegmentKm(lat, lng, route[i], route[i + 1]);
      if (d < dLine) dLine = d;
    }
  }
  return Math.min(dNode, dLine);
}

// ============ 旅程阶段判定引擎 ============
// 规则（按优先级）：
// 1. 距节点 ≤10km 或距路线折线 ≤5km → 旅程中；已存在锚点时 ≤50km 也视为旅程中
// 2. 轨迹收敛（最近 3 张最小距离递减 ≥15%）→ 去程中
// 3. 已有锚点且轨迹发散 → 回程中；无锚点发散 → 出发前
// 4. 轨迹平稳：有锚点 → 已结束；无锚点 → 出发前

function trendAt(dists, i) {
  const recent = dists.slice(Math.max(0, i - 2), i + 1).map((x) => x.d);
  if (recent.length < 2) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  const change = (first - last) / Math.max(first, 1);
  if (change >= 0.15) return -1; // 收敛
  if (change <= -0.15) return 1; // 发散
  return 0; // 平稳
}

function classifyPhotos(photos, places, routes) {
  const dists = photos.map((p) => ({
    p,
    d: minDistToRoute(p.lat, p.lng, places, routes),
  }));
  let hasAnchor = false;
  const out = [];
  for (let i = 0; i < dists.length; i++) {
    const { p, d } = dists[i];
    if (p.phaseManual && PHASES.includes(p.phase)) {
      if (ANCHOR_PHASES.includes(p.phase)) hasAnchor = true;
      out.push(p.phase);
      continue;
    }
    let phase;
    if (d <= 10 || (hasAnchor && d <= 50)) {
      phase = "journey";
    } else {
      const trend = trendAt(dists, i);
      if (trend < 0) phase = "outbound";
      else if (trend > 0) phase = hasAnchor ? "returning" : "before";
      else phase = hasAnchor ? "ended" : "before";
    }
    if (ANCHOR_PHASES.includes(phase)) hasAnchor = true;
    out.push(phase);
  }
  return out;
}

// ============ 逆地址解析（腾讯位置服务，可选） ============

async function reverseGeocode(lat, lng) {
  const key = process.env.TENCENT_LBS_KEY;
  if (!key || typeof lat !== "number" || typeof lng !== "number") return null;
  try {
    const url =
      `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${encodeURIComponent(key)}`;
    const raw = await httpsGet(url);
    const data = JSON.parse(raw);
    if (data.status !== 0 || !data.result || !data.result.ad_info) return null;
    const ad = data.result.ad_info;
    return {
      province: ad.province || "",
      city: ad.city || "",
      district: ad.district || "",
    };
  } catch (err) {
    return null;
  }
}

// ============ DeepSeek 视觉分析 ============

async function analyzeImage(base64, context) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("云函数未配置 DEEPSEEK_API_KEY");
  const base = process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE;
  const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;

  const prompt =
    "你是自驾路书助手。请对一张旅途实拍照片完成以下工作：" +
    "1) category 分类：scenic景点/city城镇住宿/supply补给/warning风险路段 选一个；" +
    "2) photoType 照片类型：landscape风景/architecture人文建筑/people人物/road道路/vehicle车辆/food美食/animal动物/plant植物/water水面/sky天空与光线/night夜景 选一个；" +
    "3) weather 天气：sunny晴/cloudy多云/overcast阴/rain雨/snow雪/fog雾/indoor室内 选一个；" +
    "4) caption 一句话：结合拍摄时间、地点与画面内容的中文短句，不超过40字，客观克制，不用表情；" +
    "5) monologue 独白：80~150字第一人称「我」的旅行者口吻独白，结合时间、地点、画面与当前旅程阶段，温暖编辑风、克制、中文标点。" +
    `拍摄时间：${context.takenAt}；地点：${context.placeName || "未知"}${context.region ? "（" + context.region + "）" : ""}` +
    (context.city ? `；所在城市：${context.city} ${context.district || ""}` : "") +
    (typeof context.distanceKm === "number" ? `；距最近节点约 ${context.distanceKm.toFixed(1)} 公里` : "") +
    `；当前旅程阶段：${context.phaseLabel || "未知"}。` +
    "只输出 JSON：{\"category\":\"...\",\"photoType\":\"...\",\"weather\":\"...\",\"caption\":\"...\",\"monologue\":\"...\"}";

  const requestBody = {
    model,
    messages: [
      {
        role: "system",
        content:
          "你是自驾路书助手。只输出一个 JSON 对象（含 category/photoType/weather/caption/monologue 五个字段），不要输出任何解释文字。",
      },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
          { type: "text", text: prompt },
        ],
      },
    ],
    max_tokens: 1400,
    temperature: 0.7,
  };

  const doRequest = async (body) =>
    httpsPost(
      {
        hostname: new URL(base).hostname,
        path: "/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        timeout: 60000,
      },
      JSON.stringify(body),
    );

  let raw;
  try {
    raw = await doRequest({ ...requestBody, response_format: { type: "json_object" } });
  } catch (err) {
    raw = await doRequest(requestBody);
  }

  const data = JSON.parse(raw);
  const choice = data.choices && data.choices[0];
  const message = (choice && choice.message) || {};
  let content = message.content || "";
  if (!content && message.reasoning_content) content = message.reasoning_content;
  if (!content) {
    throw new Error(`模型返回为空（finish=${choice && choice.finish_reason}）：` + raw.slice(0, 200));
  }
  const cleaned = String(content).replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("模型输出不是 JSON：" + cleaned.slice(0, 200));
  const parsed = JSON.parse(match[0]);
  return {
    category: CATEGORIES.includes(parsed.category) ? parsed.category : "scenic",
    categoryLabel: CATEGORY_LABELS[CATEGORIES.includes(parsed.category) ? parsed.category : "scenic"],
    photoType: PHOTO_TYPES.includes(parsed.photoType) ? parsed.photoType : "landscape",
    weather: WEATHERS.includes(parsed.weather) ? parsed.weather : "sunny",
    caption: String(parsed.caption || "").slice(0, 80) || "旅途实拍",
    monologue: String(parsed.monologue || "").slice(0, 200) || "",
  };
}

// ============ 标签计算 ============

function timeBucket(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const h = d.getHours();
  if (h >= 5 && h < 9) return "清晨";
  if (h >= 9 && h < 12) return "上午";
  if (h >= 12 && h < 16) return "午后";
  if (h >= 16 && h < 19) return "傍晚";
  return "夜间";
}

function season(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const m = d.getMonth() + 1;
  if (m >= 3 && m <= 5) return "春季";
  if (m >= 6 && m <= 8) return "夏季";
  if (m >= 9 && m <= 11) return "秋季";
  return "冬季";
}

function buildTags({ phase, city, dayText, bucket, sea, photoType, weather, categoryLabel }) {
  const tags = [];
  if (phase) tags.push(PHASE_LABELS[phase] || phase);
  if (city) tags.push(city);
  if (dayText) tags.push(dayText);
  if (bucket) tags.push(bucket);
  if (sea) tags.push(sea);
  if (photoType) tags.push(PHOTO_TYPE_LABELS[photoType] || photoType);
  if (weather) tags.push(WEATHER_LABELS[weather] || weather);
  if (categoryLabel) tags.push(categoryLabel);
  return [...new Set(tags)];
}

// ============ 工具 ============

async function ensureCollection(db) {
  try {
    await db.createCollection(COLLECTION);
  } catch (err) {
    /* 已存在 */
  }
}

async function fetchHistory(db, OPENID, journeySlug) {
  const res = await db
    .collection(COLLECTION)
    .where({ openid: OPENID, journeySlug })
    .limit(500)
    .get();
  return (res.data || []).sort(
    (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime(),
  );
}

// 重算全库阶段（仅自动标签），返回变更数
async function refreshPhases(db, OPENID, journeySlug, places, routes) {
  const history = await fetchHistory(db, OPENID, journeySlug);
  const phases = classifyPhotos(history, places, routes);
  let changed = 0;
  for (let i = 0; i < history.length; i++) {
    const doc = history[i];
    if (doc.phaseManual) continue;
    if (doc.phase !== phases[i]) {
      await db.collection(COLLECTION).doc(doc._id).update({
        data: { phase: phases[i], phaseLabel: PHASE_LABELS[phases[i]] },
      });
      changed++;
    }
  }
  return changed;
}

// ============ 主入口 ============

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "analyze";
  const db = cloud.database();
  await ensureCollection(db);

  // ---------- 拍照归档 + 分析 ----------
  if (action === "analyze") {
    const {
      fileID, journeySlug, poiId, placeName, region, takenAt, lat, lng, distanceKm,
      places, routes,
    } = event;
    if (!fileID) return { ok: false, error: "缺少 fileID" };

    // 1) 计算当前照片的旅程阶段（历史 + 本张）
    const history = await fetchHistory(db, OPENID, journeySlug);
    const withNew = history.concat([
      {
        takenAt: takenAt || new Date().toISOString(),
        lat: typeof lat === "number" ? lat : null,
        lng: typeof lng === "number" ? lng : null,
        phaseManual: false,
      },
    ]);
    const phases = classifyPhotos(withNew, places, routes);
    const phase = phases[phases.length - 1];
    const phaseLabel = PHASE_LABELS[phase];

    // 2) 逆地址解析（可选）
    const geo = await reverseGeocode(lat, lng);

    // 3) 视觉分析（独白结合阶段与地址语境）
    const download = await cloud.downloadFile({ fileID });
    const base64 = download.fileContent.toString("base64");
    const vision = await analyzeImage(base64, {
      takenAt,
      placeName,
      region,
      city: geo ? geo.city : null,
      district: geo ? geo.district : null,
      distanceKm,
      phaseLabel,
    });

    // 4) 标签
    const day = poiId && poiId !== "__unmatched__" && places
      ? places.find((p) => p.id === poiId)
      : null;
    const dayText = day ? `D${day.day}` : null;
    const tags = buildTags({
      phase,
      city: geo ? geo.city || geo.province : null,
      dayText,
      bucket: timeBucket(takenAt),
      sea: season(takenAt),
      photoType: vision.photoType,
      weather: vision.weather,
      categoryLabel: vision.categoryLabel,
    });

    const doc = {
      _openid: OPENID,
      openid: OPENID,
      journeySlug: journeySlug || "",
      poiId: poiId || "__unmatched__",
      fileID,
      placeName: placeName || "",
      region: region || "",
      category: vision.category,
      categoryLabel: vision.categoryLabel,
      photoType: vision.photoType,
      weather: vision.weather,
      caption: vision.caption,
      monologue: vision.monologue,
      phase,
      phaseLabel,
      phaseManual: false,
      province: geo ? geo.province : "",
      city: geo ? geo.city : "",
      district: geo ? geo.district : "",
      timeBucket: timeBucket(takenAt) || "",
      season: season(takenAt) || "",
      tags,
      takenAt: takenAt || new Date().toISOString(),
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      distanceKm: typeof distanceKm === "number" ? Math.round(distanceKm * 10) / 10 : null,
      createdAt: db.serverDate(),
    };
    const res = await db.collection(COLLECTION).add({ data: doc });

    // 5) 重算既有照片阶段（新照片可能成为锚点）
    const changed = await refreshPhases(db, OPENID, journeySlug, places, routes);

    return {
      ok: true,
      id: res._id,
      category: vision.category,
      categoryLabel: vision.categoryLabel,
      photoType: vision.photoType,
      weather: vision.weather,
      caption: vision.caption,
      monologue: vision.monologue,
      phase,
      phaseLabel,
      city: geo ? geo.city : "",
      tags,
      fileID,
      phaseChanged: changed,
    };
  }

  // ---------- 手动归属节点 ----------
  if (action === "assign") {
    const { id, poiId, placeName, region, distanceKm } = event;
    if (!id || !poiId) return { ok: false, error: "缺少 id 或 poiId" };
    const getRes = await db.collection(COLLECTION).where({ _id: id, openid: OPENID }).get();
    if (!getRes.data || getRes.data.length === 0) return { ok: false, error: "记录不存在或无权操作" };
    const patch = { poiId, placeName: placeName || "", region: region || "" };
    if (typeof distanceKm === "number") patch.distanceKm = Math.round(distanceKm * 10) / 10;
    await db.collection(COLLECTION).doc(id).update({ data: patch });
    return { ok: true };
  }

  // ---------- 手动修改旅程阶段 ----------
  if (action === "set-phase") {
    const { id, phase } = event;
    if (!id || !PHASES.includes(phase)) return { ok: false, error: "参数不合法" };
    const getRes = await db.collection(COLLECTION).where({ _id: id, openid: OPENID }).get();
    if (!getRes.data || getRes.data.length === 0) return { ok: false, error: "记录不存在或无权操作" };
    await db.collection(COLLECTION).doc(id).update({
      data: { phase, phaseLabel: PHASE_LABELS[phase], phaseManual: true },
    });
    return { ok: true };
  }

  // ---------- 重新分析 ----------
  if (action === "re-analyze") {
    const { id, places, routes } = event;
    if (!id) return { ok: false, error: "缺少 id" };
    const getRes = await db.collection(COLLECTION).where({ _id: id, openid: OPENID }).get();
    if (!getRes.data || getRes.data.length === 0) return { ok: false, error: "记录不存在或无权操作" };
    const doc = getRes.data[0];

    const history = await fetchHistory(db, OPENID, doc.journeySlug);
    const idx = history.findIndex((h) => h._id === id);
    if (idx < 0) return { ok: false, error: "记录不在历史中" };
    const phases = classifyPhotos(history, places, routes);
    const phase = phases[idx];
    const phaseLabel = PHASE_LABELS[phase];

    const geo = await reverseGeocode(doc.lat, doc.lng);
    const download = await cloud.downloadFile({ fileID: doc.fileID });
    const base64 = download.fileContent.toString("base64");
    const vision = await analyzeImage(base64, {
      takenAt: doc.takenAt,
      placeName: doc.placeName,
      region: doc.region,
      city: geo ? geo.city : null,
      district: geo ? geo.district : null,
      distanceKm: doc.distanceKm,
      phaseLabel,
    });

    const day = doc.poiId && doc.poiId !== "__unmatched__" && places
      ? places.find((p) => p.id === doc.poiId)
      : null;
    const tags = buildTags({
      phase,
      city: geo ? geo.city || geo.province : doc.city,
      dayText: day ? `D${day.day}` : null,
      bucket: timeBucket(doc.takenAt),
      sea: season(doc.takenAt),
      photoType: vision.photoType,
      weather: vision.weather,
      categoryLabel: vision.categoryLabel,
    });

    await db.collection(COLLECTION).doc(id).update({
      data: {
        category: vision.category,
        categoryLabel: vision.categoryLabel,
        photoType: vision.photoType,
        weather: vision.weather,
        caption: vision.caption,
        monologue: vision.monologue,
        phase,
        phaseLabel,
        phaseManual: false,
        province: geo ? geo.province : doc.province || "",
        city: geo ? geo.city : doc.city || "",
        district: geo ? geo.district : doc.district || "",
        timeBucket: timeBucket(doc.takenAt) || "",
        season: season(doc.takenAt) || "",
        tags,
      },
    });

    await refreshPhases(db, OPENID, doc.journeySlug, places, routes);
    return {
      ok: true,
      category: vision.category,
      caption: vision.caption,
      monologue: vision.monologue,
      phase,
      phaseLabel,
      tags,
    };
  }

  // ---------- 删除 ----------
  if (action === "delete") {
    const { id, fileID } = event;
    if (!id) return { ok: false, error: "缺少 id" };
    const getRes = await db.collection(COLLECTION).where({ _id: id, openid: OPENID }).get();
    if (!getRes.data || getRes.data.length === 0) return { ok: false, error: "记录不存在或无权删除" };
    await db.collection(COLLECTION).doc(id).remove();
    if (fileID) {
      try {
        await cloud.deleteFile({ fileList: [fileID] });
      } catch {
        /* 文件可能已删除，忽略 */
      }
    }
    return { ok: true };
  }

  return { ok: false, error: "未知 action：" + action };
};
