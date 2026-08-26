import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "页面不存在｜KE Journey" },
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="not-found-shell">
      <div className="not-found-stamp" aria-hidden="true"><b>KE</b><span>OFF THE MAP</span></div>
      <div className="not-found-copy">
        <p>404 / LOST ENTRY</p>
        <h1>这条路不在路书里。</h1>
        <span>链接可能已失效，或这个页面已经随行程一起重新编排。</span>
        <div className="not-found-actions">
          <Link className="primary" href="/">回到旅程目录</Link>
          <Link href="/qinggan-loop/">打开青甘大环线 →</Link>
        </div>
      </div>
    </main>
  );
}
