// 小程序数据导出入口：由 scripts/export-mini-data.mjs 经 Vite SSR 构建后在 Node 中执行。
// 职责：把 app/journeys/** 的 TS 常量整体序列化为 miniprogram 可 require 的 JSON，
//       并把详情页用到的 WebP 按档位复制进旅程分包 assets/。
import { journeys } from "../app/journeys/registry";
import { optImageWidths } from "../app/generated/image-manifest";
import sharp from "sharp";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.env.MINI_EXPORT_ROOT;
if (!root) throw new Error("MINI_EXPORT_ROOT is required");

const publicDir = path.join(root, "public");
const miniRoot = path.join(root, "miniprogram");
const errors: string[] = [];

// 清理旧版 JSON 数据产物（现统一输出 module.exports 形态的 .js 模块）
rmSync(path.join(miniRoot, "data", "journeys.json"), { force: true });
for (const slug of journeys.map((j) => j.slug)) {
  rmSync(path.join(miniRoot, "journeys", slug, "data.json"), { force: true });
  // 每次全量重建分包图片目录（防止旧 webp 残留混入代码包）
  rmSync(path.join(miniRoot, "journeys", slug, "assets"), { recursive: true, force: true });
}
// 卡片图同样全量重建（markers 由 gen-marker-icons 管理，保留）
rmSync(path.join(miniRoot, "assets", "cards"), { recursive: true, force: true });

function pickWidth(name: string): number | null {
  const widths = optImageWidths[name];
  if (!widths || widths.length === 0) return null;
  if (widths.includes(640)) return 640;
  if (widths.includes(400)) return 400;
  return Math.min(...widths);
}

function copyAsset(srcRel: string, destAbs: string) {
  const src = path.join(publicDir, srcRel);
  if (!existsSync(src)) {
    errors.push(`缺少源文件 public/${srcRel}`);
    return;
  }
  mkdirSync(path.dirname(destAbs), { recursive: true });
  copyFileSync(src, destAbs);
}

// 代码包内图片统一转 JPG：微信小程序对「代码包内的 WebP」支持不稳（部分模拟器/真机不渲染），
// webp 官方仅建议用于网络图片；本地打包一律转码为 JPEG。
async function transcodeToJpg(srcAbs: string, destAbs: string) {
  mkdirSync(path.dirname(destAbs), { recursive: true });
  await sharp(srcAbs).jpeg({ quality: 82 }).toFile(destAbs);
}

// "/detail/<name>.jpg" → "/journeys/<slug>/assets/<name>.<w>.jpg"（转码并写入分包）
async function remapDetailImage(src: string, slug: string) {
  const base = src.replace(/^\/detail\//, "").replace(/\.(jpe?g|png|webp)$/i, "");
  const width = pickWidth(base);
  const rel = width ? `assets/${base}.${width}.jpg` : `assets/${base}.jpg`;
  const srcRel = width ? `detail/opt/${base}.${width}.webp` : `detail/${base}.jpg`;
  const srcAbs = path.join(publicDir, srcRel);
  const destAbs = path.join(miniRoot, "journeys", slug, rel);
  if (!existsSync(srcAbs)) {
    errors.push(`缺少源文件 public/${srcRel}`);
  } else if (width) {
    await transcodeToJpg(srcAbs, destAbs);
  } else {
    copyAsset(srcRel, destAbs);
  }
  return `/journeys/${slug}/${rel}`;
}

async function remapAsset(asset: { src: string }, slug: string) {
  return { ...asset, src: await remapDetailImage(asset.src, slug) };
}

const homeCards: unknown[] = [];

for (const journey of journeys) {
  const slug = journey.slug;

  // 首页卡片图（主包可访问，故转码到主包 assets/cards/）
  const cardBase = journey.image.replace(/^\/detail\//, "").replace(/\.(jpe?g|png|webp)$/i, "");
  const cardWidth = pickWidth(cardBase) ?? null;
  const cardName = cardWidth ? `${slug}.${cardWidth}.jpg` : `${slug}.jpg`;
  if (cardWidth) {
    const srcAbs = path.join(publicDir, `detail/opt/${cardBase}.${cardWidth}.webp`);
    if (!existsSync(srcAbs)) errors.push(`缺少源文件 public/detail/opt/${cardBase}.${cardWidth}.webp`);
    else await transcodeToJpg(srcAbs, path.join(miniRoot, "assets", "cards", cardName));
  } else {
    copyAsset(`detail/${cardBase}.jpg`, path.join(miniRoot, "assets", "cards", cardName));
  }
  const cardImage = `/assets/cards/${cardName}`;

  const poiDetails: Record<string, unknown> = {};
  for (const [id, detail] of Object.entries(journey.poiDetails)) {
    poiDetails[id] = {
      ...detail,
      hero: await remapAsset(detail.hero, slug),
      gallery: await Promise.all(detail.gallery.map((asset) => remapAsset(asset, slug))),
    };
  }
  const routeDetails: Record<string, unknown> = {};
  for (const [day, detail] of Object.entries(journey.routeDetails)) {
    routeDetails[day] = {
      ...detail,
      hero: await remapAsset(detail.hero, slug),
      gallery: await Promise.all(detail.gallery.map((asset) => remapAsset(asset, slug))),
    };
  }

  const payload = {
    slug,
    card: {
      number: journey.number,
      eyebrow: journey.eyebrow,
      title: journey.title,
      subtitle: journey.subtitle,
      description: journey.description,
      image: cardImage,
      days: journey.days,
      distance: journey.distance,
      season: journey.season,
      difficulty: journey.difficulty,
    },
    trip: journey.trip,
    config: journey.config,
    poiDetails,
    routeDetails,
    poiOrder: journey.poiOrder,
  };

  const dest = path.join(miniRoot, "journeys", slug, "data.js");
  mkdirSync(path.dirname(dest), { recursive: true });
  // 输出为 JS 模块而非 JSON：小程序打包器对 require('x.json') 存在解析兼容问题，
  // module.exports 形态在各端稳定可用。
  writeFileSync(dest, `module.exports = ${JSON.stringify(payload)};\n`);

  homeCards.push({
    slug,
    card: payload.card,
    tripStats: journey.trip.tripStats,
  });
}

const homeDest = path.join(miniRoot, "data", "journeys.js");
mkdirSync(path.dirname(homeDest), { recursive: true });
writeFileSync(homeDest, `module.exports = ${JSON.stringify({ journeys: homeCards })};\n`);

if (errors.length > 0) {
  console.error("[export-mini] 失败：");
  for (const err of errors) console.error("  - " + err);
  throw new Error(`小程序数据导出有 ${errors.length} 处错误`);
}
console.log(`[export-mini] 已导出 ${homeCards.length} 条旅程到 miniprogram/data/journeys.js`);
