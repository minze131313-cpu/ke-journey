# KE Journey Design System

> 分类:Warm Editorial · 自驾旅行路书
> 以衬线主导的长文杂志审美,青绿 × 金色 × 暖白纸感。理想形态是"一本可出发的旅行杂志"——留白充足、节奏从容、一个页面只用一个强调色。本规范继承 OpenDesign `warm-editorial` 设计系统的结构与纪律,并针对 KE Journey 的旅行品牌做了色调与组件适配。

## 视觉主题与氛围
温暖、从容、杂志感。大量留白、长文可读性、克制的装饰。像一篇《孤独星球》的特稿。文案中文为主,衬线标题承载情绪,无衬线正文保证可读性。绝不花哨。

## 色板与角色(唯一事实来源:`app/globals.css` `:root`)

| Token | 值 | 角色 |
|---|---|---|
| `--ink` | `#16343a` | 主前景(深青墨,接近黑但绝不用纯黑) |
| `--muted` | `#61787c` | 次级文本 |
| `--muted-2` | `#8a918e` | 三级/元信息 |
| `--paper` / `--bg` | `#fff8ec` | 页面背景(暖白纸) |
| `--card` / `--surface` | `#fffefa` | 抬升卡片表面 |
| `--surface-warm` | `#f8f5ed` | 暖表面(旅程卡片) |
| `--bg-deep` | `#efece3` | 深层背景(索引区) |
| `--teal` / `--accent` | `#07877e` | 品牌强调(链接、主行动、一个 hero 元素) |
| `--teal-dark` | `#075f5a` | 强调深色/悬停 |
| `--teal-hover` | `#08776f` | 强调交互态 |
| `--teal-bright` | `#08a095` | 强调亮色(APP 壳触摸) |
| `--teal-soft` | `#edf5f1` | 强调浅底 |
| `--teal-wash` | `#e7faf6` | 强调极浅洗色 |
| `--gold` | `#f1a530` | 次强调(序列号/高亮) |
| `--gold-deep` | `#c39744` | 金色弱化 |
| `--meta` | `#9a742f` | 眉题/元信息金棕 |
| `--danger` | `#e55748` | 风险/警告 |
| `--danger-soft` | `#f9ebe7` | 风险浅底 |
| `--blue` | `#3288d8` | 补给/功能区分 |
| `--coral` | `#f27655` | 珊瑚点缀 |
| `--sky` | `#dff5f4` | 天空浅色 |
| `--border` | `#ddd8cc` | 描边 |
| `--border-soft` | `#eadcc4` | 弱描边 |

**规则**
- 面向用户处不得使用纯黑/纯白;最接近为 `--ink` / `--paper`。
- 一屏一个强调色(青绿)。若页面已有青绿 hero,次行动按钮只用前景色,不再用第二种强调色。
- 每个页面用到的颜色必须来自 token;不要发明新的 hex。若确需扩展,先加 token 再引用。

## 字体排印
- **展示/标题:** `Georgia, "Songti SC", "Noto Serif SC", serif`(`--font-display`)
- **正文/UI:** `"PingFang SC", "Noto Sans SC", "Microsoft YaHei", Arial, sans-serif`(`--font-body`)
- **等宽(仅代码/坐标):** `var(--font-geist-mono), ui-monospace, mono`(`--font-mono`)
- 字号阶(px):12 · 14 · 16 · 20 · 28 · 38 · 52 · 72(标题引用大号衬线)
- 行高:正文 1.85(`--leading-body`),标题 1.12(`--leading-heading`)
- 字距:展示级 >40px 用 `-0.02em`(`--tracking-display`),其余默认
- 眉题(eyebrow)用小号等宽全大写 + `letter-spacing:.16em`(如 `FIELD NOTES · ROAD TRIPS · MAPS`)

## 间距
- 4px 基数:`--space-1..16`(4/8/12/16/20/24/32/48/64)
- 区块纵向节奏:桌面 96–112px,平板 70px,手机 48px
- 容器:`--container-max:1240px`,桌面左右 gutter 42px,手机 16px

## 圆角
- 仅在 8–24px 之间取:`--radius-sm:10px` · `--radius-md:16px` · `--radius-lg:22px` · `--radius-pill:999px`
- 不用超大圆角;不below 8px。

## 层次与投影(Depth)
最少、两层:
- **Flat(0)** —— 默认一律无投影。
- **Raised(1)** —— 仅卡片悬停 / 浮层 / 悬浮 CTA:上移 2px,`0 12px 28px rgba(22,52,58,.12)`(`--elev-raised`)。
- 输入框无投影;hero 无投影;不做拟物/玻璃拟态(glassmorphism)。

## 组件规范
- **按钮:** 扁平填充,12px 圆角,内边距 14/20。主按钮 = 青绿填充 + 浅字(`--accent-on`);次按钮 = 1px 前景描边、透明填充。
- **卡片:** 暖白表面,1px `--border` 描边,16px 圆角,内边距 24–32;默认无投影,悬停才抬升。
- **链接:** 青绿,1px 40% 透明度下划线;悬停去掉下划线(换成 8% 背景)或位移箭头。
- **输入:** 仅下划线(无外框),1px 基线,聚焦变青绿。
- **风险/警告卡:** 用 `--danger-soft` 底 + `--danger` 边,信息层级清晰。
- **地图图层:** 类别色用 `--gold`(景点)/`--teal`(城镇)/`--blue`(补给)/`--danger`(风险),与图例一致。

## 布局原则
- 12 栏网格,1240px 最大宽,24px 栏距。
- Hero:min 72vh,内容顶置、绝不完全垂直居中。
- 正文区块:桌面 80px 上下间距,平板 48px,手机 32px。
- 一屏一强调色。

## 响应式行为
- **桌面 ≥1024px:** 12 栏网格,完整 hero 高度,并排两栏。
- **平板 640–1023px:** 8 栏,hero 降到 60vh,3 列以上时堆叠。
- **手机 <640px:** 4 栏,单列布局,hero 降到 50vh,全部 padding 缩减。

## 状态与可访问性
- 文字对比:正文/元信息在 `--paper` 上需 ≥ 4.5:1;大号标题 ≥ 3:1。
- 悬停/聚焦都要有可见状态(下划线、位移箭头、`--teal-soft` 背景)。
- 交互控件命中区 ≥ 44px(移动端已按此处理)。

## Do's & Don'ts
- ✅ 让留白呼吸。短标题配 50% 视口高度是正确的。
- ✅ 数字(里程、天数、季节)用衬线,当它们重要时。
- ✅ 每页只画一个强调元素,其余用前景色。
- ❌ 不用渐变(照片叠加除外)。
- ❌ 产品文案不用 emoji。
- ❌ 圆角不 <8px、不 >24px。
- ❌ 不做拟物、玻璃拟态。

## Agent Prompt Guide(生成/修改本页面的指引)
- 优先排版与留白;边框/投影是减法。
- 若一屏需要超过一个强调元素,说明失控了,砍掉一个。
- "专业/正式" → 更依赖衬线 + 留白;"现代" → 本系统不适用,换别的 DESIGN.md。
- 颜色 token 不可协商。需要新颜色时,先加 token 再引用,并在产物里给一条注释。
- 一个 hero + 3–5 个正文区块,好过一个 hero + 8 个区块。编辑风 = 克制。
- 中文排版:标题用衬线大号,正文 16–18px、行高 1.85;数字/坐标用等宽。

---

## 主题系统（多 UI 切换）

网站在 `<html>` 上通过 `data-theme` 提供三套 UI，由右下角「主题」悬浮按钮切换（localStorage 持久化，首帧前内联脚本恢复，无白闪）：

| data-theme | 名称 | 定位 | 规范文档 |
|---|---|---|---|
| （无 / warm-editorial） | 杂志暖白 | 默认 · 暖米色编辑风 | 本文件 |
| `alpine` | 高山 | 明亮 · 雪灰/冷青 · 工具感 | docs/od-theme-alpine.md |
| `dusk` | 暮色 | 暗色 · 深炭/暖琥珀 · 夜航 | docs/od-theme-dusk.md |

- 三套主题共用同一套 token 名，切换只替换 `:root[data-theme=…]` 变量块与少量组件覆盖，全部位于 `app/globals.css` 文件尾部。
- 地图底图随主题联动：warm-editorial → `whitesmoke`，alpine → `fresh`，dusk → `dark`（`journey-map.tsx` 的 `amapStyleForTheme`）。
- 新增主题时：先在 docs/ 写主题规范文档（含完整 token 块与对比度核验），再把变量块追加到 globals.css，并在 `theme-switcher.tsx` 的 `themeOptions` 注册。
- 本文件「色板与角色」一节描述默认主题；Alpine/Dusk 的 token 取值以其各自文档为准。
