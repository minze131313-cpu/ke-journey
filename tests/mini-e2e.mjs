// 小程序 E2E：直连微信开发者工具自动化 WebSocket 协议（不依赖 miniprogram-automator，
// 规避其与新版 IDE 的协议兼容问题）走查全部页面并收集运行时错误。
// 运行：node tests/mini-e2e.mjs（前置：开发者工具已开启服务端口）
import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectPath = path.join(root, "miniprogram");
const cliPath =
  process.env.WECHAT_DEVTOOLS_CLI || "/Applications/wechatwebdevtools.app/Contents/MacOS/cli";
const PORT = 9420;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function enableAutomation() {
  const res = spawnSync(cliPath, ["auto", "--project", projectPath, "--auto-port", String(PORT)], {
    encoding: "utf8",
    timeout: 120000,
  });
  if (res.status !== 0) {
    throw new Error(`cli auto 失败：${res.stderr || res.stdout}`);
  }
}

function cli(args) {
  return spawnSync(cliPath, args, { encoding: "utf8", timeout: 120000 });
}

// 自动化会话残留时 IDE 不会重新绑定端口；重置 IDE 状态（关项目→退出→重开→启用自动化）
function resetIde() {
  cli(["close", "--project", projectPath]);
  cli(["quit"]);
  spawnSync("sleep", ["3"]);
  cli(["open", "--project", projectPath]);
  spawnSync("sleep", ["8"]);
  enableAutomation();
}

async function retry(fn, attempts = 10, delayMs = 2000, label = "调用") {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await sleep(delayMs);
    }
  }
  throw new Error(`${label} 多次重试后仍失败：${lastErr.message}`);
}

class MiniClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.handlers = new Map();
    this.initialized = new Promise((resolve) => {
      this._markInit = resolve;
    });
    ws.on("message", (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        if (msg.method === "App.initialized") this._markInit();
        const cb = this.handlers.get(msg.method);
        if (cb) cb(msg.params);
      }
    });
  }

  static create(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      const timer = setTimeout(() => {
        try {
          ws.close();
        } catch {
          /* ignore */
        }
        reject(new Error(`连接自动化端点超时：${url}`));
      }, 15000);
      ws.on("open", () => {
        clearTimeout(timer);
        resolve(new MiniClient(ws));
      });
      ws.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`协议调用超时：${method}`));
      }, 20000);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, cb) {
    this.handlers.set(method, cb);
  }

  close() {
    try {
      this.ws.close();
    } catch {
      /* ignore */
    }
  }
}

const errors = [];
let client;
let failed = false;

try {
  enableAutomation();
  client = null;
  let resetDone = false;
  for (let attempt = 0; attempt < 40 && !client; attempt++) {
    try {
      client = await MiniClient.create(`ws://127.0.0.1:${PORT}`);
    } catch (err) {
      if (attempt >= 15 && !resetDone) {
        resetDone = true;
        console.log("自动化端点不可达，重置 IDE 后重试…");
        resetIde();
      }
      if (attempt === 39) throw new Error(`自动化端点连接失败：${err.message}`);
      await sleep(1000);
    }
  }
  client.on("App.logAdded", (p) => {
    // 忽略空参数框架噪声日志（IDE 模拟器在启动/预加载分包时产生 [{}]）
    const args = p && p.args ? p.args : [];
    const text = JSON.stringify(args);
    const isFrameworkNoise =
      text === "[]" ||
      text === "[{}]" ||
      text.includes("routeDone with a webviewId") ||
      text.includes("[Perf]") ||
      // 模拟器环境噪声：IDE 云开发面板未在开发者工具中初始化时云代理报 appid missing（真机不受影响）
      text.includes("cloud init error");
    if (
      p &&
      (p.type === "error" || p.type === "warn") &&
      !isFrameworkNoise
    ) {
      errors.push(`[console.${p.type}] ${text}`);
    }
  });
  client.on("App.exceptionThrown", (p) => errors.push(`[exception] ${p && p.message}`));

  // 等 IDE 初始化事件，再开启日志流（App 上下文可能仍在启动，失败即重试）
  await Promise.race([client.initialized, sleep(8000)]);
  await retry(() => client.send("App.enableLog"), 8, 2000, "App.enableLog");

  const wxCall = (method, args) => client.send("App.callWxMethod", { method, args });
  const current = () => client.send("App.getCurrentPage");
  // 新版 IDE 的 Page.getData/Page.callMethod 在非 Agent 项目上不可用（"page is not on top of
  // page stack"），改用 App.callFunction 在小程序上下文直接读 getCurrentPages()/调用页面方法。
  const evalInApp = (functionDeclaration, args = []) =>
    client.send("App.callFunction", { functionDeclaration, args });
  const pageData = async (attempts = 30, expectedPath = null) => {
    let firstErr = "";
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await evalInApp(
          `function(path){
            var pages = getCurrentPages();
            var page = pages[pages.length - 1];
            if (path) {
              for (var k = pages.length - 1; k >= 0; k--) {
                if (pages[k].route === path) { page = pages[k]; break; }
              }
            }
            return { route: page ? page.route : null, data: page ? page.data : null };
          }`,
          [expectedPath],
        );
        // App.callFunction 响应为 { result: <函数返回值> }
        const payload = response && response.result;
        if (payload && payload.data && Object.keys(payload.data).length > 0) return payload.data;
        if (!firstErr) firstErr = `空数据响应：${JSON.stringify(payload).slice(0, 160)}`;
      } catch (err) {
        if (!firstErr) firstErr = err.message;
      }
      await sleep(500);
    }
    throw new Error(`读取页面数据失败（path=${expectedPath}）：${firstErr}`);
  };
  const callPageMethod = (method, args) =>
    evalInApp(
      `function(method, args){
        var pages = getCurrentPages();
        var page = pages[pages.length - 1];
        if (!page || typeof page[method] !== "function") {
          return { error: "method missing: " + method };
        }
        page[method](args[0]);
        return { ok: true };
      }`,
      [method, args],
    );

  // 1. 首页
  await retry(() => wxCall("reLaunch", [{ url: "/pages/index/index" }]), 5, 3000, "reLaunch 首页");
  await sleep(2000);
  let cur = await retry(() => current(), 8, 2000, "getCurrentPage");
  assert.equal(cur.path, "pages/index/index", "首页路径错误");
  let data = await pageData(30, "pages/index/index");
  assert.ok(data.items && data.items.length >= 1, "首页旅程目录为空");
  await sleep(1500);
  data = await pageData(4, "pages/index/index");
  assert.ok(
    !data.imgErrors || data.imgErrors.length === 0,
    `首页图片加载失败：${JSON.stringify(data.imgErrors)}`,
  );
  console.log(`✓ 首页：${data.items.length} 条旅程，卡片图加载正常（${data.items[0].image}）`);

  // 2. 行程主页（分包）
  await retry(
    () => wxCall("navigateTo", [{ url: "/journeys/qinggan-loop/trip/trip" }]),
    5,
    3000,
    "navigateTo 行程主页",
  );
  await sleep(3000);
  cur = await retry(() => current(), 8, 2000, "getCurrentPage 行程主页");
  assert.equal(cur.path, "journeys/qinggan-loop/trip/trip", "行程主页路径错误");
  let mapData = {};
  for (let i = 0; i < 25; i++) {
    mapData = await pageData(4, "journeys/qinggan-loop/trip/trip");
    if (mapData.mapReady && mapData.markers.length > 0) break;
    await sleep(1000);
  }
  assert.ok(mapData.mapReady, "地图未进入 ready 状态");
  assert.ok(mapData.tripDays.length === 12, `行程列表应为 12 天，实际 ${mapData.tripDays.length}`);
  assert.ok(mapData.markers.length >= 20, `markers 数量异常: ${mapData.markers.length}`);
  assert.ok(mapData.polylines.length >= 12, `polylines 数量异常: ${mapData.polylines.length}`);
  console.log(`✓ 行程主页：12 天列表 + 地图参考（${mapData.markers.length} markers / ${mapData.polylines.length} polylines）`);

  // 3. 分类筛选（scenic）
  await callPageMethod("tapCategory", [{ currentTarget: { dataset: { key: "scenic" } } }]);
  await sleep(800);
  mapData = await pageData(4, "journeys/qinggan-loop/trip/trip");
  assert.ok(mapData.markers.length > 0 && mapData.markers.length < 25, "筛选后 marker 数量异常");
  console.log(`✓ 筛选「景点」：markers ${mapData.markers.length}`);

  // 4. 选日（D5，先切回全部分类：D5 含 U形路段 + 水上雅丹两个节点）
  await callPageMethod("tapCategory", [{ currentTarget: { dataset: { key: "all" } } }]);
  await sleep(500);
  await callPageMethod("tapDay", [{ currentTarget: { dataset: { day: 5 } } }]);
  await sleep(800);
  mapData = await pageData(4, "journeys/qinggan-loop/trip/trip");
  assert.ok(mapData.markers.length >= 2, "D5 marker 数量异常");
  assert.ok(mapData.polylines.length >= 2, "D5 折线数量异常（应含封闭段）");
  console.log(`✓ 选日 D5：markers ${mapData.markers.length} / polylines ${mapData.polylines.length}`);

  // 5. 区块快跳（scroll-into-view 锚点）
  await callPageMethod("jumpTo", [{ currentTarget: { dataset: { anchor: "sec-checklist" } } }]);
  await sleep(800);
  console.log("✓ 区块快跳（行程/地图/路况/清单）");

  // 6. 清单勾选
  mapData = await pageData(4, "journeys/qinggan-loop/trip/trip");
  assert.ok(mapData.checklistGroups.length >= 1, "清单分组为空");
  const beforeDone = mapData.checklistGroups[0].items[0].done;
  await callPageMethod("toggleCheck", [{ currentTarget: { dataset: { gi: 0, ii: 0, key: "0-0" } } }]);
  await sleep(500);
  mapData = await pageData(4, "journeys/qinggan-loop/trip/trip");
  assert.ok(
    mapData.checklistGroups[0].items[0].done === !beforeDone,
    "清单勾选未生效",
  );
  console.log("✓ 清单勾选与持久化");

  // 7. POI 详情页
  await retry(
    () => wxCall("navigateTo", [{ url: "/journeys/qinggan-loop/poi/poi?id=mogao" }]),
    5,
    3000,
    "navigateTo POI",
  );
  await sleep(3000);
  cur = await retry(() => current(), 8, 2000, "getCurrentPage POI");
  assert.equal(cur.path, "journeys/qinggan-loop/poi/poi");
  const poiData = await pageData(10, "journeys/qinggan-loop/poi/poi");
  assert.ok(poiData.detail && poiData.detail.place.name === "莫高窟", "POI 详情未加载");
  assert.ok(poiData.galleryItems.length >= 1, "POI 图集为空");
  assert.ok(poiData.next && poiData.prev, "POI 前后导航缺失");
  await sleep(1500);
  const poiData2 = await pageData(4, "journeys/qinggan-loop/poi/poi");
  assert.ok(
    !poiData2.imgErrors || poiData2.imgErrors.length === 0,
    `POI 图片加载失败：${JSON.stringify(poiData2.imgErrors)}`,
  );
  console.log(`✓ POI 详情：${poiData.detail.place.name}（${poiData.galleryItems.length} 图加载正常，前后导航正常）`);

  // 8. 逐日路线详情页
  await retry(
    () => wxCall("navigateTo", [{ url: "/journeys/qinggan-loop/route/route?day=11" }]),
    5,
    3000,
    "navigateTo 路线页",
  );
  await sleep(3000);
  cur = await retry(() => current(), 8, 2000, "getCurrentPage 路线页");
  assert.equal(cur.path, "journeys/qinggan-loop/route/route");
  const routeData = await pageData(10, "journeys/qinggan-loop/route/route");
  assert.ok(routeData.detail && routeData.detail.day.title.length > 0, "路线详情未加载");
  assert.ok(routeData.rhythm.length >= 3, "节奏时间线缺失");
  assert.ok(routeData.galleryItems.length >= 3, "路线图集缺失");
  let routeMap = {};
  for (let i = 0; i < 15; i++) {
    routeMap = await pageData(4, "journeys/qinggan-loop/route/route");
    if (routeMap.dayMapReady) break;
    await sleep(1000);
  }
  assert.ok(routeMap.dayMapReady, "当天地图未 ready");
  assert.ok(routeMap.dayMarkers.length >= 1, "当天地图节点缺失");
  assert.ok(routeMap.dayPolylines.length >= 2, "当天地图折线缺失（应含封闭段）");
  console.log(`✓ 当天地图参考：${routeMap.dayMarkers.length} 节点 / ${routeMap.dayPolylines.length} 折线`);
  await sleep(1500);
  const routeData2 = await pageData(4, "journeys/qinggan-loop/route/route");
  assert.ok(
    !routeData2.imgErrors || routeData2.imgErrors.length === 0,
    `路线图片加载失败：${JSON.stringify(routeData2.imgErrors)}`,
  );
  console.log(`✓ 路线详情：D11 ${routeData.detail.day.title}（${routeData.rhythm.length} 节点节奏，图集加载正常）`);

  // 9. 关于页
  await retry(() => wxCall("navigateTo", [{ url: "/pages/about/about" }]), 5, 3000, "navigateTo 关于页");
  await sleep(2500);
  cur = await retry(() => current(), 8, 2000, "getCurrentPage 关于页");
  assert.equal(cur.path, "pages/about/about");
  console.log("✓ 关于页");
} catch (err) {
  failed = true;
  console.error(`\n✖ E2E 中断：${err.message}`);
} finally {
  if (client) client.close();
}

if (errors.length > 0) {
  console.error(`✖ 运行时错误 ${errors.length} 条：`);
  for (const err of errors.slice(0, 20)) console.error("  - " + err);
  process.exitCode = 1;
} else if (failed) {
  process.exitCode = 1;
} else {
  console.log("\n✔ 全部页面走查通过，无运行时错误");
}
