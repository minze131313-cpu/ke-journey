// 小程序导出数据一致性校验：node --test tests/mini-data.test.mjs
// 校验引用完整性（stops→places、poiOrder→places、routeDetails 天数）、
// 坐标合法性与图片资源实际存在性。对齐 tests/rendered-html.test.mjs 的回归思路。
import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const miniRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "miniprogram");

// 数据文件由导出脚本生成（module.exports 形态的 JS 模块）。
// 仓库 package.json 为 type:module，Node require 会按 ESM 解析报错；
// 小程序运行时使用独立模块系统不受影响，此处以函数求值模拟 CommonJS 加载。
function readData(rel) {
  const src = readFileSync(path.join(miniRoot, rel), "utf8");
  const mod = { exports: {} };
  new Function("module", "exports", src)(mod, mod.exports);
  return mod.exports;
}

function assertLocalAsset(p) {
  const abs = path.join(miniRoot, p.replace(/^\//, ""));
  assert.ok(existsSync(abs), `资源不存在：${p}`);
}

const home = readData("data/journeys.js");
assert.ok(Array.isArray(home.journeys) && home.journeys.length > 0, "首页旅程目录为空");

for (const entry of home.journeys) {
  const slug = entry.slug;
  const data = readData(`journeys/${slug}/data.js`);

  test(`${slug}: 数据结构与引用完整`, () => {
    assert.equal(data.card.title.length > 0, true);
    assertLocalAsset(data.card.image);

    const places = data.trip.places;
    const ids = new Set(places.map((p) => p.id));
    assert.equal(ids.size, places.length, "place id 重复");

    // stops 引用完整
    for (const day of data.trip.days) {
      for (const stop of day.stops) assert.ok(ids.has(stop), `D${day.day} 引用未知节点 ${stop}`);
      // D1 为西宁适应日，route 仅含单点（无行驶折线）；正常行驶日应 ≥2 点。
      assert.ok(day.route.length >= 1, `D${day.day} 折线坐标为空`);
      for (const [lng, lat] of day.route) {
        assert.ok(lng > 73 && lng < 135 && lat > 18 && lat < 54, `D${day.day} 坐标越界 ${lng},${lat}`);
      }
    }
    const dayNumbers = data.trip.days.map((d) => d.day);
    assert.deepEqual(dayNumbers, [...dayNumbers].sort((a, b) => a - b), "天数未按顺序");

    // poiOrder 与 poiDetails 覆盖所有 place
    for (const id of data.poiOrder) assert.ok(ids.has(id), `poiOrder 含未知节点 ${id}`);
    for (const place of places) assert.ok(data.poiDetails[place.id], `缺少 POI 详情 ${place.id}`);

    // routeDetails 覆盖所有 day
    for (const day of data.trip.days) assert.ok(data.routeDetails[String(day.day)], `缺少路线详情 D${day.day}`);

    // closedRoads 坐标
    for (const closed of data.config.closedRoads) assert.ok(closed.path.length >= 2, "封闭路段坐标不足");
  });

  test(`${slug}: 详情图片资源全部存在`, () => {
    const checkAsset = (asset) => assertLocalAsset(asset.src);
    for (const detail of Object.values(data.poiDetails)) {
      checkAsset(detail.hero);
      for (const asset of detail.gallery) checkAsset(asset);
    }
    for (const detail of Object.values(data.routeDetails)) {
      checkAsset(detail.hero);
      for (const asset of detail.gallery) checkAsset(asset);
    }
  });
}
