# KE Journey UI/UX 设计评审报告

> 评审范围：`DESIGN.md`、`app/globals.css`（646 行全读）、`app/page.tsx`、`app/[journey]/page.tsx`、`app/components/journey-map.tsx`、`app/components/detail-pages.tsx`、`app/components/detail-media-carousel.tsx`、`app/components/media-image.tsx`、`app/components/text-size-toggle.tsx`、`app/not-found.tsx`、`app/layout.tsx`，并 curl 校验了线上 `https://ke-journey.bordy.cn/` 与 `/qinggan-loop/` 的 HTML。
> 结论等级：P0 = 必须修复（影响可用性/可读性底线）；P1 = 应当尽快修复；P2 = 建议优化。

---

## 一、总体印象

整体审美方向与 `DESIGN.md` 的「Warm Editorial · 旅行杂志」定位一致——暖白纸底、青绿主强调、衬线大标题、留白节奏在首页与图文详情页都成立，尤其详情页的章节编号、眉题、来源列表与时间轴，确有《孤独星球》特稿的编辑气质。但实现层存在「两层 CSS 叠加」的现象：基础层是克制的编辑风，`list-1` 与 `list-4` 两个补丁层又大面积引入渐变、常驻大投影、玻璃拟态（backdrop-blur）与 8–9px 的超小字号，把系统悄悄推向「SaaS 仪表盘」审美。最大的结构性问题不在视觉，而在排版与可访问性——正文以下遍布 8–11px 的次级文本，且大量灰色/青绿/金色文本对比度低于 4.5:1，移动端安全区适配又因缺少 `viewport-fit=cover` 而基本失效。地图主界面的信息密度与交互组织是好的，但它是「工具」，不是「杂志」，与规范里「一个页面一个强调色、大量留白」的纪律明显张力。

---

## 二、与 DESIGN.md 不符之处（逐条）

### 2.1 断点与规范不一致
- **问题**：DESIGN.md 规定桌面 ≥1024 / 平板 640–1023 / 手机 <640。实现用的是 900、800、560、520、500、420 六档（`globals.css:136 / 333 / 352 / 429 / 449 / 553 / 565 / 578 / 621`），主界面在 900px 就退成单列（`:333`），详情页在 800px 退单列（`:429`），与「平板 640–1023 并排两栏」矛盾。
- **建议**：统一为 1024 / 640 两档语义断点（可再补 360 兜底），把现有 900/800/560/520/500/420 的零散断点收敛为带注释的 token 级断点。
- **优先级**：P1

### 2.2 Hero 高度不符
- **问题**：DESIGN.md 要求「Hero min 72vh」。`.journey-hero { min-height:680px }`（`:76`）是固定像素；在 1080p 视口下 72vh≈777px，实际更矮，仅在 ≤900px 时退化为 `100svh`（`:137`）。
- **建议**：桌面改为 `min-height:72vh`（或 `clamp(680px,72vh,900px)`），保持「短标题配大视口」的编辑节奏。
- **优先级**：P2

### 2.3 大量一次性 hex，未走 token
- **问题**：DESIGN.md 明确「颜色必须来自 token，不要发明新的 hex」。组件规则里仍有大量裸色值：`#8f493f`（`.road-alert button`，`:228`）、`#fff8f5`（`.safe-route`，`:225`）、`#1f3430`（`.emergency-card`，`:238`）、`#b9cec8`（`:324`）、`#d7d1c3`/`#9bb7af`（`:166-167`）、`#83a9a1`/`#8db1a9`（`:187/213`）、`#d8d4c8`/`#d8d4ca`/`#dcd8ce`/`#dedad0`/`#ded9cc`/`#e4e0d7`/`#eee2ce`（`:212/302/421/408/234/410/529`）等；`config.ts:43` 的封路色 `#c54b3f`、`trip-data.ts` 的逐日路线色（`#315f59`、`#2b8c82`、`#c79331`…）也是新 hex，且超过了 DESIGN 规定的四类地图类别色。
- **建议**：把这些色值收敛为语义 token（如 `--danger-deep`、`--surface-pink`、`--surface-dark`、`--border-strong`）；逐日路线色改在 `:root` 里建 `--day-1..12` 或从 teal/gold 明度阶梯派生。
- **优先级**：P1

### 2.4 渐变违反「不用渐变」规则
- **问题**：DESIGN.md 明确「❌ 不用渐变（照片叠加除外）」。实际出现大量 UI 渐变：`body`（`:458`）、`.journey-index` 双 radial（`:459-462`）、`.journey-card-soon`（`:468`）、`.sidebar`（`:471`）、`.brand-mark`（`:472`）、`.tabs button.active`（`:477`）、`.all-route-card.active`（`:478`）、`.filter-pills button.active`（`:482`）、`.route-direction-card > span`（`:499`）、`.detail-shell` radial（`:502-504`）、`.detail-header` 五条（`:507-509`）、`.lead-card`（`:510`）、`.text-size-toggle`（`:538`）、`.mobile-bottom-nav button.active i`（`:588`）。
- **建议**：照片叠加可保留；纯色块类（body/detail-header/lead-card/tabs/按钮激活态）退回平涂 token，符合「Flat 编辑风」。
- **优先级**：P1（`detail-header`/`lead-card`/`body` 影响全局氛围，其余按钮类为 P2）

### 2.5 投影使用违反「Flat by default」
- **问题**：DESIGN.md 要求「默认一律无投影，仅悬停/浮层抬升」。实现里大量**常驻**大投影：`.journey-card`（`:467`，`0 22px 60px`）、`.brand-mark`（`:472`）、`.detail-figure`（`:389`）、`.lead-card`（`:395`）、`.highlight-card`（`:408`）、`.gallery-grid figure`（`:516`）、`.media-carousel`（`:520`）、`.detail-header` 之外的面板/浮层（`:485`）等。
- **建议**：卡片默认去影、悬停再 `--elev-raised`；仅真正浮在地图上的面板（`.route-panel`/`.place-panel`/`.text-size-toggle`/底部导航）保留常驻投影。
- **优先级**：P1

### 2.6 圆角越界（<8px / >24px）
- **问题**：DESIGN.md 规定 8–24px。`.highlight-card { border-radius:4px 4px 16px 16px }`（`:408`）顶部 4px；`.not-found-actions a { border-radius:2px }`（`:638`）；`.journey-card { border-radius:26px }`（`:467`）超过 24px。
- **建议**：4px→8px、2px→10px、26px→22px（`--radius-lg`）。
- **优先级**：P2

### 2.7 输入控件形态不符
- **问题**：DESIGN.md「输入：仅下划线（无外框），聚焦变青绿」。`.search-wrap` 是带 1px 外框 + 11px 圆角的胶囊盒（`:174`），内部 input `outline:0`（`:176`）且无 `:focus` 态。
- **建议**：要么改为无框下划线 + 聚焦青绿基线（并补 `:focus-visible`），要么把「胶囊搜索盒」明确写进 DESIGN.md 作为例外。
- **优先级**：P2

### 2.8 一屏一强调色被突破
- **问题**：DESIGN.md「一屏一强调色」。`.summary-card` 四格同时用青/金/蓝/珊瑚四个淡底（`:474-475`）；hero 渐变同时带青绿+金+珊瑚（`:463`）；地图侧虽属「类别色」豁免，但叠加了金色 `route-direction-card` 渐变、金色 pin、蓝色 supply pin 与红色 warning 同屏。
- **建议**：摘要卡四格改为单一中性表面（仅数值用 teal 强调）；hero 去掉 coral 端；地图侧维持类别色但减少装饰性第二强调（方向卡改纯 teal）。
- **优先级**：P2

### 2.9 字号体系背离「正文 16–18px」意图
- **问题**：DESIGN.md「中文排版：正文 16–18px、行高 1.85」。虽然详情页正文做到了 15–18px，但地图侧边栏与元信息普遍 8–11px：`.summary-card span` 9px（`:172`）、`.day-copy small` 9px（`:201`）、`.day-metrics small` 8px（`:204`）、`.day-detail > p` 10px（`:206`）、`.route-stat-grid small` 8px（`:289`）、`.map-legend span` 8px（`:270`）、`.journey-card-body dt` 8px（`:119`）等。
- **建议**：把「工具型」字号下限提到 12px（元信息），正文 14–16px；8px 仅留给真正装饰性英文眉题，且不得承载关键信息。
- **优先级**：P0（这是全站可读性底线的核心问题，详见第七节）

### 2.10 次级/三级文本对比度不达标
- **问题**：DESIGN.md「正文/元信息在 --paper 上需 ≥4.5:1」。实测（`#fff8ec` 底）：`--muted #61787c`=4.43、`--meta #9a742f`=4.05、`--teal #07877e`=4.16、`--muted-2 #8a918e`=3.05、`#87908d`=3.11、`#9aa19f`=2.49、`#8b9491`=2.95、`#929b98`=2.70，均不达标或贴线。
- **建议**：见第七节。
- **优先级**：P0

---

## 三、视觉层级与色彩

- **问题**：hero 区（首页）层级清楚：眉题 → 大标题 → 摘要 → CTA，衬线标题是视觉锚点；但 CTA 与眉题都用「金/米色」，与主标题的白色之间缺少明确的第三级差异，按钮又是描边胶囊（`:92/:465`），主次行动的区分度弱。
- **建议**：把「浏览旅程」做成青绿填充主按钮（符合规范「主按钮=青绿填充」），眉题保留金色；一屏内主行动与装饰金色不再争夺注意力。
- **优先级**：P2

- **问题**：地图主界面层级靠「投影+半透明白」堆出来，但 `list-1` 又给 `.filter-pills`、`.map-legend`、`.status-pill`、`.layer-controls` 统一加了 `backdrop-filter:blur(16px)`（`:481`），属于 DESIGN 明确禁止的玻璃拟态倾向；与基础层「flat 卡片」并存，风格打架。
- **建议**：去掉地图浮层的 backdrop-blur，改用更高不透明度的 `--surface`（0.98）承载层级；玻璃拟态要么彻底不用，要么写进规范。
- **优先级**：P2

- **问题**：`.detail-header` 用渐变（`:507-509`）后，`.detail-header::after` 的大圆环装饰（`:377`）几乎不可见，两套装饰互相抵消；`.context-band::after` 的 170px「环」字（`:412`）是很好的编辑式点缀，建议保留并放大。
- **建议**：header 改回平涂 `--accent` 深色，让圆环装饰重新成为焦点；「环」字水印保留。
- **优先级**：P2

- **问题**：`.journey-hero` 的 CSS 背景图（`:463` 的 `url('/detail/qinghai.jpg')`）与 JSX 里的 `.journey-hero-bg <picture>`（`page.tsx:15`）**加载了同一张图两次**，且两层都叠加了渐变（`:79/:80` + `:463`），色彩更深、更「脏」。
- **建议**：二选一——保留 `<picture>`（可响应式 + WebP），删掉 `:463` 的 `url()` 与重复渐变；或反之。当前实现是冗余 + 双倍解码。
- **优先级**：P1

---

## 四、中文排版

- **问题**：标题字距在中文大标题上用 `-0.02em`（`.journey-hero-copy h1` `:90`、`.detail-title-wrap h1` 用 `+0.02em` `:385`）方向不一致；中文负字距在 46–86px 时偏挤，`+0.02em` 又显松散。
- **建议**：统一为 0 或极小的 `0.01em`，仅英文/数字使用负字距（规范里 `--tracking-display` 本来就是 -0.02em，但只应作用于 >40px 的**拉丁/数字**场景）。
- **优先级**：P2

- **问题**：行内数字/单位混排细节不统一：`约 3,000 km`（`registry.ts:16`）用半角空格，`.coordinate` 用 `&nbsp;&nbsp;`（`detail-pages.tsx:65`），地图里程 `450–500 km`（`trip-data.ts:51`）用连字符区间；「5–10 月」用 en dash，整体可读但单位前后空格不一致。
- **建议**：统一「数字+空格+单位」与「数字区间 en dash」约定，抽成常量或写进 DESIGN.md 的中文排版规范。
- **优先级**：P2

- **问题**：正文未使用两端对齐（justify），段落右侧参差不齐在长文场景尚可，但 `.journey-section-head > span` 桌面 `text-align:right`（`:102`）右对齐一段 13px 说明文字，行长与基线都不稳，阅读体验欠佳。
- **建议**：该说明文字改左对齐或保持右对齐但限制 `max-width` 更窄、字号提到 14px；长文正文可加 `text-wrap: pretty`（渐进增强）。
- **优先级**：P2

- **问题**：眉题大量使用「全大写英文 + 宽字距」符合规范，但部分眉题混排中文后字距仍 0.16em（如 `FIELD NOTES · ROAD TRIPS · MAPS` 是英文没问题；`.pager-progress small` `JOURNEY ORDER` 也可），而 `.brand-copy p` 用中文却 `letter-spacing:.13em`（`:164`），中文加宽字距会显散。
- **建议**：中文字段去字距或降到 0.05em，仅英文/数字眉题保留宽字距。
- **优先级**：P2

---

## 五、组件细节

- **问题**：`.detail-figure`（`:389-394`）、`.detail-gallery`（`:513`）、`.gallery-grid`（`:515-518`）、`.gallery-intro`（`:514`）在 TSX 中**零引用**（grep 验证为 0 处），是死代码；`.detail-figure img { height:470px }` 等维护成本与体积白付。
- **建议**：删除未使用的 detail-figure / gallery 系列规则，或明确它们是「即将上线」的 gallery 组件并标注 TODO。
- **优先级**：P2

- **问题**：`.journey-hero-copy > a` 基础层写 `border-radius:2px`（`:92`）随后被 `:465` 覆盖为 `999px`，`border-radius:2px` 是死值；`.journey-card` 基础层无圆角（`:104`）到 `:467` 才补 26px——补丁层依赖顺序生效，一旦重排 CSS 就会回退成直角/2px。
- **建议**：收敛覆盖链，基础层直接写终值，补丁层只做「色板/氛围」级覆盖，避免「结构依赖层叠顺序」的脆弱写法。
- **优先级**：P2

- **问题**：`.search-wrap` 的清空按钮是 22×22px（`:178`），远小于 44px 命中区（DESIGN 要求 ≥44px）；`.place-close` 26px（`:307`）、`.active-day-banner button` 22px（`:279`）同理；移动端部分补到 44px（`:603`）但桌面仍小。
- **建议**：交互按钮统一 ≥44×44（或视觉 22px + 透明 44px 热区）。
- **优先级**：P1

- **问题**：图例/类别符号语义与文案不完全一致：`filter-pills` 里「city=住宿」、图例「city=住宿」一致，但 `poi-pin` 用单字「宿」而 `loop-terminal-pin` 用「起/终」双字（`journey-map.tsx:65`），`.day-number` 用 `D1` 前缀而 pin 用单字，多套符号系统并存，认知成本偏高。
- **建议**：地图 pin、图例、过滤按钮、详情 icon 统一为同一套「景/宿/补/险」四符号 + 起终点专用「起终」。
- **优先级**：P2

- **问题**：`.route-stop-list > *::after` 用 `→` 连接（`:299`），但列表项是 `<b>` 与 `<button>` 混排，`→` 对按钮的文字节点伪元素生效，视觉与语义都脆；`route-node-flow` 里 `::after` 的箭头（`:427`）在横向滚动时会与下一卡片重叠（`:427 right:-8px`）。
- **建议**：箭头改由 `<em aria-hidden>` 元素渲染，避免伪元素 `content:"→"` 被屏幕阅读器读出（部分浏览器会读）；节点流箭头缩小重叠或加背景遮挡。
- **优先级**：P2

- **问题**：`route-panel`/`place-panel` 桌面 `max-height:calc(100vh - 100px)`（`:281/:306`）在短屏上内容被压缩，但无「sticky 头部 + 滚动正文」结构，关闭按钮会随滚动消失。
- **建议**：面板内把 `.place-close` 与标题做成 sticky 头，正文独立滚动，避免长面板里找不到关闭入口。
- **优先级**：P2

---

## 六、移动端响应式

- **问题（严重）**：全站大量使用 `env(safe-area-inset-*)`（`:430/445/557/582-583/585/590-592/606-611` 等 20+ 处），但 `layout.tsx` 未声明 `viewport-fit=cover`，线上 HTML 的 viewport 是 `width=device-width, initial-scale=1`——**iOS 刘海屏/底部 Home 指示条下这些 inset 恒为 0**，底部导航与面板会顶到 Home 指示条、内容被刘海遮挡。
- **建议**：在 `layout.tsx` 增加 `export const viewport: Viewport = { width:"device-width", initialScale:1, viewportFit:"cover" }`。
- **优先级**：P0

- **问题**：断点体系与规范不一致（见 2.1），且 `list-1` 与 `list-4` 两个 `@media (max-width:900px)` 块对同一批元素重复定义（`.place-panel/.route-panel` 的 bottom 在 `:592` 与 `:345`、`.detail-pager` bottom 在 `:562` 与 `:607` 两次取值 70px/72px），维护困难、易出回归。
- **建议**：合并同一断点内的规则，删除被覆盖的旧值。
- **优先级**：P1

- **问题**：移动端侧边栏 `.sidebar { inset:0 12% 0 0 }`（`:335`）滑出时**没有遮罩/背板**，用户无法点击空白处关闭，只能点底部「地图」按钮；右侧 12% 露出的地图仍可交互，易误触。
- **建议**：加半透明 scrim（点击关闭）+ 打开时锁定地图交互；或把侧边栏改为全宽抽屉。
- **优先级**：P1

- **问题**：`.detail-shell` 在 ≤900px 的 `padding-bottom:calc(212px + safe-area)`（`:606`）明显大于实际固定元素高度（`detail-mobile-nav` ~68px + `detail-pager` ~62px），页面底部留出大面积空档；而桌面 `padding-bottom:122px`（`:573`）又可能不够 pager 与内容间距。
- **建议**：按「底部导航高 + pager 高 + 间距」精确计算，桌面/移动分开给变量，避免拍脑袋的 212px。
- **优先级**：P2

- **问题**：`.poi-pin b`（地图上文字标签）在 ≤900px 被整体隐藏（`:617`），只留色块 pin，移动端地图信息量骤降；虽然降低了拥挤，但「景/宿/补/险」单字 pin 无名称，用户需逐个点击才知道是什么。
- **建议**：移动端至少保留当前选中/高亮的 pin 名称，或提供「点击展开名称」的轻量气泡，而不是一律隐藏。
- **优先级**：P2

---

## 七、可访问性

- **问题（严重）**：全站 8–10px 的元信息文字不可读且违反 WCAG 1.4.4 的可读性底线，见 2.9 与 2.10 的对比度实测（`#9aa19f` 2.49、`#8b9491` 2.95、`#929b98` 2.70 等）。地图侧边栏的关键信息（里程、驾驶时长、住宿）恰恰都落在这些超小字号上。
- **建议**：元信息字号提到 ≥12px，关键数值 ≥14px；把 `--muted-2`、各类 8px 灰统一换成 ≥4.5:1 的色值。
- **优先级**：P0

- **问题**：`--teal #07877e` 作为链接/主行动在暖白底上对比 4.16:1，白字 on teal 4.40:1，均低于 4.5:1；`.booking-note span` 白字 on `--gold` 仅约 1.96:1（`:318`），`.poi-scenic span` 白字 on gold 同样低对比（`:327`）。金色作为文字/白字底色完全不达标。
- **建议**：链接与主按钮改用 `--teal-dark`（7.12:1）或加深 teal；金色只做装饰色与图形填充，凡承载文字处换深金棕 `--meta`/`--gold-deep` 并校验。
- **优先级**：P0

- **问题**：`.search-wrap input { outline:0 }`（`:176`）且无 `:focus`/`:focus-visible` 样式，键盘用户聚焦搜索框时**没有任何可见反馈**；全站仅 `.media-carousel:focus-visible`（`:520`）与 `.media-edge-controls button:focus-visible`（`:527`）有自定义聚焦态，其余链接/按钮靠 UA 默认蓝框，与设计语言割裂且部分被 `border:0` 按钮弱化。
- **建议**：全局补 `:focus-visible` 统一聚焦环（`outline:2px solid var(--teal); outline-offset:2px`），搜索框改为聚焦变青绿基线（见 2.7）。
- **优先级**：P1

- **问题**：地图分栏 `.tabs button`（`:181`）与 `.filter-pills button`（`:259`）、`.layer-controls button`（`:265`）是「单选/开关」语义，却未用 `role="tablist"/aria-selected` 或 `aria-pressed`；`.layer-controls` 的「卫星/路况」是 toggle 也没有 `aria-pressed`。屏幕阅读器无法判断选中状态。
- **建议**：tabs 用 `role=tablist/tab + aria-selected`；filter/layer 按钮加 `aria-pressed`。
- **优先级**：P1

- **问题**：图标大量用 `<i>`/`<span>` + 文字符号（`→`、`↓`、`×`、`⌕`、`↻`、`✓`），部分会被读屏读出或完全无语义（`<i>` 语义误用）；`markerContent` 用 innerHTML 注入的 pin 虽有 `aria-label`，但 map 容器本身 `.map-canvas` 只是带 `aria-label` 的 div，无 `role`，键盘无法平移地图。
- **建议**：装饰符号加 `aria-hidden="true"`，交互图标配 `aria-label`；`.map-canvas` 增加可聚焦的说明与键盘替代（至少提供列表侧边栏作为等价路径）。
- **优先级**：P2

- **问题**：`.map-loader` 有无限 `pulse` 动画（`:246/:250`），全站多处过渡/transform 动画，但没有任何 `@media (prefers-reduced-motion: reduce)` 降级。
- **建议**：全局加 reduced-motion 兜底，关闭 pulse 与位移动画。
- **优先级**：P2

- **问题**：`text-size-toggle` 在 `useEffect` 里读 localStorage（`text-size-toggle.tsx:10-15`），「大字」用户在首屏会先看到标准字号再闪跳（FOUC）；且该组件的放大只覆盖白名单选择器（`globals.css:543-551`），许多 8px 文本不在清单内，放大能力不完整。
- **建议**：改为 SSR 前读 cookie / 内联脚本提前设置 `data-text-scale`，避免闪跳；放大规则改为基于 `rem` 的全局缩放（根字号放大），而非逐选择器 `!important` 打补丁。
- **优先级**：P1

---

## 八、视觉相关性能（字体 / 图片 / CLS）

- **问题**：`layout.tsx` 用 `next/font` 加载 Geist 与 Geist_Mono 两个字体，首页/详情页 HTML 均预加载两个 woff2（线上确认 `<link rel="preload">`）；但 CSS 只引用 `var(--font-geist-mono)`（`globals.css:45`），`--font-geist-sans` 全文件无引用——**Geist Sans 是白加载的字节与网络请求**。
- **建议**：删除 `Geist` 的加载（或仅在真正用到拉丁无衬线时保留），保留 `Geist_Mono`。
- **优先级**：P1

- **问题**：hero 背景同图加载两次（CSS `url()` + `<picture>`，见 3.4），且 CSS 背景图不参与 `<picture>` 的 WebP/srcset 优化，等于一次全尺寸 JPG 解码浪费。
- **建议**：删除 CSS 背景图，只保留 `<picture>`（已带 640/1080/1600 WebP srcset）。
- **优先级**：P1

- **问题**：`media-image.tsx` 的 `widths = [640,1080,1600]` 写死（`:3`），而 `image-manifest` 里 `delingha` 只有 400 档（`image-manifest.ts:15`），导致 `/detail/opt/delingha.400.webp` 永远不会被引用，该图回退到原始 JPG；`emerald`/`uroad`/`xining` 只有 640 档，能命中但档位偏少。
- **建议**：把 `widths` 从 manifest 动态推导（或补齐 400 档），确保所有已生成的 WebP 档位都被消费。
- **优先级**：P2

- **问题**：`MediaImage` 的 `<img>` 未输出 `width`/`height` 属性（`media-image.tsx:33`），完全依赖 CSS 预留高度防 CLS。当前首页 `.journey-cover{min-height:460px}`、`.media-slide img{height:410px}` 等已兜底，CLS 总体可控；但 `.gallery-grid`（虽未使用）与任何未来未预留高度的容器会直接产生 CLS。
- **建议**：在 `MediaImage` 里透传 `width/height`（从 manifest 或固定比例）或统一要求容器用 `aspect-ratio`，把防 CLS 变成组件级约束。
- **优先级**：P2

- **问题**：首页 `.journey-cover img` 用 `sizes="(min-width:1200px) 40vw, 100vw"`（`page.tsx:39`），但卡片实际在 1240px 容器里约占 2fr/3fr≈55%，40vw 偏低，可能选到比实际需要更小的 WebP 档，锐度欠佳；hero 用 `sizes=100vw` 合理。
- **建议**：按实际列宽校准 sizes（如 `(min-width:1024px) 55vw, 100vw`）。
- **优先级**：P2

- **问题**：首页 hero 图 `loading="eager" fetchPriority="high"` 正确；但详情页 `media-carousel` 除第一张外 `loading="lazy"`（`detail-media-carousel.tsx:29`），轮播滑动时第二张才懒加载，可能看到灰底；且轮播无 `preload` 邻帧，滑动体验有轻微加载延迟。
- **建议**：首屏轮播的前 2 张 `eager`，后续 lazy；或给相邻帧加 `loading="lazy"` + 提前一帧的 IntersectionObserver 预取。
- **优先级**：P2

---

## 附：线上 HTML 实测发现（非 CSS 但影响品牌呈现）

- **问题**：`/qinggan-loop/` 的 `<title>` 与 `og:title`/`twitter:title` 均出现 `…｜KE Journey｜KE Journey` 双重后缀。根因：`app/[journey]/page.tsx:15` 的 `title` 已含「KE Journey」，又被 `layout.tsx:18` 的 `template:"%s｜KE Journey"` 再拼一次。
- **建议**：`[journey]` 的 title 去掉末尾「KE Journey」（模板会自动补），或改用 `title:{absolute:...}`。
- **优先级**：P1

- **问题**：线上无 `viewport-fit=cover`（已在前述 P0 覆盖），且 `<meta name="viewport">` 由 Next 默认注入，未在 `layout.tsx` 显式配置。
- **建议**：同 6.1。
- **优先级**：P0
