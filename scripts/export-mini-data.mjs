#!/usr/bin/env node
// 小程序数据管道：Vite SSR 构建 mini-export.entry.ts 后执行，产物为
// miniprogram/data/journeys.json + miniprogram/journeys/<slug>/data.json + 分包图片资源。
import { build } from "vite";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".mini-build");
const entry = path.join(root, "scripts", "mini-export.entry.ts");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

await build({
  configFile: false,
  logLevel: "warn",
  build: {
    ssr: entry,
    outDir,
    emptyOutDir: true,
    minify: false,
    target: "node22",
    rollupOptions: {
      output: { format: "es", entryFileNames: "mini-export.mjs" },
    },
  },
});

process.env.MINI_EXPORT_ROOT = root;
const bundlePath = path.join(outDir, "mini-export.mjs");
if (!existsSync(bundlePath)) {
  console.error("[export-mini] Vite 构建未产出 bundle");
  process.exit(1);
}
await import(bundlePath);
