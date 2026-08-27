// 云函数 analyze-photo：旅途实拍照片的 DeepSeek 视觉分析 + 用户实拍管理
// 环境变量（云开发控制台「云函数-配置-环境变量」）：
//   DEEPSEEK_API_KEY  必填，platform.deepseek.com 的 API Key
//   DEEPSEEK_MODEL    可选，默认 deepseek-v4-flash-vision-exp
//   DEEPSEEK_BASE_URL 可选，默认 https://api.deepseek.com
const cloud = require("wx-server-sdk");
const https = require("https");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const COLLECTION = "user_photos";
const DEFAULT_MODEL = "deepseek-v4-flash-vision-exp";
const DEFAULT_BASE = "https://api.deepseek.com";
const CATEGORIES = ["scenic", "city", "supply", "warning"];
const CATEGORY_LABELS = { scenic: "景点", city: "城镇住宿", supply: "补给", warning: "风险路段" };

function httpsRequest(options, body) {
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

async function analyzeImage(base64, takenAt, placeName, region, distanceKm) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("云函数未配置 DEEPSEEK_API_KEY");
  const base = process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE;
  const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  const prompt =
    "你是自驾路书助手。请对一张旅途实拍照片完成两件事：" +
    "1) 分类：从「scenic景点 / city城镇住宿 / supply补给 / warning风险路段」中选择最合适的一个；" +
    "2) 一句话描述：结合拍摄时间、地点与画面内容，写一句适合旅行笔记的中文短句（不超过40字，客观、克制，不要表情符号）。" +
    `拍摄时间：${takenAt || "未知"}；地点：${placeName || "未知"}${region ? "（" + region + "）" : ""}` +
    (typeof distanceKm === "number" ? `；距该节点约 ${distanceKm.toFixed(1)} 公里。` : "。") +
    "只输出 JSON：{\"category\":\"scenic|city|supply|warning\",\"caption\":\"一句话\"}";

  const requestBody = {
    model,
    messages: [
      { role: "system", content: "你是自驾路书助手。只输出一个 JSON 对象（含 category 与 caption 两个字段），不要输出任何解释文字。" },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
          { type: "text", text: prompt },
        ],
      },
    ],
    max_tokens: 1200,
    temperature: 0.7,
  };

  const doRequest = async (body) =>
    httpsRequest(
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

  // 优先启用 JSON 对象输出；不支持时回退普通输出
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
  if (!content && message.reasoning_content) {
    content = message.reasoning_content;
  }
  if (!content) {
    throw new Error(
      `模型返回为空（finish=${choice && choice.finish_reason}）：` + raw.slice(0, 200),
    );
  }

  const cleaned = String(content).replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("模型输出不是 JSON：" + cleaned.slice(0, 200));
  const parsed = JSON.parse(match[0]);
  const category = CATEGORIES.includes(parsed.category) ? parsed.category : "scenic";
  const caption = String(parsed.caption || "").slice(0, 80) || "旅途实拍";
  return { category, categoryLabel: CATEGORY_LABELS[category], caption };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "analyze";
  const db = cloud.database();

  // 集合不存在时自动创建（幂等；已存在会抛错并忽略）
  async function ensureCollection() {
    try {
      await db.createCollection(COLLECTION);
    } catch (err) {
      /* 已存在 */
    }
  }

  if (action === "analyze") {
    const { fileID, journeySlug, poiId, placeName, region, takenAt, lat, lng, distanceKm } = event;
    if (!fileID) return { ok: false, error: "缺少 fileID" };
    await ensureCollection();
    const download = await cloud.downloadFile({ fileID });
    const base64 = download.fileContent.toString("base64");
    const { category, categoryLabel, caption } = await analyzeImage(
      base64,
      takenAt,
      placeName,
      region,
      distanceKm,
    );
    const doc = {
      _openid: OPENID,
      openid: OPENID,
      journeySlug: journeySlug || "",
      poiId: poiId || "__unmatched__",
      fileID,
      placeName: placeName || "",
      region: region || "",
      category,
      categoryLabel,
      caption,
      takenAt: takenAt || new Date().toISOString(),
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      distanceKm: typeof distanceKm === "number" ? Math.round(distanceKm * 10) / 10 : null,
      createdAt: db.serverDate(),
    };
    const res = await db.collection(COLLECTION).add({ data: doc });
    return { ok: true, id: res._id, category, categoryLabel, caption, fileID };
  }

  if (action === "assign") {
    const { id, poiId, placeName, region, distanceKm } = event;
    if (!id || !poiId) return { ok: false, error: "缺少 id 或 poiId" };
    await ensureCollection();
    const getRes = await db.collection(COLLECTION).where({ _id: id, openid: OPENID }).get();
    if (!getRes.data || getRes.data.length === 0) {
      return { ok: false, error: "记录不存在或无权操作" };
    }
    const patch = {
      poiId,
      placeName: placeName || "",
      region: region || "",
    };
    if (typeof distanceKm === "number") patch.distanceKm = Math.round(distanceKm * 10) / 10;
    await db.collection(COLLECTION).doc(id).update({ data: patch });
    return { ok: true };
  }

  if (action === "delete") {
    const { id, fileID } = event;
    if (!id) return { ok: false, error: "缺少 id" };
    await ensureCollection();
    const getRes = await db.collection(COLLECTION).where({ _id: id, openid: OPENID }).get();
    if (!getRes.data || getRes.data.length === 0) {
      return { ok: false, error: "记录不存在或无权删除" };
    }
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
