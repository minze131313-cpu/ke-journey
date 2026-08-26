"use client";

import { useState } from "react";

export const themeOptions = [
  { id: "warm-editorial", label: "杂志暖白", note: "暖米色 · 编辑风", colors: ["#fff8ec", "#07877e", "#f1a530"] },
  { id: "alpine", label: "高山", note: "雪灰 · 冷青", colors: ["#f5f8fb", "#0e7b86", "#4a6b7d"] },
  { id: "dusk", label: "暮色", note: "深炭 · 夜航", colors: ["#101214", "#e8a24f", "#4fb3b0"] },
] as const;

export type ThemeId = (typeof themeOptions)[number]["id"];

const storageKey = "ke-journey-theme";

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return !!value && themeOptions.some((theme) => theme.id === value);
}

function readCurrentTheme(): ThemeId {
  if (typeof document === "undefined") return "warm-editorial";
  return isThemeId(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : "warm-editorial";
}

function persistTheme(id: ThemeId) {
  try {
    window.localStorage.setItem(storageKey, id);
  } catch {
    // 隐私模式下存储不可用时静默降级
  }
}

function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
  window.dispatchEvent(new CustomEvent("ke-journey:theme-change", { detail: { theme: id } }));
}

export default function ThemeSwitcher() {
  // 懒初始化：首帧前 layout 的内联脚本已把 data-theme 写到 <html>，
  // SSR 首帧与客户端仅在未保存过主题时一致；标签文本用 suppressHydrationWarning 兜底。
  const [theme, setTheme] = useState<ThemeId>(readCurrentTheme);
  const [open, setOpen] = useState(false);

  const choose = (id: ThemeId) => {
    applyTheme(id);
    persistTheme(id);
    setTheme(id);
    setOpen(false);
  };

  return (
    <div className={`theme-switcher ${open ? "open" : ""}`}>
      {open && (
        <div className="theme-menu" role="menu" aria-label="切换界面主题">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.id}
              className={theme === option.id ? "active" : ""}
              onClick={() => choose(option.id)}
            >
              <i className="theme-swatch" aria-hidden="true">
                {option.colors.map((color) => <span key={color} style={{ background: color }} />)}
              </i>
              <span><b>{option.label}</b><small>{option.note}</small></span>
              {theme === option.id && <em aria-hidden="true">✓</em>}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="theme-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        title="切换界面主题"
        onClick={() => setOpen(!open)}
      >
        <i className="theme-swatch" aria-hidden="true">
          {themeOptions.map((option) => (
            <span key={option.id} style={{ background: option.colors[0] }} className={option.id === theme ? "current" : ""} />
          ))}
        </i>
        <b suppressHydrationWarning>{themeOptions.find((option) => option.id === theme)?.label}</b>
      </button>
    </div>
  );
}
