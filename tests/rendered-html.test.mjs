import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://ke-journey.bordy.cn${pathname}`, { headers:{ accept:"text/html" } }),
    { ASSETS:{ fetch:async () => new Response("Not found", { status:404 }) } },
    { waitUntil(){}, passThroughOnException(){} },
  );
}

async function htmlFor(pathname) {
  const response = await render(pathname);
  assert.equal(response.status, 200, pathname);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

test("renders the journey library homepage", async () => {
  const html = await htmlFor("/");
  assert.match(html, /KE JOURNEY/);
  assert.match(html, /旅程目录/);
  assert.match(html, /href="\/qinggan-loop\/"/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("renders the Qinghai–Gansu interactive roadbook", async () => {
  const html = await htmlFor("/qinggan-loop");
  assert.match(html, /青甘大环线/);
  assert.match(html, /高德交互地图/);
  assert.match(html, /导出路书/);
  assert.match(html, /西宁出发 · 顺时针/);
  assert.match(html, /切换页面文字大小/);
  assert.match(html, /西宁出发 · 顺时针/);
  assert.doesNotMatch(html, /沿线 D2–D12 箭头指向前进方向/);
});

test("renders canonical POI and route detail pages with record metadata", async () => {
  const poi = await htmlFor("/qinggan-loop/poi/mogao");
  assert.match(poi, /<title>莫高窟/);
  assert.match(poi, /\/detail\/mogao\.jpg/);
  assert.match(poi, /莫高窟图片，可左右滑动查看/);
  assert.match(poi, /当前景点 · 已核验原图/);
  assert.match(poi, /同一原图 · 细节裁切/);
  assert.match(poi, /aria-label="上一张图片"/);
  assert.match(poi, /aria-label="下一张图片"/);
  assert.match(poi, /上一段/);
  assert.match(poi, /下一段/);
  assert.match(poi, /href="\/qinggan-loop\/poi\/dunhuang"/);
  assert.match(poi, /href="\/qinggan-loop\/poi\/mingsha"/);
  assert.doesNotMatch(poi, /og\.png/);

  const route = await htmlFor("/qinggan-loop/route/11");
  assert.match(route, /官方绕行 · 二尕公路/);
  assert.match(route, /\/detail\/sunan\.jpg/);
  assert.match(route, /D11 沿线实景/);
  assert.match(route, /href="\/qinggan-loop\/route\/10"/);
  assert.match(route, /href="\/qinggan-loop\/route\/12"/);
  assert.doesNotMatch(route, /og\.png/);
});

test("keeps every POI carousel image and previous/next link in the audited journey order", async () => {
  const order = [
    "xining","riyue","qinghai","chaka-stay","chaka","delingha","emerald","daqaidam","daqaidam-stay",
    "u-road","yadan","aksai","dunhuang","mogao","mingsha","jiayuguan","jiayuguan-stay","jiuquan-stay",
    "danxia","danxia-stay","zhangye","g227","sunan","qilian","gangshika",
  ];
  const images = {
    xining:["xining.jpg"], riyue:["riyue.jpg"], qinghai:["qinghai.jpg"], "chaka-stay":["chaka.jpg"],
    chaka:["chaka.jpg"], delingha:["delingha.jpg"], emerald:["emerald.jpg"], daqaidam:["qaidam.jpg"],
    "daqaidam-stay":["qaidam.jpg"], "u-road":["uroad.jpg"], yadan:["yadan.jpg"], aksai:["aksai.jpg"],
    dunhuang:["dunhuang-city.jpg","mogao.jpg","mingsha.jpg"], mogao:["mogao.jpg"], mingsha:["mingsha.jpg"],
    jiayuguan:["jiayuguan.jpg"], "jiayuguan-stay":["jiayuguan.jpg"], "jiuquan-stay":["jiuquan.jpg"],
    danxia:["zhangye.jpg"], "danxia-stay":["zhangye.jpg"], zhangye:["zhangye-city.jpg"],
    g227:["qilian-county.jpg","qilian.jpg","sunan.jpg"], sunan:["sunan.jpg"],
    qilian:["qilian-county.jpg","qilian.jpg"], gangshika:["gangshika.jpg"],
  };

  for (let index=0; index<order.length; index+=1) {
    const id = order[index];
    const html = await htmlFor(`/qinggan-loop/poi/${id}`);
    const actual = [...new Set([...html.matchAll(/<img src="\/detail\/([^"]+)"/g)].map((match)=>match[1]))].sort();
    assert.deepEqual(actual, images[id].toSorted(), `${id} image audit`);
    if (index > 0) assert.match(html, new RegExp(`href="/qinggan-loop/poi/${order[index-1]}"`), `${id} previous`);
    if (index < order.length-1) assert.match(html, new RegExp(`href="/qinggan-loop/poi/${order[index+1]}"`), `${id} next`);
  }
});

test("keeps all twelve route pages in strict day order", async () => {
  for (let day=1; day<=12; day+=1) {
    const html = await htmlFor(`/qinggan-loop/route/${day}`);
    if (day > 1) assert.match(html, new RegExp(`href="/qinggan-loop/route/${day-1}"`), `D${day} previous`);
    if (day < 12) assert.match(html, new RegExp(`href="/qinggan-loop/route/${day+1}"`), `D${day} next`);
  }
});
