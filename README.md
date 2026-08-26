# KE Journey

一个面向自驾旅行的交互式中文路书网站。首页承载旅程目录，每条旅程包含交互地图、逐日线路、景点、住宿、补给、风险提示以及图文详情页。

当前收录：

- 青甘大环线：12 天、约 3,000 公里
- 25 个地图节点
- 12 段逐日线路
- 手机端 APP 化交互与大字模式

线上版本：[ke-journey.bordy.cn](https://ke-journey.bordy.cn/)

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

## 图片与资料

详情页的图片署名、原始链接和资料来源维护在 `app/journeys/<slug>/detail-data.ts` 中。仓库中的不同图片可能采用不同的开放许可或转载条件；再次分发或商用前，请逐项遵守对应来源的许可要求。`public/detail/opt/` 下的 WebP 文件由脚本从原图生成，原图仍保留供 OG 分享图与旧浏览器兜底。

## 安全说明

- 不提交 `.env.local`、API Token、SSH 私钥或服务器配置凭据。
- 高德 Key 发布前应配置允许使用的域名。
- 路况与风险说明不替代交通主管部门、景区和现场人员的即时指引。
