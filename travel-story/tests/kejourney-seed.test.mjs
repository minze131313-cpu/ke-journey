// KE Journey 种子数据校验：travel-story 预置行程必须与主站 trip-data.ts 一致。
// 生成文件是「JSON 字面量 + TS 类型标注」，这里直接抽出数组求值，避免引入 TS 运行时。
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = readFileSync(path.join(root, "lib/kejourney-seed.data.ts"), "utf8");

const match = raw.match(/export const KEJOURNEY_SEEDS: KeJourneySeed\[\] = (\[[\s\S]*\]);\s*$/);
assert.ok(match, "无法从 lib/kejourney-seed.data.ts 解析 KEJOURNEY_SEEDS，请运行 npm run sync:travel-story");

const seeds = JSON.parse(match[1]);

test("主站旅程全部同步为 Travel Story 种子", () => {
  assert.ok(Array.isArray(seeds) && seeds.length >= 2, "至少应包含青甘大环线与国庆广西·香港之旅");
  const slugs = seeds.map((s) => s.slug);
  assert.deepEqual(slugs, ["qinggan-loop", "guangxi-hk"]);
  for (const seed of seeds) {
    assert.equal(typeof seed.trip.name, "string");
    assert.ok(seed.trip.name.length > 0, `${seed.slug} 缺少行程名`);
    assert.match(seed.trip.startDate, /^\d{4}-\d{2}-\d{2}$/, `${seed.slug} 起始日期格式`);
    assert.match(seed.trip.endDate, /^\d{4}-\d{2}-\d{2}$/, `${seed.slug} 结束日期格式`);
    assert.ok(seed.trip.startDate <= seed.trip.endDate, `${seed.slug} 起止日期顺序颠倒`);
    assert.ok(seed.trip.description.length > 20, `${seed.slug} 描述过短`);
  }
});

test("每条种子的天数与节点都自洽", () => {
  for (const seed of seeds) {
    assert.ok(seed.days > 0, `${seed.slug} 天数无效`);
    assert.ok(seed.stops.length > 0, `${seed.slug} 没有任何节点`);
    for (const stop of seed.stops) {
      assert.ok(stop.day >= 1 && stop.day <= seed.days, `${seed.slug} 节点 ${stop.name} 的天数越界：${stop.day}`);
      assert.ok(stop.lat > 18 && stop.lat < 54, `${seed.slug} 节点 ${stop.name} 纬度越界`);
      assert.ok(stop.lon > 73 && stop.lon < 135, `${seed.slug} 节点 ${stop.name} 经度越界`);
      assert.equal(stop.country, "中国");
      assert.ok(["scenic", "city", "attraction", "zoo", "lake", "other"].includes(stop.type), `${seed.slug} 节点 ${stop.name} 类型未知：${stop.type}`);
    }
    // 行程天数 = 起止日期跨度（首尾都算）
    const start = new Date(`${seed.trip.startDate}T00:00:00Z`);
    const end = new Date(`${seed.trip.endDate}T00:00:00Z`);
    const span = Math.round((end - start) / 86400000) + 1;
    assert.equal(span, seed.days, `${seed.slug} 日期跨度 ${span} 天与 seed.days ${seed.days} 不一致`);
  }
});
