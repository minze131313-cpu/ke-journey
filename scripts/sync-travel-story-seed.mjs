// ============================================================
// KE Journey → Travel Story 种子数据同步（唯一数据管道）
//
// 主站旅程数据（app/journeys/qinggan-loop/trip-data.ts）是唯一数据源，
// 本脚本把它转成 travel-story/lib/kejourney-seed.data.ts，供
// Travel Story 首次启动时预置「青甘大环线」行程。
// 修改主站行程后运行：npm run sync:travel-story
// ============================================================

import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcPath = resolve(root, "app/journeys/qinggan-loop/trip-data.ts");
const outPath = resolve(root, "travel-story/lib/kejourney-seed.data.ts");

// ------------------------------------------------------------
// 1. 把 trip-data.ts 转译成无类型标注的 JS（import type 会被剥掉），
//    再在沙箱中求值取出 places / days。
// ------------------------------------------------------------
const src = readFileSync(srcPath, "utf8");
const js = ts.transpileModule(src, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  reportDiagnostics: true,
}).outputText;

let body = js.replace(/\bexport\s+/g, "");
for (const name of ["routeRoads", "places", "days", "tripStats"]) {
  body = body.replace(`const ${name} =`, `sandbox.${name} =`);
}

const sandbox = {};
new Function("sandbox", body)(sandbox);

const places = sandbox.places;
const days = sandbox.days;
if (!Array.isArray(places) || !Array.isArray(days)) {
  console.error("无法从 trip-data.ts 解析 places/days，请检查数据文件格式。");
  process.exit(1);
}

// ------------------------------------------------------------
// 2. 映射到 Travel Story 的 Trip 模型
//    KE 分类 scenic/city/supply/warning → StopType
// ------------------------------------------------------------
const TYPE_MAP = { scenic: "scenic", city: "city", supply: "other", warning: "other" };
const byId = new Map(places.map((p) => [p.id, p]));

const stops = [];
for (const day of days) {
  for (const stopId of day.stops) {
    const p = byId.get(stopId);
    if (!p) {
      console.warn(`警告：day ${day.day} 引用了不存在的地点 ${stopId}，已跳过`);
      continue;
    }
    const parts = p.region.split("·").map((s) => s.trim());
    stops.push({
      name: p.name,
      day: day.day,
      // KE Journey 的 coords 是 [经度, 纬度]
      lat: p.coords[1],
      lon: p.coords[0],
      type: TYPE_MAP[p.category] ?? "other",
      // 「青海 · G315」这类纯路段坐标点没有可解析城市，不填 city
      city: p.category === "warning" ? undefined : (parts[1] ?? undefined),
      country: "中国",
    });
  }
}

const seed = {
  trip: {
    name: "青甘大环线 · 12日",
    // 默认日期只用于首次预置，可在规划页随时修改
    startDate: "2026-08-01",
    endDate: "2026-08-12",
    origin: "西宁取还车",
    region: "中国 · 青海 / 甘肃",
    description:
      "一条把高原湖泊、荒漠雅丹、丝路文明和雪山草原串成闭环的自驾路书。12 天约 3,000 公里，顺时针由西宁取还车；已按 2026 年 G227 封闭施工官方绕行方案（张掖→肃南→G213→祁连→S302→峨堡→G0611→西宁）更新。出发前请通过 12328 复核路况。",
    isPublic: false,
  },
  days: days.length,
  stops,
};

// ------------------------------------------------------------
// 3. 生成 TS 数据文件
// ------------------------------------------------------------
const header = `// ============================================================
// 本文件由 scripts/sync-travel-story-seed.mjs 自动生成，勿手改。
// 数据源：app/journeys/qinggan-loop/trip-data.ts（KE Journey 主站唯一数据源）。
// 修改主站行程后运行：npm run sync:travel-story
// ============================================================

import type { StopType } from "./types";

export interface KeJourneySeedStop {
  name: string;
  day: number;
  lat: number;
  lon: number;
  type: StopType;
  city?: string;
  country: string;
}

`;

const out = `${header}export const KEJOURNEY_SEED: {
  trip: {
    name: string;
    startDate: string;
    endDate: string;
    origin: string;
    region: string;
    description: string;
    isPublic: boolean;
  };
  days: number;
  stops: KeJourneySeedStop[];
} = ${JSON.stringify(seed, null, 2)};\n`;
writeFileSync(outPath, out);
console.log(
  `已生成 ${outPath}：${seed.days} 天 / ${stops.length} 个地点节点`
);
