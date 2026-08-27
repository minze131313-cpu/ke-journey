# KEJourney 微信小程序版 · 开发工作清单

> 目标：把 KE Journey（交互式自驾路书）以微信小程序形态发布，复用现有旅程数据与设计系统。
> 现状：Next.js 16 静态站 + 高德 JS API 2.0；数据集中在 `app/journeys/**`（TS 常量），设计规范见 `DESIGN.md`（token 唯一事实来源 `app/globals.css`）。

## 进度记录

- [x] 决策锁定：个人主体 / 原生 WXML / 地图方案 A（原生 map + 静态折线，零 Key）/ 640px 图本地打包。
- [x] 项目骨架 `miniprogram/`：project.config.json（已填真实 AppID）、app.json、app.js、sitemap.json。
- [x] 本地 CLI（路线二）全链路验证通过：islogin / open / preview / upload。
- [x] 数据管道：`scripts/export-mini-data.mjs`（Vite SSR 构建 `mini-export.entry.ts`）→ `miniprogram/data/journeys.js` + `journeys/<slug>/data.js`（module.exports 形态，规避 require('x.json') 打包器兼容问题）；图片取 640/400px 档并**转码 JPG**（代码包内 WebP 真机渲染不稳，v0.1.1 修复项）；`scripts/gen-marker-icons.mjs` 零依赖生成 5 个分类 marker 图标。本地图片在页面内统一使用相对路径。
- [x] 数据校验 `tests/mini-data.test.mjs`（stops 引用/坐标/图片存在性，2 项通过，`npm run test:mini`）。
- [x] 页面四件套：首页目录、行程主页（v0.2.0 重构：以「天」为索引的行程列表为核心，点击进入当天详情；路线地图/路况/清单为页面中下部辅助区块，顶部区块快跳）、逐日路线详情（含当日路线地图参考区块）、POI 详情（poiOrder 前后导航）+ 共享模板 `templates/detail.wxml`。
- [x] 设计系统落地：`app.wxss` 色板全表 + 组件样式 + 大字模式（3 档，storage 持久化）。
- [x] 小程序能力：分享（onShareAppMessage）、收藏、清单勾选持久化、`wx.openLocation` 导航、来源链接复制、关于/免责/隐私页。
- [x] 实拍打卡（v0.3.0，云开发 + DeepSeek 视觉 API）：拍照 → getLocation 定位 → 匹配最近节点（10km 阈值）→ 云存储 → 云函数 `cloudfunctions/analyze-photo`（`deepseek-v4-flash-vision-exp` 输出分类 scenic/city/supply/warning + 结合时间地点内容的一句话描述）→ 云数据库 `user_photos`；行程主页「实拍足迹」区块与 POI 页「我的实拍」区展示，长按删除（记录+云文件）。未配置环境 ID 时优雅降级。
  - 用户手动项：开通云开发环境（填 `miniprogram/config.js`）→ 创建 `user_photos` 集合（仅创建者可读写）→ 云函数环境变量 `DEEPSEEK_API_KEY` → 右键部署云函数（云端安装依赖）→ 后台申请 getLocation 接口权限 → 更新隐私保护指引（位置/摄像头/图片上传）。
- [x] 分包：主包（首页/关于/模板/公共资源）+ `journeys/qinggan-loop` 分包，`preloadRule` 预加载。
- [x] E2E `tests/mini-e2e.mjs`：直连 IDE 自动化 WebSocket 协议（不依赖 miniprogram-automator，其与新版 IDE 协议不兼容），全页面走查 + 运行时错误收集，全部通过（`npm run e2e:mini`）。
- [ ] 待办（用户手动，进行中）：小程序平台权限与隐私申请审核（getLocation 接口权限、用户隐私保护指引、ICP 备案）→ 确认云函数环境变量与超时 10s → 设体验版 → 真机拍照验证 → 提审 → 发布。代码与云端均就绪（v0.3.1 + cloudbase 环境修复版云函数），恢复时从体验版设置开始。

## 关键差异（决定整体方案的三件事）

1. **地图引擎**：Web 用高德 JS API；小程序原生 `<map>` 组件底层是腾讯地图。数据坐标为 GCJ-02（高德），腾讯底图同为 GCJ-02，**无坐标偏移问题**，但图层能力（卫星/路况开关、地图样式）与驾车规划 API 需重新设计或降级。
2. **运行环境**：无 DOM / 无 npm 浏览器库 / 无 localStorage；WXML+WXSS 或 Taro 等框架；页面栈与分包机制。
3. **包体积**：主包/单分包 ≤ 2M，总包 ≤ 30M。现有 `public/detail/opt` 的 640px 档 WebP 合计约 864K，可本地打包；原图 17M 需走 CDN 或放弃。

---

## 0. 决策记录（已锁定）

- [x] **账号主体：个人**
  - 影响：不能使用 web-view（H5 嵌入方案作废）；可选类目收窄，需在公众平台现场确认；map 组件、openLocation、分享、订阅消息等基础能力不受主体限制。
  - 合规新增项：小程序需完成 **ICP 备案**（自 2023-09 起新注册小程序发布前必须备案，个人主体可备案，建议开工首日提交，与开发并行）。
- [x] **技术路线：原生 WXML/WXSS**（不引框架，无编译链，包体积最小、审核路径最简）。
- [x] **地图方案 A**：原生 `<map>` 组件（腾讯底图，GCJ-02 与数据坐标一致，无偏移）+ 数据自带折线渲染；默认底图即可，无需任何 Key。
  - 实时驾车规划（时间/过路费）→ MVP 砍掉，页面以静态文案呈现（web 版对应 `amap-metric` 卡片降级）。
  - 高德 amap-wx SDK、腾讯位置服务个性化地图（subkey）→ 后补项，个人开发者 Key 配额受限，暂不进入 MVP。
- [x] **图片策略：640px WebP 本地打包**（合计约 864K，随旅程分包分发，零域名依赖）；原图 17M 不上 CDN，MVP 不配任何合法域名。

## 1. 资质与平台准备

- [ ] **开工首日：提交小程序 ICP 备案**（公众平台「设置-基本设置」走流程，个人主体需身份证等材料；审核约 1~2 周，与开发并行，勿放到最后）。
- [ ] 注册微信小程序账号（个人主体）、完善名称/头像/简介，沿用 KEJourney 品牌与 DESIGN.md 色板。
- [ ] **类目现场确认（第一步做，有备选）**：在公众平台「设置-服务类目」确认个人主体可选类目。优先「旅游 > 旅行攻略/旅行资讯」；若个人不可选，备选「工具 > 信息查询」或「生活服务 > 生活查询」等开放类目，并将小程序定位表述为「自驾路书查询工具」而非交易/导览服务。类目决定审核与分享文案口径。
- [ ] 开通开发者权限、添加体验成员。
- [ ] MVP 不配置任何合法域名（全静态数据 + 本地图片）；`wx.openLocation` 调起系统内置地图，无域名依赖。
- [ ] 隐私保护指引：不采集个人信息则声明「不涉及」（`wx.openLocation` 不触发位置授权，无隐私接口）。
- [ ] 免责声明文案延续 web 版：「路况与风险说明不替代交通主管部门、景区和现场人员的即时指引」，落地到小程序「关于」页与风险卡。

## 2. 数据管道（单源真值：`app/journeys/**`）

- [ ] 新增 `scripts/export-mini-data.mjs`：把 `registry.ts` + 各旅程 `trip-data.ts` / `detail-data.ts` / `config.ts` 编译为 `dist-mini/data/<slug>.json`（poiDetails/routeDetails 平铺，去掉 TS 类型）。
- [ ] JSON 数据校验脚本（对齐 `tests/rendered-html.test.mjs` 思路）：`stops` 引用 `places.id` 完整、`route` 坐标数、图片路径存在于打包清单、必填字段齐全。
- [ ] 图片管道：`public/detail/opt/*.{400,640}.webp` 复制进对应旅程分包的 assets 目录，生成小程序侧 manifest（对齐 `generated/image-manifest.ts` 的用法）。
- [ ] 校验与导出纳入 CI / `package.json` scripts（如 `export:mini`），数据变更后小程序 JSON 自动重建。
- [ ] 更新 README「新增旅程」流程：四件套写完后跑导出脚本，双端同步发布。

## 3. 设计系统移植（`DESIGN.md` → WXSS）

- [x] 色板 token 全表移植到 `app.wxss` CSS 变量（ink/paper/teal 系/gold/danger/blue/coral/border…）。
- [ ] 字体：标题 `Songti SC`（iOS）+ Android `serif` 系统衬线 fallback；`wx.loadFontFace` 子集化因需要域名配置列为后补项，MVP 用系统字体。
- [ ] rpx 排版与间距/圆角/投影（仅两层 Flat/Raised）按手机断点落地。
- [ ] 通用组件样式：卡片、按钮、眉题、风险卡、图例色（gold 景点 / teal 城镇 / blue 补给 / danger 风险）。
- [ ] 大字模式：全局字号 scale + storage 持久化（对照 `components/text-size-toggle.tsx`）。

## 4. 页面与组件开发

- [ ] 首页：旅程目录卡片（registry 驱动），对应 `app/page.tsx`。
- [ ] 旅程地图页（核心，见第 5 节），对应 `app/[journey]/page.tsx` + `components/journey-map.tsx`。
- [ ] 逐日路线详情页，对应 `app/[journey]/route/[day]/page.tsx`：hero、画廊、节奏时间线（rhythm）、警示、来源。
- [ ] POI 详情页，对应 `app/[journey]/poi/[id]/page.tsx`：hero/gallery/stats/sections/highlights/actions/cautions/sources，按 `poiOrder` 提供前后导航。
- [ ] 图集轮播（swiper），对照 `components/detail-media-carousel.tsx`；图片组件对照 `media-image.tsx`（本地 WebP 直读，无 srcset）。
- [ ] 详情页前/后导航与相关节点跳转（detail-pages 的 prev/next 逻辑）。
- [ ] 404/空态页（对应 `app/not-found.tsx`）。

## 5. 地图页迁移（最大风险点，先做 spike 验证；方案 A 已锁定）

- [ ] 原生 `<map>`（默认底图，零 Key）：markers（4 类分类图标 + 颜色）、polyline（每日路线 + `closedRoads` 封闭段）。
- [ ] 页面结构沿用 web 版移动端 4 视图（地图/行程/路况/清单）：只有「地图」视图使用原生 map 组件，其余为普通 scroll-view —— 规避原生组件层级（cover-view）问题；地图内浮层（顶栏/图例/节点弹卡）用 cover-view 或同层渲染，spike 阶段验证。
- [ ] `includePoints` 复刻 `setFitView` 行为（整体 / 单日 / 单点缩放）。
- [ ] 分类 × 天数筛选，marker 显隐（对照 filter 逻辑）。
- [ ] `markertap`/callout → 节点弹卡 → 详情跳转。
- [ ] 驾车规划降级：静态折线完整呈现路线；web 版的实时时间/过路费（`AMap.Driving`）以静态文案替代，UI 上标注「里程/耗时以数据为准」。
- [ ] 卫星/路况开关：小程序 map 无内置交通图层，砍掉；「关于」页说明与 web 版差异。
- [ ] 风险段呈现：`roads.alert` 绕行卡 + 封闭段红色折线 + `roads.notes`。
- [ ] 后补（不进 MVP）：腾讯位置服务个人 Key + 个性化地图风格（whitesmoke 近似）；高德小程序 Key + amap-wx `getDrivingRoute` 实时规划。

## 6. 小程序特有能力

- [ ] 分享：`onShareAppMessage`，旅程/节点分享卡片（5:4 分享图，用现有 WebP）。
- [ ] 收藏旅程：`wx.setStorageSync`（对齐 web 版本地状态）。
- [ ] 清单勾选持久化（checklist 交互）。
- [ ] 节点「导航」：`wx.openLocation`（调起系统地图，用户可选高德/腾讯）。
- [ ] 数据导出替代：web 版下载 JSON → 小程序改为复制到剪贴板或生成路书长图。
- [ ] 订阅消息（可选，路况提醒需后端，MVP 砍）。
- [ ] 离线说明：数据与 640px 图本地打包可离线阅读；地图瓦片需网络，弱网态提示。

## 7. 测试与性能

- [ ] 数据一致性测试（JSON 校验，见 2.2）。
- [ ] 微信开发者工具 + 真机（iOS/Android）全页面走查。
- [ ] 分包策略：主包 = 首页 + 公共组件；每个旅程一个分包（`preloadRule` 预加载青甘环线）。
- [ ] 图片 `lazy-load`、长列表性能、包体积监控。
- [ ] 弱网/无网、大字模式、分享落地页可达性。
- [ ] 审核自查：类目资质、隐私指引、免责声明（路况信息「不替代主管部门与现场指引」文案延续 web 版）。

## 8. 发布与持续维护

- [x] **本地 CLI（路线二）已落地**：`scripts/devtools-cli.mjs` 封装开发者工具 CLI（open/preview/upload/build-npm/islogin/login/close），npm 脚本 `mp:*`；项目骨架在 `miniprogram/`。前置：开发者工具「设置 → 安全设置」开启服务端口；本机沙箱下跑 CLI 需注意 `.cli` 握手文件写入工具配置目录。
- [ ] `miniprogram-ci`（官方 npm，无需开发者工具）自动上传**开发版本** + `preview` 生成预览二维码；AppID、上传密钥、IP 白名单配置在公众平台「开发管理-开发设置」，密钥存 CI secrets（.gitignore）。
- [ ] 版本号策略：`robot` 参数区分发版流（如 robot 1=dev / 2=staging），版本描述带数据导出哈希。
- [ ] **自动化边界**：个人主体无提审/发布 API —— 体验版设置、提交审核、发布均在公众平台手动完成；CLI 只负责「打开项目/预览/上传开发版本」。
- [ ] 与 web 版的数据同步发布流程：旅程数据更新 → 双端导出与回归 → CLI 上传 → 人工提审。
- [ ] 意见反馈入口（可选：客服消息或表单）。

## 风险提示

- 地图能力降级（路况/卫星图层、驾车规划）需与用户预期对齐，README/关于页说明差异。
- 图片版权与署名体系在小程序端延续（`detail-data.ts` 的 credit/sources）。
- 类目与资质要求以微信公众平台最新规则为准，开工前核实。

## 粗略排期（MVP：青甘大环线单旅程）

- 第 1 节（备案提交 + 账号注册 + 类目确认）：开工首日半天，备案审核 1~2 周期间并行开发
- 第 2 节数据管道：2~3 天
- 第 5 节地图 spike：1~2 天
- 第 3~4 节页面与设计：5~7 天
- 第 6~7 节能力与测试：3~4 天
- 第 8 节提审发布：2~3 天（前提：备案已通过）
- 合计约 **2~3 周 / 10~15 人日**，整体受备案完成时间约束

## 执行顺序（推荐起点）

1. 公众平台注册账号 → 立即提交备案、确认个人可选类目（同时进行，不阻塞开发）。
2. `scripts/export-mini-data.mjs` 数据管道 + JSON 校验（其余一切依赖它）。
3. 地图 spike（markers/polyline/includePoints/浮层层级验证），风险最大的部分最先验证。
4. 设计系统 WXSS → 页面四件套（首页/地图/路线详情/POI 详情）。
5. 小程序能力（分享/收藏/清单/导航跳转）→ 真机测试 → 提审。
