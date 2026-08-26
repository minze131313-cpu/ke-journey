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
```

## 项目结构

```text
app/
  page.tsx                         旅程目录首页
  qinggan-loop/                    青甘大环线路由
  components/qinggan-map.tsx      交互地图与行程面板
  trip-data.ts                     POI、逐日路线和坐标数据
  detail-data.ts                   景点与路段图文资料、来源和图片署名
public/detail/                     经核验的地点图片
tests/                             静态页面回归测试
```

## 新增旅程

当前青甘大环线可作为新旅程的实现参考。新增路线时建议：

1. 在首页旅程目录增加一张卡片与独立 slug。
2. 将路线、POI、住宿、补给和风险点维护为结构化数据。
3. 为每个 POI 与路段建立详情页，并按真实行驶顺序配置前后导航。
4. 图片必须逐张核对地点、版权与署名；资料优先引用政府、景区、国际地理及知名旅行媒体。
5. 道路管制、预约、票务和高原健康信息需要在出发前再次核验。

后续可以把 `trip-data.ts` 和 `detail-data.ts` 拆分到 `journeys/<slug>/`，进一步形成可复用的多旅程数据层。

## 图片与资料

详情页的图片署名、原始链接和资料来源维护在 `app/detail-data.ts` 中。仓库中的不同图片可能采用不同的开放许可或转载条件；再次分发或商用前，请逐项遵守对应来源的许可要求。

## 安全说明

- 不提交 `.env.local`、API Token、SSH 私钥或服务器配置凭据。
- 高德 Key 发布前应配置允许使用的域名。
- 路况与风险说明不替代交通主管部门、景区和现场人员的即时指引。
