# KE Journey

一个面向自驾旅行的交互式中文路书网站。首页承载旅程目录，每条旅程包含交互地图、逐日线路、景点、住宿、补给、风险提示以及图文详情页。

当前收录：

- 青甘大环线：12 天、约 3,000 公里
- 25 个地图节点
- 12 段逐日线路
- 手机端 APP 化交互与大字模式

线上版本：[ke-journey.bordy.cn](https://ke-journey.bordy.cn/)

部署架构（Hostinger VPS + nginx 静态发布）与上线验证清单见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

## 技术栈

- Next.js 16、React 19、TypeScript
- vinext / Vite 开发与构建
- 高德地图 JavaScript API 2.0
- 静态页面输出，适合部署到 Nginx、对象存储或静态建站服务

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
cp .env.example .env.local
npm run dev
```

在 `.env.local` 中填写高德地图 Web 端 Key 与安全密钥。该文件已被 Git 忽略，请勿提交真实密钥。

常用检查：

```bash
npm run lint
npm run build
node --test tests/rendered-html.test.mjs
npm run optimize:images   # 新增或替换 detail 图片后重新生成 WebP 档位
```

## 项目结构

```text
app/
  page.tsx                         旅程目录首页（由 journeys/registry.ts 驱动）
  sitemap.ts / robots.ts           站点地图与爬虫规则（随注册表自动更新）
  not-found.tsx                    品牌化中文 404 页
  [journey]/                       动态旅程路由（/qinggan-loop 等，URL 保持兼容）
    page.tsx                       交互地图页
    route/[day]/page.tsx           逐日线路图文详情
    poi/[id]/page.tsx              节点图文详情
  route/[day] · poi/[id]           旧版无前缀链接，301 永久重定向
  components/
    journey-map.tsx                通用交互地图（文案、路况、清单全部由旅程 config 驱动）
    detail-pages.tsx               通用图文详情页
    media-image.tsx                WebP srcset 图片组件（读 generated/image-manifest.ts）
  journeys/
    types.ts                       共享类型（Place/TripDay/JourneyConfig 等）
    registry.ts                    旅程注册表：新增旅程只改这里
    qinggan-loop/                  青甘大环线
      trip-data.ts                 POI、逐日路线和坐标数据
      detail-data.ts               景点与路段图文资料、来源、图片署名与详情页顺序
      config.ts                    地图页专属文案：绕行告警、准备清单、封闭路段折线等
  generated/image-manifest.ts      图片 WebP 档位清单（脚本生成，勿手改）
public/detail/                     经核验的地点图片
public/detail/opt/                 生成的 WebP 多尺寸档
tests/                             静态页面回归测试
scripts/optimize-images.mjs        WebP 生成脚本
```

## 新增旅程

在 `app/journeys/` 下按 slug 建目录，复制青甘大环线的四件套（trip-data / detail-data / config / 注册表条目）即可，无需改动任何页面组件：

1. 建 `app/journeys/<slug>/`，编写 `trip-data.ts`（类型来自 `journeys/types.ts`）。
2. 编写 `detail-data.ts` 与 `config.ts`（地图文案、告警、清单、封闭路段）。
3. 在 `app/journeys/registry.ts` 追加一条注册记录，首页卡片、地图页、详情页、sitemap 会全部自动出现。
4. 为每个 POI 与路段建立详情页，并按真实行驶顺序配置前后导航。
5. 图片必须逐张核对地点、版权与署名；资料优先引用政府、景区、国际地理及知名旅行媒体。新图片放入 `public/detail/` 后运行 `npm run optimize:images`。
6. 道路管制、预约、票务和高原健康信息需要在出发前再次核验。

## 微信小程序版

`miniprogram/` 是原生 WXML/WXSS 实现的微信小程序（个人主体），与 Web 版共用 `app/journeys/**` 同一份旅程数据：

```bash
npm run export:mini     # 生成 marker 图标 + 导出小程序 JSON 与图片资源（唯一数据管道）
npm run test:mini       # 导出 + 数据一致性校验（stops/坐标/图片存在性）
npm run mp:open         # 开发者工具 CLI 打开项目（前置：设置→安全设置开启服务端口）
npm run mp:preview      # 终端预览二维码；npm run mp:upload -- -v 0.1.0 -d "描述" 上传开发版本
```

- 数据经 `scripts/export-mini-data.mjs`（Vite SSR 构建 `scripts/mini-export.entry.ts`）生成到 `miniprogram/data/` 与 `miniprogram/journeys/<slug>/`；图片取 640/400px 档并用 sharp **转码为 JPG**（小程序对代码包内 WebP 支持不稳，webp 仅用于网络图片）；新增或修改旅程后重跑 `export:mini` 即可同步。
- 分包：主包（首页/关于/公共资源）+ 每旅程一个分包，首页 `preloadRule` 预加载。
- 信息架构（v0.2.0）：行程主页以「天」为索引的行程列表为核心（点击进入当天详情页），路线地图与路况、清单为页面中下部辅助区块；当天详情页含当日路线地图参考。
- 差异说明：地图为微信原生 map（腾讯底图，GCJ-02 与数据一致）；Web 版实时驾车规划、卫星/路况图层小程序端不提供；来源链接改为复制到剪贴板。
- 实拍打卡（云开发 + DeepSeek 视觉 API）：行程主页/POI 页「拍照」→ 定位匹配最近节点 → 云存储 → `cloudfunctions/analyze-photo` 云函数调用 `deepseek-v4-flash-vision-exp` 输出分类与一句话描述 → 节点实拍区展示。前置：开通云开发并在 `miniprogram/config.js` 填环境 ID、创建 `user_photos` 集合、部署云函数、配置 `DEEPSEEK_API_KEY` 环境变量、后台申请 getLocation 权限并更新隐私指引。
- 发布：`mp:upload` 上传开发版本后，体验版设置、提审与发布需在 mp.weixin.qq.com 手动完成（个人主体无提审 API）；新小程序发布前需完成 ICP 备案。

## Travel Story 旅行影片工具（travel-story/ 独立应用）

`travel-story/` 子目录整合了 [wang-bool/Travel-Story](https://github.com/wang-bool/Travel-Story)（MIT License）——按天规划行程、上传照片视频、让地图镜头与字幕沿时间线自动合成旅行影片的自部署工具，与主站双向互链：

- 主站「青甘大环线」12 天行程已预置为该应用的内置行程，打开即可规划与成片；
- 种子数据由主站行程自动生成（唯一数据管道）：`npm run sync:travel-story`
  把 `app/journeys/qinggan-loop/trip-data.ts` 同步为 `travel-story/lib/kejourney-seed.data.ts`；
- 主站首页「Travel Story」卡片 ↔ 工具首页「KE 路书」双向入口；
- 运行：`cd travel-story && npm install && cp .env.example .env.local && npm run dev`；
- 集成说明与独立目录部署见 [travel-story/KEJOURNEY.md](travel-story/KEJOURNEY.md)。

## 图片与资料

详情页的图片署名、原始链接和资料来源维护在 `app/journeys/<slug>/detail-data.ts` 中。仓库中的不同图片可能采用不同的开放许可或转载条件；再次分发或商用前，请逐项遵守对应来源的许可要求。`public/detail/opt/` 下的 WebP 文件由脚本从原图生成，原图仍保留供 OG 分享图与旧浏览器兜底。

## 安全说明

- 不提交 `.env.local`、API Token、SSH 私钥或服务器配置凭据。
- 高德 Key 发布前应配置允许使用的域名。
- 路况与风险说明不替代交通主管部门、景区和现场人员的即时指引。
