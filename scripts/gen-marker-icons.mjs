#!/usr/bin/env node
// 生成地图 marker 圆形图标（零依赖 PNG 编码），写入 miniprogram/assets/markers/。
// 分类色沿用 DESIGN.md 图例：景点 gold / 城镇 teal / 补给 blue / 风险 danger。
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "miniprogram", "assets", "markers");
mkdirSync(outDir, { recursive: true });

const SIZE = 40;
const FILL_R = 13;
const RING_R = 16;

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function encodePng(pixels) {
  // pixels: Buffer SIZE*SIZE*4 RGBA
  const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 4 + 1)] = 0; // filter: None
    pixels.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function circleIcon(fill, ring) {
  const [fr, fg, fb] = hexToRgb(fill);
  const [rr, rg, rb] = hexToRgb(ring);
  const pixels = Buffer.alloc(SIZE * SIZE * 4);
  const c = (SIZE - 1) / 2;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const d = Math.hypot(x - c, y - c);
      const i = (y * SIZE + x) * 4;
      if (d <= FILL_R) {
        pixels[i] = fr; pixels[i + 1] = fg; pixels[i + 2] = fb; pixels[i + 3] = 255;
      } else if (d <= RING_R) {
        pixels[i] = rr; pixels[i + 1] = rg; pixels[i + 2] = rb; pixels[i + 3] = 255;
      }
    }
  }
  return encodePng(pixels);
}

const icons = {
  scenic: circleIcon("#f1a530", "#fffefa"),
  city: circleIcon("#07877e", "#fffefa"),
  supply: circleIcon("#3288d8", "#fffefa"),
  warning: circleIcon("#e55748", "#fffefa"),
  terminal: circleIcon("#07877e", "#f1a530"),
};

for (const [name, buffer] of Object.entries(icons)) {
  writeFileSync(path.join(outDir, `${name}.png`), buffer);
}
console.log(`[gen-marker-icons] 已生成 ${Object.keys(icons).length} 个 marker 图标 → miniprogram/assets/markers/`);
