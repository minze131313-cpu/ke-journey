# KE Journey 主题 A —— 高山 Alpine

> 定位：明亮模式 · 清冷高原 · 工具感。冷青 / 雪灰 / 冰蓝，明显区别于当前暖米色杂志风。
> 触发方式：在 `<html>` 上加 `data-theme="alpine"`（不修改任何现有代码文件即可套用本主题的变量块与覆盖片段）。

## 1. 设计理念

把「高原清晨的冷空气」做成界面：底色从暖米色换成雪灰白（`#f5f8fb`），主强调从暖青换成偏冷的冰青（`#0e7b86`），眉题不再用金棕而用冷板岩（`#4a6b7d`），所有次级灰都往蓝灰方向偏。它保留衬线标题的编辑气质，但把边框、投影、表面全部调成「更薄、更冷、更利落」的工具腔调，让地图侧的路线、图例和面板在浅色底图上获得最大清晰度——适合白天规划、截图分享和长时间看地图的场景。对比度全部按 WCAG AA（正文 ≥4.5:1）校准。

## 2. 完整 CSS 变量块（可直接使用）

> 已用 `grep` 核对 `app/globals.css`，`:root` 实际定义的 token 共 **58 个**，下面**逐一覆盖、一个不漏**。另有两类特殊 token 在本块之外单独说明：
> - `--accent-soft`：不在 `:root`，而是 `.detail-shell` 及 `.detail-scenic/.detail-city/.detail-supply/.detail-warning/.detail-route` 的**作用域变量**（见第 3 节分类覆盖）。
> - `--font-geist-mono`：由 `app/layout.tsx` 的 `next/font` 注入（`Geist_Mono`），不是 `globals.css` 定义值，主题块保持 `var(--font-geist-mono)` 引用即可。

```css
:root[data-theme="alpine"] {
  /* ── 1 · 色彩角色（冷青 / 雪灰 / 冰蓝） ─────────────────────── */
  --ink: #1a2733;          /* 主前景：冷深蓝墨，不用纯黑           14.26:1 */
  --muted: #51606d;        /* 次级文本                            6.07:1  */
  --muted-2: #64737f;      /* 三级/元信息                        4.58:1  */
  --paper: #f5f8fb;        /* 雪灰页面底 */
  --card: #fbfcfe;         /* 近白卡片表面（避开纯白） */
  --line: #d6e0e8;         /* 冷灰细线（侧栏分隔 / 地图加载框） */
  --teal: #0e7b86;         /* 冰青品牌强调：白字 5.00:1，文本 4.70:1 */
  --teal-dark: #0a5f68;
  --teal-hover: #0d6d77;
  --teal-bright: #1594a6;
  --teal-soft: #e2f0f5;
  --teal-wash: #eaf5f9;
  --gold: #e5972b;         /* 景点类别填充：仅作底色，其上文字用 --ink */
  --gold-deep: #8a5a12;    /* 5.55:1 */
  --meta: #4a6b7d;         /* 眉题/元信息：冷板岩，替代暖金棕      5.34:1  */
  --danger: #c73b32;       /* 文本 4.81:1，白字 5.12:1 */
  --danger-soft: #fdeae8;
  --blue: #25679f;         /* 补给填充：白字 5.97:1 */
  --coral: #e8714f;        /* 点缀，仅作图形/色点，不作正文 */
  --sky: #e4f0f7;
  --white: #ffffff;

  /* ── 2 · 语义别名（写显式值，独立于基础 :root，不依赖 var() 链） ── */
  --bg: #f5f8fb;
  --surface: #fbfcfe;
  --surface-warm: #eef3f8; /* Alpine 下作为冷色副表面 */
  --bg-deep: #e6edf4;      /* 索引区深层背景 */
  --fg: #1a2733;
  --fg-2: #2b3a45;
  --accent: #0e7b86;
  --accent-on: #ffffff;
  --border: #d3dde6;
  --border-soft: #c3d0dc;

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

  /* ── 5 · 圆角（Alpine 更利落：收紧到 8/12/16，仍在 8–24px 规范内） ──
     注：当前 CSS 尚未引用 --radius-* token（grep 确认），此值体现主题意图，
     实际接线见第 3 节「利落圆角」片段。 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 999px;

  /* ── 6 · 层次与投影（更冷、更收敛） ──────────────────────────── */
  --elev-flat: none;
  --elev-raised: 0 12px 28px rgba(20, 45, 70, 0.16);

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

### 接线现状提醒（影响「一键换肤」实际效果）

`grep` 实测：当前 `globals.css` **实际被 `var()` 消费**的 token 只有颜色类（`--ink --muted --paper --card --line --teal --teal-dark --teal-hover --teal-bright --gold --meta --danger --blue --white --accent --accent-soft --bg-deep --border --border-soft --fg-2 --surface --surface-warm`）与 `--elev-raised --motion-fast --motion-base --ease-standard`。`--muted-2 --gold-deep --danger-soft --coral --sky --teal-soft --teal-wash --bg --fg --accent-on --elev-flat` 以及全部 `--font-* / --leading-* / --tracking-* / --space-* / --radius-* / --container-max / --gutter-*` 目前是**已定义未接线**。因此：颜色与投影会随主题即时生效；排印/间距/圆角 token 需先接线（或直接用第 3 节的字面值覆盖片段）。

---

## 3. 需要微调的组件规则（可直接粘贴）

```css
/* ── 画布与索引：去暖色径向渐变，改冷色 ── */
:root[data-theme="alpine"] body { background: #f5f8fb; }
:root[data-theme="alpine"] .journey-index {
  background:
    radial-gradient(circle at 8% 18%, rgba(14, 123, 134, .10), transparent 26%),
    radial-gradient(circle at 92% 55%, rgba(37, 103, 159, .08), transparent 26%),
    #f5f8fb;
}
:root[data-theme="alpine"] .journey-index-footer { background: #16242c; color: #d7e2ea; }

/* ── hero 叠加层：冷蓝墨，替代暖绿墨 ── */
:root[data-theme="alpine"] .journey-hero {
  background-image:
    linear-gradient(110deg, rgba(8, 20, 30, .92) 0%, rgba(10, 38, 48, .80) 46%, rgba(14, 78, 96, .40) 100%),
    url('/detail/qinghai.jpg');
}
:root[data-theme="alpine"] .journey-hero::before {
  background: linear-gradient(110deg, rgba(8, 20, 30, .92) 0%, rgba(10, 38, 48, .78) 46%, rgba(14, 78, 96, .38) 100%);
}
:root[data-theme="alpine"] .journey-hero::after {
  background: linear-gradient(180deg, rgba(0, 0, 0, .08), transparent 40%, rgba(4, 12, 18, .38));
}

/* ── 卡片：去常驻大投影，冷边框 + 利落圆角 ── */
:root[data-theme="alpine"] .journey-card {
  border-color: var(--border);
  background: var(--surface);
  border-radius: 16px;
  box-shadow: none;
}
:root[data-theme="alpine"] .journey-card:hover { box-shadow: var(--elev-raised); }
:root[data-theme="alpine"] .journey-card-soon {
  background: #16242c; /* 冷深青替代暖渐变 */
}

/* ── 暖色残留清理：把米色/奶油色微块换成冷调 ── */
:root[data-theme="alpine"] .summary-card { border-color: var(--border); background: var(--border); }
:root[data-theme="alpine"] .summary-card div:nth-child(1) { background: #e6f2f5; }
:root[data-theme="alpine"] .summary-card div:nth-child(2) { background: #eef3f8; }
:root[data-theme="alpine"] .summary-card div:nth-child(3) { background: #e7f0f7; }
:root[data-theme="alpine"] .summary-card div:nth-child(4) { background: #fdece9; }
:root[data-theme="alpine"] .tabs { background: #e6edf4; }
:root[data-theme="alpine"] .stay-row { background: #eef3f7; }
:root[data-theme="alpine"] .safe-route { background: #f3f6f9; }
:root[data-theme="alpine"] .booking-note { background: #eaf3f7; color: #2a5568; }
:root[data-theme="alpine"] .route-summary { background: #eef3f7; border-left-color: #9db8c4; }

/* ── 图例 / 图钉 / 徽章文字对比：金色填充改用深字（白字 on gold 仅 2.39:1，不达标） ── */
:root[data-theme="alpine"] .map-legend i.scenic,
:root[data-theme="alpine"] .poi-scenic span,
:root[data-theme="alpine"] .booking-note span { color: var(--ink); }

/* ── 详情页：渐变 → 冷色平涂，去除编辑风之外的多余渐变 ── */
:root[data-theme="alpine"] .detail-header { background: #0a3a46; }
:root[data-theme="alpine"] .detail-header.scenic { background: #6d5220; }
:root[data-theme="alpine"] .detail-header.city    { background: #0e4a54; }
:root[data-theme="alpine"] .detail-header.supply  { background: #1f4a6e; }
:root[data-theme="alpine"] .detail-header.warning { background: #6e3832; }
:root[data-theme="alpine"] .detail-header.route   { background: #1f3f3c; }
:root[data-theme="alpine"] .lead-card {
  background: var(--accent);
  box-shadow: 0 13px 35px rgba(14, 123, 134, .20);
}
:root[data-theme="alpine"] .detail-shell {
  background:
    radial-gradient(circle at 95% 12%, rgba(14, 123, 134, .10), transparent 26%),
    #f5f8fb;
}

/* ── 焦点态：统一的冰青 focus ring（补上评审发现的 focus 缺失） ── */
:root[data-theme="alpine"] :focus-visible {
  outline: 2px solid var(--teal);
  outline-offset: 2px;
}
:root[data-theme="alpine"] .search-wrap input:focus { outline: none; box-shadow: 0 2px 0 0 var(--teal); }

/* ── 地图浮层：去玻璃拟态，改实心近白 + 冷投影（更工具感） ── */
:root[data-theme="alpine"] .filter-pills,
:root[data-theme="alpine"] .map-legend,
:root[data-theme="alpine"] .status-pill,
:root[data-theme="alpine"] .layer-controls,
:root[data-theme="alpine"] .route-panel,
:root[data-theme="alpine"] .place-panel,
:root[data-theme="alpine"] .route-direction-card,
:root[data-theme="alpine"] .mobile-sheet-button {
  backdrop-filter: none;
  background: var(--surface);
  border-color: var(--border);
  box-shadow: var(--elev-raised);
}
```

### 地图底图风格建议（`journey-map.tsx` 内一行，文档说明，不改文件）

Alpine 建议把 `journey-map.tsx` 第 113 行的 `mapStyle: "amap://styles/whitesmoke"` 改为：

```ts
mapStyle: "amap://styles/fresh"   // 高德内置「淡雅」冷调，配合冰青/雪灰
```

备选 `"amap://styles/light"`（更素）或 `"amap://styles/blue"`（更蓝）。冷调底图让 `--teal`（城镇/住宿）、`--blue`（补给）、`--gold`（景点）、`--danger`（风险）四类图例色与路线对比更清晰。

---

## 4. Do's & Don'ts

**Do**
- ✅ 用冷蓝灰 `--surface-warm`（#eef3f8）承载旅程卡片，替代暖米色副表面，保持「冷」的连贯性。
- ✅ 金色 `--gold` 只做景点/高亮的**底色**，其上文字一律用 `--ink`（白字 on gold 不达标）。
- ✅ 地图浮层用实心 `--surface` + `--elev-raised`，去掉 backdrop-blur，突出清晰度而非「玻璃感」。
- ✅ 眉题用 `--meta`（冷板岩 #4a6b7d），保持宽字距，让「冷」同时进入元信息层。
- ✅ 所有新增交互控件补 `:focus-visible` 冰青焦点环（2px + 2px offset）。

**Don'ts**
- ❌ 不要混入暖米色/奶油色残留（`#fff8ec`、`#f6ebd1`、`#fff8f5` 等），一旦出现会立刻破坏清冷基调。
- ❌ 不要用暖绿渐变（`linear-gradient(110deg, rgba(2,66,66...))` 这类）——改用冷蓝墨叠加层或纯色块。
- ❌ 不要在金色、珊瑚、天蓝等浅色填充上用白字（对比不足 4.5:1）。
- ❌ 不要保留常驻大投影做默认装饰，Alpine 的深度应来自「更冷更收敛」的 `--elev-raised`，且仅在悬停/浮层出现。
- ❌ 不要为「现代感」把圆角降到 8px 以下或升到 24px 以上（本主题取值 8/12/16，仍在规范内）。
