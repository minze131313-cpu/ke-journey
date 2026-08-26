"use client";

import { useEffect, useState } from "react";

const preferenceKey = "ke-journey-text-size";

export default function TextSizeToggle() {
  const [large, setLarge] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(preferenceKey) === "large";
    document.documentElement.dataset.textScale = saved ? "large" : "standard";
    const update = window.setTimeout(() => setLarge(saved), 0);
    return () => window.clearTimeout(update);
  }, []);

  const toggle = () => {
    const next = !large;
    setLarge(next);
    document.documentElement.dataset.textScale = next ? "large" : "standard";
    window.localStorage.setItem(preferenceKey, next ? "large" : "standard");
  };

  return <button className="text-size-toggle" type="button" aria-pressed={large} onClick={toggle} title="切换页面文字大小">
    <span>Aa</span><b>{large ? "标准字" : "大字"}</b>
  </button>;
}
