// 图片优化管线：public/detail/*.jpg → public/detail/opt/<name>.<w>.webp + <name>.fallback.jpg
// 同时把 public/og.png 压缩为 public/og.jpg（1200px 宽）。
// 输出 app/generated/image-manifest.ts，供前端组件生成 srcset。
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const detailDir = path.resolve("public/detail");
const outDir = path.join(detailDir, "opt");
const manifestPath = path.resolve("app/generated/image-manifest.ts");
const widths = [640, 1080, 1600];

async function optimizeDetailImages() {
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(detailDir)).filter((f) => f.endsWith(".jpg"));
  const manifest = {};
  let beforeBytes = 0;
  let afterBytes = 0;

  for (const file of files) {
    const srcPath = path.join(detailDir, file);
    const base = file.replace(/\.jpg$/, "");
    const meta = await sharp(srcPath).metadata();
    const sourceWidth = meta.width ?? 0;
    beforeBytes += (await stat(srcPath)).size;

    const available = widths.filter((w) => w < sourceWidth);
    if (!available.length) available.push(Math.max(1, sourceWidth));
    manifest[base] = available;

    for (const w of available) {
      const target = path.join(outDir, `${base}.${w}.webp`);
      await sharp(srcPath)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 72 })
        .toFile(target);
      afterBytes += (await stat(target)).size;
    }

    // 兜底直接复用原图（/detail/<name>.jpg）：原图本来就要保留，供 og:image 与不支持 WebP 的浏览器使用。
  }

  const ts = `// 由 scripts/optimize-images.mjs 自动生成，勿手改。\n// 每个图片可用的 WebP 宽度档位（仅生成小于原图宽度的档，避免放大）。\nexport const optImageWidths: Record<string, number[]> = ${JSON.stringify(manifest, null, 2)};\n`;
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, ts);
  return { files: files.length, beforeBytes, afterBytes };
}

async function optimizeOg() {
  const ogSrc = path.resolve("public/og.png");
  const ogOut = path.resolve("public/og.jpg");
  try {
    await stat(ogSrc);
  } catch {
    console.log("og: public/og.png 已不存在，跳过");
    return null;
  }
  const meta = await sharp(ogSrc).metadata();
  const before = (await stat(ogSrc)).size;
  await sharp(ogSrc)
    .resize({ width: Math.min(meta.width ?? 1200, 1200), withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(ogOut);
  const after = (await stat(ogOut)).size;
  await rm(ogSrc);
  return { size: `${meta.width}x${meta.height}`, before, after };
}

const detail = await optimizeDetailImages();
const og = await optimizeOg();
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
console.log(`detail: ${detail.files} 张图，原图 ${mb(detail.beforeBytes)} → WebP 档 ${mb(detail.afterBytes)}`);
if (og) console.log(`og: ${og.size}，${mb(og.before)} → ${mb(og.after)}（og.png 已删除，改用 og.jpg）`);
