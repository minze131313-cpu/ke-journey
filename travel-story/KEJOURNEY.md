# KE Journey × Travel Story 集成说明

本目录是 [wang-bool/Travel-Story](https://github.com/wang-bool/Travel-Story)（MIT License）
与 KE Journey 目的地路书（本仓库主站）的结合体，作为**独立应用**放在
`travel-story/` 子目录中，独立安装、独立运行、独立部署，与主站互不干扰。

## 结合点

1. **内置目的地行程**：主站「青甘大环线」12 天行程已预置为 Travel Story 的内置行程。
   首次打开（且服务端无数据）时自动种入，打开即可开始规划、补照片视频、生成旅行影片。
2. **单一数据管道**：种子数据不是手抄的。主站
   `app/journeys/qinggan-loop/trip-data.ts` 是唯一数据源，根目录脚本
   `scripts/sync-travel-story-seed.mjs` 把它转成 `lib/kejourney-seed.data.ts`。
   主站行程改动后运行：
   ```bash
   # 在仓库根目录
   npm run sync:travel-story
   ```
3. **双向入口**：
   - 主站首页新增「Travel Story」卡片 → 链接到本应用（地址由主站
     `NEXT_PUBLIC_TRAVEL_STORY_URL` 控制，默认 `https://travel-story.bordy.cn/`）。
   - 本应用首页导航新增「KE 路书 ↗」→ 链回主站（地址由本目录
     `NEXT_PUBLIC_KEJOURNEY_URL` 控制，默认 `https://ke-journey.bordy.cn/`）。

## 本地运行

要求 Node.js 20+（本机开发环境即主站要求的 Node 22.13+），无需 ffmpeg 也能用规划与地图预览。

```bash
cd travel-story
npm install
cp .env.example .env.local   # 至少配置 GAODE_KEY 或 LOCATIONIQ_KEY，否则地点搜索无结果
npm run dev                  # 打开 http://localhost:3000
```

> 若与主站 `npm run dev` 端口冲突，用 `npm run dev -- -p 3001` 换端口，
> 并把主站 `.env.local` 的 `NEXT_PUBLIC_TRAVEL_STORY_URL` 指向它。

检查：`npm run typecheck` · `npm run test` · `npm run build && npm start`。
生成影片还需要系统安装 ffmpeg（上游要求），规划与预览不受影响。

## 独立发布（独立目录部署）

本应用是带服务端 API 的 Next.js 应用（行程、素材、录像写在本目录 `data/`），
与主站「静态导出 + nginx 目录」的发布方式不同，部署方式为**独立目录 + Node 进程**：

```
VPS 上独立目录，如 /opt/travel-story/
  ├─ repo/                  ← git clone（本仓库 travel-story 分支的 travel-story/ 子目录）
  ├─ .env.local             ← GAODE_KEY / LOCATIONIQ_KEY / NEXT_PUBLIC_KEJOURNEY_URL
  └─ data/                  ← 行程、素材、录像（备份先于升级）
```

```bash
cd /opt/travel-story/repo
npm ci
cp .env.example .env.local && $EDITOR .env.local
npm run build
# 生产进程（示例 systemd 单元，监听 127.0.0.1:3001）
npm start -- -H 127.0.0.1 -p 3001
```

nginx 只对外开放 `travel-story.bordy.cn` 这个独立 server 块：

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    client_max_body_size 600m;   # 素材与录像上传
}
```

安全边界（来自上游 README）：业务 API 无登录校验，只应监听内网并由可信
反向代理暴露；暴露公网需补充身份验证、HTTPS 与速率限制。

## 分支与目录约定

- 独立分支：`travel-story`（从 `main` 切出）。
- 独立目录：仓库内 `travel-story/`（本目录），拥有自己的 `package.json`、
  `package-lock.json`、`.gitignore` 与 `node_modules`，不参与主站构建链。
- 主站 `npm run lint` / `build` 已忽略本目录（主站 ESLint 只覆盖其自身的
  app/scripts 等路径），两侧升级互不影响。
