"use client";

import { useRef, useState } from "react";
import type { MediaAsset } from "../detail-data";

export default function DetailMediaCarousel({ items, title }:{ items:MediaAsset[]; title:string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = (index:number) => {
    const next = (index + items.length) % items.length;
    track.current?.children[next]?.scrollIntoView({ behavior:"smooth", block:"nearest", inline:"start" });
    setActive(next);
  };

  const syncIndex = () => {
    if (!track.current) return;
    const width = track.current.clientWidth || 1;
    setActive(Math.max(0, Math.min(items.length - 1, Math.round(track.current.scrollLeft / width))));
  };

  return <section className="media-carousel" aria-label={`${title}图片，可左右滑动查看`} tabIndex={0} onKeyDown={(event)=>{
    if (event.key === "ArrowLeft") goTo(active-1);
    if (event.key === "ArrowRight") goTo(active+1);
  }}>
    <div className="media-track" ref={track} onScroll={syncIndex}>
      {items.map((item,index)=><figure className={`media-slide framing-${item.framing ?? "full"}`} key={`${item.src}-${index}`}>
        <img src={item.src} alt={item.alt} loading={index ? "lazy" : "eager"} />
        <span className="media-scope">{item.contextLabel ?? "已核验影像"}</span>
        {items.length > 1 && active === index && <div className="media-edge-controls">
          <button type="button" onClick={()=>goTo(active-1)} aria-label="上一张图片"><span aria-hidden="true">‹</span></button>
          <button type="button" onClick={()=>goTo(active+1)} aria-label="下一张图片"><span aria-hidden="true">›</span></button>
        </div>}
        <figcaption>
          <b>{item.caption}</b>
          <small>{item.credit}</small>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">原图与许可 ↗</a>
        </figcaption>
      </figure>)}
    </div>
    <div className="media-controls">
      <span aria-live="polite"><b>{String(active+1).padStart(2,"0")}</b> / {String(items.length).padStart(2,"0")}</span>
      <div className="media-dots" aria-hidden="true">{items.map((_,index)=><i className={active===index ? "active" : ""} key={index} />)}</div>
      <small>滑动或点击箭头</small>
    </div>
  </section>;
}
