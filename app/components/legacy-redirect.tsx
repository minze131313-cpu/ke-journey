"use client";

import { useEffect } from "react";

// 旧版 /route/:day 链接（无旅程前缀）：静态托管无法做服务端 301，
// 用客户端跳转 + canonical 把旧链接引导到青甘大环线对应线路。

export default function LegacyRouteRedirect({ target }: { target: string }) {
  useEffect(() => {
    window.location.replace(target);
  }, [target]);
  return (
    <main className="legacy-redirect">
      <p>页面已迁移，正在跳转…</p>
      <a href={target}>如果没有自动跳转，点击前往 {target}</a>
    </main>
  );
}
