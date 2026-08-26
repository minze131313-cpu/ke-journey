# KE Journey 主题 B —— 暮色 Dusk

> 定位：真正的暗色模式 · 深夜规划场景。深炭底 + 暖琥珀强调 + 低饱和大地色，全程 WCAG AA。
> 硬性约束：页面底色 `--paper/--bg = #101214`，**深于 `#14171a`**（实测亮度 0.0059 < 0.0084，满足要求）。
> 触发方式：在 `<html>` 上加 `data-theme="dusk"`。

## 1. 设计理念

把界面做成「深夜车灯照在炭色桌面上的样子」：底色是带一丝冷意的深炭（`#101214`），主强调从青绿换成暖琥珀（`#e8a24f`），正文用暖米白（`#e9e5dc`），避免纯白刺眼。地图类别色整体提亮一个明度、走低饱和（琥珀金景点、雾蓝补给、浅青住宿、赭红风险），在深底上像夜间仪表盘一样清晰。目标是让用户在睡前或行车间隙规划路线时不刺眼、不焦虑，且所有正文/元信息对比度都压在 4.5:1 以上——本主题的对比度表见第 3 节末尾。

## 2. 完整 CSS 变量块（可直接使用）

> 已用 `grep` 核对 `app/globals.css`，`:root` 实际定义 **58 个 token**，下面**逐一覆盖、一个不漏**。另需注意：
> - `--accent-soft`：作用域变量，见第 3 节分类覆盖。
> - `--font-geist-mono`：由 `next/font` 注入，保持 `var(--font-geist-mono)` 引用。
> - 暗色下 token「名字」保留原语义，但**取值按暗色重映射**（例：`--teal-dark` 在暗色下是一枚浅青，因为 `.journey-enter` 等把它当文字色用；`--accent-on` 反转为深炭，因为琥珀填充上要用深字）。

```css
:root[data-theme="dusk"] {
  /* ── 1 · 色彩角色（深炭底 / 暖琥珀强调 / 低饱和大地色） ───────── */
  --ink: #e9e5dc;          /* 主前景：暖米白（暗色下的"墨"），14.93:1 */
  --muted: #a9a297;        /* 次级文本                           7.42:1 */
  --muted-2: #8a857b;      /* 三级/元信息                       5.11:1 */
  --paper: #101214;        /* 页面底色：深于 #14171a ✓ */
  --card: #161a1e;         /* 抬升卡片表面 */
  --line: #262b2f;         /* 暗色细线 */
  --teal: #4fb3b0;         /* 城镇/住宿类别（浅青），深字 7.52:1 */
  --teal-dark: #7fd0cc;    /* 暗色下重映射为浅青，供文字/链接用  9.83:1 */
  --teal-hover: #68c2be;
  --teal-bright: #8fe0db;
  --teal-soft: #16302f;    /* 暗青表面 */
  --teal-wash: #12292a;    /* 暗青洗色 */
  --gold: #d9a441;         /* 景点类别（琥珀金），深字 8.35:1 */
  --gold-deep: #b8873a;
  --meta: #c9a86a;         /* 眉题/元信息（暖沙金）             8.31:1 */
  --danger: #e56a60;       /* 风险：文本 5.87:1；作填充时文字用深炭 */
  --danger-soft: #3a211f;  /* 暗红表面 */
  --blue: #5a9fd8;         /* 补给（雾蓝），深字 6.60:1 */
  --coral: #e89a72;        /* 珊瑚点缀 */
  --sky: #14282b;          /* 暗青表面（原"天空浅色"在暗色下变深面） */
  --white: #f4efe6;        /* 少量需要"近白"处用暖米白，避免纯白 */

  /* ── 2 · 语义别名（显式值，独立于基础 :root） ──────────────── */
  --bg: #101214;
  --surface: #161a1e;
  --surface-warm: #1b1915; /* 暗色暖表面（旅程卡片） */
  --bg-deep: #0c0e10;      /* 索引区更深层 */
  --fg: #e9e5dc;
  --fg-2: #d6d0c4;         /* 次级前景（数值等）             12.23:1 */
  --accent: #e8a24f;       /* 暖琥珀主强调（链接/CTA）        8.68:1 */
  --accent-on: #14171a;    /* 琥珀填充上的深字，反转为深炭 */
  --border: #2a2f34;
  --border-soft: #23272c;

  /* ── 3 · 排印（保持不变） ──────────────────────────────────── */
  --font-display: Georgia, "Songti SC", "Noto Serif SC", serif;
  --font-body: "PingFang SC", "Noto Sans SC", "Microsoft YaHei", Arial, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, Menlo, monospace;
  --leading-body: 1.85;
  --leading-heading: 1.12;
  --tracking-display: -0.02em;

  /* ── 4 · 间距（4px 基数，保持不变） ─────────────────────────── */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;

  /* ── 5 · 圆角（保持不变，几何随基础） ────────────────────────── */
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-pill: 999px;

  /* ── 6 · 层次与投影（暗色下阴影更强更黑，作为唯一深度来源） ───── */
  --elev-flat: none;
  --elev-raised: 0 12px 28px rgba(0, 0, 0, 0.55);

  /* ── 7 · 动效（保持不变） ──────────────────────────────────── */
  --motion-fast: 150ms;
  --motion-base: 240ms;
  --ease-standard: cubic-bezier(.2, 0, 0, 1);

  /* ── 8 · 布局（保持不变） ──────────────────────────────────── */
  --container-max: 1240px;
  --gutter-desk: 42px;
  --gutter-phone: 16px;
}
```

### 接线现状提醒

`grep` 实测当前 `globals.css` 真正被 `var()` 消费的是颜色类 token + `--elev-raised --motion-* --ease-standard`；其余（`--muted-2 --gold-deep --danger-soft --coral --sky --teal-soft --teal-wash --bg --fg --accent-on --elev-flat` 及全部排印/间距/圆角/布局 token）为「已定义未接线」。因此本主题的颜色与投影会即时生效；深色化还需要第 3 节的硬编码浅色块覆盖片段配合（否则 `body` 渐变、`.sidebar`、`.journey-card`、`.route-panel` 等浅色背景仍会残留）。

---

## 3. 需要微调的组件规则（可直接粘贴）

> 基础 CSS 里有大量**硬编码浅色值**（`rgba(255,253,248,…)`、`#f6ebd1`、`#f2efe7`、`#fff8f5`、`#f3f0e8` 等），暗色下会「闪白」。下面按区块逐一把它们压到深炭，配合变量块即可完整换肤。

```css
/* ── 全局画布 / 索引 / 404：去亮色渐变，改深炭 + 微弱暖色径向 ── */
:root[data-theme="dusk"] body { background: #101214; }
:root[data-theme="dusk"] .journey-index {
  background:
    radial-gradient(circle at 8% 18%, rgba(232, 162, 79, .10), transparent 26%),
    radial-gradient(circle at 92% 55%, rgba(90, 159, 216, .08), transparent 26%),
    #101214;
}
:root[data-theme="dusk"] .not-found-shell {
  background: linear-gradient(140deg, #101214 0%, #161a1e 55%, #1b1915 100%);
}
:root[data-theme="dusk"] .not-found-actions a { border-color: rgba(233, 229, 220, .35); color: var(--ink); }
:root[data-theme="dusk"] .not-found-actions a.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-on); }

/* ── 首页 hero / 卡片 / 页脚 ── */
:root[data-theme="dusk"] .journey-hero {
  background-image:
    linear-gradient(110deg, rgba(5, 9, 11, .94) 0%, rgba(8, 14, 16, .86) 46%, rgba(20, 24, 22, .60) 100%),
    url('/detail/qinghai.jpg');
}
:root[data-theme="dusk"] .journey-hero::before {
  background: linear-gradient(110deg, rgba(5, 9, 11, .94) 0%, rgba(8, 14, 16, .82) 46%, rgba(20, 24, 22, .55) 100%);
}
:root[data-theme="dusk"] .journey-card {
  border-color: var(--border-soft);
  background: var(--surface);
  box-shadow: var(--elev-raised);
}
:root[data-theme="dusk"] .journey-card-soon { background: #1a2320; }
:root[data-theme="dusk"] .journey-card-body > span { color: var(--muted); }
:root[data-theme="dusk"] .journey-card-body dt { color: var(--muted-2); }
:root[data-theme="dusk"] .journey-section-head > span { color: var(--muted); }
:root[data-theme="dusk"] .journey-index-footer { background: #0c0e10; color: #9aa39d; }

/* ── 侧栏 / 搜索 / tabs / 行程列表 ── */
:root[data-theme="dusk"] .sidebar {
  background: rgba(22, 26, 30, .98);
  box-shadow: 20px 0 50px rgba(0, 0, 0, .4);
}
:root[data-theme="dusk"] .brand-copy p { color: #a98f6a; }
:root[data-theme="dusk"] .export-button { border-color: var(--border); color: var(--muted); }
:root[data-theme="dusk"] .search-wrap { border-color: var(--border); }
:root[data-theme="dusk"] .search-wrap button { background: #2a2f34; color: var(--muted); }
:root[data-theme="dusk"] .tabs { background: #1b1e21; }
:root[data-theme="dusk"] .tabs button { color: var(--muted); }
:root[data-theme="dusk"] .tabs button.active { background: var(--accent); color: var(--accent-on); }
:root[data-theme="dusk"] .day-card:hover { background: rgba(233, 229, 220, .05); }
:root[data-theme="dusk"] .day-card.active { border-color: var(--border); background: var(--surface); box-shadow: var(--elev-raised); }
:root[data-theme="dusk"] .day-copy b { color: var(--fg); }
:root[data-theme="dusk"] .day-copy small, :root[data-theme="dusk"] .day-detail > p,
:root[data-theme="dusk"] .day-metrics b, :root[data-theme="dusk"] .task-list { color: var(--muted); }
:root[data-theme="dusk"] .day-metrics small { color: var(--muted-2); }
:root[data-theme="dusk"] .stay-row { background: #21252a; }
:root[data-theme="dusk"] .stay-row span { color: var(--muted-2); }
:root[data-theme="dusk"] .stop-chips button { border-color: var(--border); background: var(--surface); color: var(--muted); }

/* ── 路况 / 准备 / 风险面板 ── */
:root[data-theme="dusk"] .road-alert { border-color: #4a2a26; background: var(--danger-soft); }
:root[data-theme="dusk"] .road-alert > span, :root[data-theme="dusk"] .alert-icon { color: #101214; }
:root[data-theme="dusk"] .road-alert p, :root[data-theme="dusk"] .road-note p { color: var(--muted); }
:root[data-theme="dusk"] .safe-route { background: #241d17; }
:root[data-theme="dusk"] .safe-route small { color: var(--muted-2); }
:root[data-theme="dusk"] .safe-route b { color: var(--fg); }
:root[data-theme="dusk"] .road-alert button { background: var(--danger); color: #101214; }
:root[data-theme="dusk"] .check-group { border-color: var(--border); }
:root[data-theme="dusk"] .check-group label { color: var(--muted); }
:root[data-theme="dusk"] .emergency-card { background: #1a2422; }

/* ── 地图画布 / 浮层 / 图例 / 图钉 ── */
:root[data-theme="dusk"] .map-stage { background: #0e1416; }
:root[data-theme="dusk"] .map-loader { background: #10151a; color: #9fd0cd; }
:root[data-theme="dusk"] .map-loader span { border-color: #3a5a57; background: #161e20; }
:root[data-theme="dusk"] .filter-pills, :root[data-theme="dusk"] .map-legend,
:root[data-theme="dusk"] .status-pill, :root[data-theme="dusk"] .layer-controls,
:root[data-theme="dusk"] .route-direction-card, :root[data-theme="dusk"] .mobile-sheet-button {
  background: rgba(22, 26, 30, .95);
  border-color: var(--border);
  backdrop-filter: none;
}
:root[data-theme="dusk"] .filter-pills button, :root[data-theme="dusk"] .layer-controls button { color: var(--muted); }
:root[data-theme="dusk"] .map-legend span, :root[data-theme="dusk"] .route-direction-card small { color: var(--muted); }
:root[data-theme="dusk"] .route-direction-card b { color: var(--fg); }

/* 彩色 chip / 图钉统一用深炭字（白字 on 琥珀/雾蓝/赭红均不达标） */
:root[data-theme="dusk"] .map-legend i,
:root[data-theme="dusk"] .poi-pin span,
:root[data-theme="dusk"] .booking-note span { color: #101214; }
:root[data-theme="dusk"] .poi-pin b {
  background: rgba(22, 26, 30, .96);
  border-color: var(--border);
  color: var(--fg);
}

/* ── 路线 / 地点面板 ── */
:root[data-theme="dusk"] .route-panel, :root[data-theme="dusk"] .place-panel {
  background: rgba(22, 26, 30, .98);
  border-color: var(--border);
  box-shadow: var(--elev-raised);
}
:root[data-theme="dusk"] .route-panel h3, :root[data-theme="dusk"] .place-panel h3,
:root[data-theme="dusk"] .route-panel-kicker, :root[data-theme="dusk"] .place-kicker,
:root[data-theme="dusk"] .route-stat-grid small, :root[data-theme="dusk"] .place-meta small { color: var(--muted); }
:root[data-theme="dusk"] .route-stat-grid b, :root[data-theme="dusk"] .place-meta b { color: var(--fg); }
:root[data-theme="dusk"] .amap-metric { background: #1c2b29; color: var(--muted); }
:root[data-theme="dusk"] .route-summary { background: #1c2023; border-left-color: #4fb3b0; color: var(--muted); }
:root[data-theme="dusk"] .route-stop-list button { border-color: var(--border); background: var(--surface); color: var(--muted); }
:root[data-theme="dusk"] .route-stop-list b, :root[data-theme="dusk"] .route-task-grid { color: var(--fg); }
:root[data-theme="dusk"] .booking-note { background: #2a2215; color: #d9b06a; }
:root[data-theme="dusk"] .place-close, :root[data-theme="dusk"] .active-day-banner button { background: #2a2f34; color: var(--muted); }
:root[data-theme="dusk"] .active-day-banner { background: rgba(22, 26, 30, .96); }
:root[data-theme="dusk"] .active-day-banner small { color: var(--muted); }
:root[data-theme="dusk"] .day-link.secondary { border-color: #3a5f5b; background: #12201f; color: var(--teal); }

/* ── 图文详情页 ── */
:root[data-theme="dusk"] .detail-shell {
  background:
    radial-gradient(circle at 95% 12%, rgba(232, 162, 79, .08), transparent 26%),
    #101214;
}
:root[data-theme="dusk"] .detail-header { background: #101a1c; }
:root[data-theme="dusk"] .detail-header.scenic { background: #2a2013; }
:root[data-theme="dusk"] .detail-header.city    { background: #10201f; }
:root[data-theme="dusk"] .detail-header.supply  { background: #141f2c; }
:root[data-theme="dusk"] .detail-header.warning { background: #2b1a18; }
:root[data-theme="dusk"] .detail-header.route   { background: #14201e; }
:root[data-theme="dusk"] .lead-card { background: var(--accent); color: #14171a; }
:root[data-theme="dusk"] .lead-card .lead-label { opacity: .78; }
:root[data-theme="dusk"] .lead-card .coordinate { border-top-color: rgba(20, 23, 26, .25); }
:root[data-theme="dusk"] .story-main > p, :root[data-theme="dusk"] .route-story > p,
:root[data-theme="dusk"] .body-copy, :root[data-theme="dusk"] .highlight-card li,
:root[data-theme="dusk"] .check-cards li, :root[data-theme="dusk"] .risk-cards li,
:root[data-theme="dusk"] .context-band > p { color: #c3c0b6; }
:root[data-theme="dusk"] .detail-section-head small,
:root[data-theme="dusk"] .nearby-grid small, :root[data-theme="dusk"] .source-list small,
:root[data-theme="dusk"] .source-disclaimer { color: var(--muted-2); }
:root[data-theme="dusk"] .highlight-card li { border-top-color: var(--border-soft); }
:root[data-theme="dusk"] .context-band { background: #161f1d; }
:root[data-theme="dusk"] .nearby-grid a { border-color: var(--border); background: var(--surface); color: var(--fg); }
:root[data-theme="dusk"] .nearby-grid span { color: var(--muted); }
:root[data-theme="dusk"] .road-line b { color: var(--fg); }
:root[data-theme="dusk"] .drive-timeline::before { background: #2a2f34; }
:root[data-theme="dusk"] .drive-timeline i { border-color: #101214; } /* 关键：时间轴圆点外圈改回底色 */
:root[data-theme="dusk"] .drive-timeline section { border-color: var(--border); }
:root[data-theme="dusk"] .drive-timeline p { color: var(--muted); }
:root[data-theme="dusk"] .route-node-flow > * { border-color: var(--border); background: var(--surface); color: var(--fg); }
:root[data-theme="dusk"] .route-node-flow .terminal { background: var(--accent); color: var(--accent-on); }
:root[data-theme="dusk"] .detail-footer { background: #0c0e10; }

/* ── 详情页分类强调（作用域变量 --accent / --accent-soft 的暗色变体） ── */
:root[data-theme="dusk"] .detail-shell.detail-scenic { --accent: #d9a441; --accent-soft: #2a2013; }
:root[data-theme="dusk"] .detail-shell.detail-city   { --accent: #4fb3b0; --accent-soft: #12201f; }
:root[data-theme="dusk"] .detail-shell.detail-supply { --accent: #5a9fd8; --accent-soft: #141f2c; }
:root[data-theme="dusk"] .detail-shell.detail-warning{ --accent: #e56a60; --accent-soft: #2b1a18; }
:root[data-theme="dusk"] .detail-shell.detail-route  { --accent: #68c2be; --accent-soft: #14201e; }

/* ── 底部导航 / 翻页 / 悬浮按钮 ── */
:root[data-theme="dusk"] .detail-mobile-nav, :root[data-theme="dusk"] .mobile-bottom-nav {
  background: rgba(16, 18, 20, .96);
  border-top-color: var(--border);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, .5);
}
:root[data-theme="dusk"] .detail-mobile-nav a, :root[data-theme="dusk"] .mobile-bottom-nav button { color: var(--muted); }
:root[data-theme="dusk"] .mobile-bottom-nav button i { background: #23272c; color: var(--muted); }
:root[data-theme="dusk"] .mobile-bottom-nav button.active { color: var(--accent); }
:root[data-theme="dusk"] .detail-pager .pager-card { background: rgba(22, 26, 30, .90); border-color: var(--border); color: var(--fg); }
:root[data-theme="dusk"] .detail-pager .pager-card.disabled { background: rgba(22, 26, 30, .70); }
:root[data-theme="dusk"] .text-size-toggle {
  background: linear-gradient(135deg, #b8762e, #8a5a12);
  border-color: var(--border);
}

/* ── 焦点态：暖琥珀 focus ring ── */
:root[data-theme="dusk"] :focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
:root[data-theme="dusk"] .search-wrap input:focus { outline: none; box-shadow: 0 2px 0 0 var(--accent); }
```

### 地图底图风格建议（`journey-map.tsx` 内一行，文档说明，不改文件）

Dusk 建议把 `journey-map.tsx` 第 113 行改为：

```ts
mapStyle: "amap://styles/dark"   // 深色底图，点线更亮
```

备选 `"amap://styles/darkblue"`（偏蓝深色，与琥珀 pin 反差更大）。深色底图上 `--gold/--teal/--blue/--danger` 四类图例与浅色描边路线会形成「夜间仪表盘」式的清晰度；交通图层 `Traffic` 的红黄在深底上也更易读。

### 关键对比度核验（正文/元信息 ≥4.5:1）

| 配对 | 比值 | 结论 |
|---|---|---|
| `--ink #e9e5dc` on `--paper #101214` | 14.93:1 | ✅ |
| `--muted #a9a297` on `#101214` | 7.42:1 | ✅ |
| `--muted-2 #8a857b` on `#101214` | 5.11:1 | ✅ |
| `--accent #e8a24f` on `#101214` | 8.68:1 | ✅ |
| `#101214` on `--accent`（琥珀按钮深字） | 8.68:1 | ✅ |
| `--danger #e56a60` on `#101214` | 5.87:1 | ✅ |
| `--blue #5a9fd8` on `#101214` | 6.60:1 | ✅ |
| `--teal #4fb3b0` on `#101214` | 7.52:1 | ✅ |

---

## 4. Do's & Don'ts

**Do**
- ✅ 底色用 `--paper #101214`（深于 #14171a），卡片只抬到 `--surface #161a1e`，层级靠「更亮的表面」而不是靠白底。
- ✅ 主强调用暖琥珀 `--accent #e8a24f`；琥珀只做链接、CTA、激活态与「环线方向」这类单一强调，克制使用。
- ✅ 彩色 chip / 图钉 / 徽章上的文字一律用深炭 `#101214`（白字 on 琥珀/雾蓝/赭红不达标）。
- ✅ 硬编码浅色块（`rgba(255,253,248,…)`、`#f6ebd1`、`#f3f0e8`、`#f2efe7` 等）必须被第 3 节片段覆盖，否则暗色下会「闪白」。
- ✅ 所有焦点态用琥珀 `:focus-visible`（2px + 2px offset），夜间操作目标清晰。

**Don'ts**
- ❌ 不要在深炭底上用纯白 `#ffffff` 做大面积文字（用 `--ink #e9e5dc` 暖米白，避免刺眼）。
- ❌ 不要保留亮色渐变（`body`、`.detail-header`、`.lead-card`、`.tabs button.active` 等的暖色/亮色渐变）——改深炭平涂或琥珀单色。
- ❌ 不要把 `--teal-dark` 再当「深色」用：暗色下它已重映射为浅青 `#7fd0cc`（供文字/链接），语义以「可读性」优先。
- ❌ 不要用玻璃拟态（backdrop-blur）制造层次，暗色下用实心深表面 + `--elev-raised` 更稳、更省电。
- ❌ 不要遗漏 `.drive-timeline i { border-color }` 这类「浅色描边」细节——时间轴圆点外圈必须改回底色 `#101214`，否则出现一圈亮边。
