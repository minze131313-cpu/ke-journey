import type { Place, PoiDetail, RouteDetail, TripDay } from "../journeys/types";
import Link from "next/link";
import DetailMediaCarousel from "./detail-media-carousel";

const categoryCopy = {
  scenic: { action:"游览策略", highlight:"值得停留", caution:"现场边界", className:"scenic" },
  city: { action:"订房清单", highlight:"区域选择", caution:"入住核对", className:"city" },
  supply: { action:"补给动作", highlight:"节点价值", caution:"库存底线", className:"supply" },
  warning: { action:"避险动作", highlight:"识别信号", caution:"禁止事项", className:"warning" },
};

function Sources({ items }:{ items:PoiDetail["sources"] }) {
  return <section className="source-section" id="sources">
    <div className="detail-section-head"><span>07</span><div><small>SOURCE DESK</small><h2>资料来源与核验</h2></div></div>
    <div className="source-list">
      {items.map((source,index)=><a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer">
        <span>{String(index+1).padStart(2,"0")}</span><div><b>{source.name}</b><small>{source.publisher}{source.note ? ` · ${source.note}` : ""}</small></div><em>↗</em>
      </a>)}
    </div>
    <p className="source-disclaimer">开放、票务、道路和天气均可能变化。详情页提供决策框架，临行仍以运营方与交通主管部门当天公告为准。</p>
  </section>;
}

function DetailHeader({ eyebrow,title,subtitle,icon,className,tripBase }:{ eyebrow:string;title:string;subtitle:string;icon:string;className:string;tripBase:string }) {
  return <header className={`detail-header ${className}`}>
    <a className="back-map" href={`${tripBase}/`}><span>←</span> 返回环线地图</a>
    <Link className="route-index" href="/">KE JOURNEY · 全部旅程</Link>
    <div className="detail-title-wrap">
      <span className="detail-type-icon">{icon}</span>
      <div><small>{eyebrow}</small><h1>{title}</h1><p>{subtitle}</p></div>
    </div>
  </header>;
}

function DetailMobileNav({ day, tripBase }:{ day:number; tripBase:string }) {
  return <nav className="detail-mobile-nav" aria-label="详情页快捷导航">
    <a href={`${tripBase}/`}><i>⌖</i><span>地图</span></a>
    <a href={`${tripBase}/route/${day}`}><i>D{day}</i><span>当天线路</span></a>
    <a href="#sources"><i>↗</i><span>资料来源</span></a>
  </nav>;
}

function DetailPager({ previous, next, progress }:{ previous?:{ href:string; eyebrow:string; title:string }; next?:{ href:string; eyebrow:string; title:string }; progress:string }) {
  return <nav className="detail-pager" aria-label="按行程顺序切换详情页">
    <div className="pager-progress"><small>JOURNEY ORDER</small><b>{progress}</b></div>
    {previous ? <Link className="pager-card previous" href={previous.href}><small>← 上一段 · {previous.eyebrow}</small><b>{previous.title}</b></Link> : <span className="pager-card disabled"><small>← 上一段</small><b>已经是第一段</b></span>}
    {next ? <Link className="pager-card next" href={next.href}><small>下一段 · {next.eyebrow} →</small><b>{next.title}</b></Link> : <span className="pager-card disabled next"><small>下一段 →</small><b>环线详情已结束</b></span>}
  </nav>;
}

export function PoiDetailPage({ detail, tripBase, tripName, poiOrder, places, terminalPlaceId }:{ detail:PoiDetail; tripBase:string; tripName:string; poiOrder:readonly string[]; places:Place[]; terminalPlaceId?:string }) {
  const copy = categoryCopy[detail.place.category];
  const dayPlaces = places.filter((p)=>p.day===detail.place.day && p.id!==detail.place.id).slice(0,4);
  const orderIndex = poiOrder.indexOf(detail.place.id);
  const previousPlace = orderIndex > 0 ? places.find((place)=>place.id===poiOrder[orderIndex-1]) : undefined;
  const nextPlace = orderIndex >= 0 && orderIndex < poiOrder.length-1 ? places.find((place)=>place.id===poiOrder[orderIndex+1]) : undefined;
  const isTerminal = terminalPlaceId !== undefined && detail.place.id === terminalPlaceId;
  const showStay = !isTerminal && detail.place.category !== "warning";
  return <main className={`detail-shell detail-${copy.className}`}>
    <DetailHeader eyebrow={`${detail.kindLabel} · D${detail.place.day}`} title={detail.place.name} subtitle={`${detail.place.region} · ${detail.place.subtitle}`} icon={detail.icon} className={copy.className} tripBase={tripBase} />
    <div className="detail-content">
      <section className="hero-grid">
        <DetailMediaCarousel items={detail.gallery} title={detail.place.name} />
        <div className="lead-card">
          <span className="lead-label">FIELD NOTE / 实地笔记</span>
          <p>{detail.lead}</p>
          <div className="coordinate">{detail.place.coords[1].toFixed(4)}° N&nbsp;&nbsp; {detail.place.coords[0].toFixed(4)}° E</div>
        </div>
      </section>

      <section className="stat-ribbon">
        {detail.stats.map((stat)=><div key={stat.label}><small>{stat.label}</small><strong>{stat.value}</strong></div>)}
      </section>

      {(isTerminal || showStay) && (
        <section className="travel-services" aria-label="出行服务">
          <div className="travel-services-head">
            <span>✈</span>
            <div><small>TRAVEL DESK · 实时出行服务</small><h2>{isTerminal ? "从这里出发" : "在这里过夜"}</h2></div>
          </div>
          {isTerminal ? (
            <div className="travel-service-actions">
              <a href={`${tripBase}/flights?direction=outbound`}><b>查询去程航班</b><small>我的城市 → {detail.place.name} · 实时票价</small><em>→</em></a>
              <a href={`${tripBase}/flights?direction=return`}><b>查询回程航班</b><small>{detail.place.name} → 我的城市 · 实时票价</small><em>→</em></a>
            </div>
          ) : (
            <div className="travel-service-actions">
              <a href={`${tripBase}/stay?place=${detail.place.id}&type=hotel`}><b>查询酒店</b><small>{detail.place.name}周边 · 实时房价房态</small><em>→</em></a>
              <a href={`${tripBase}/stay?place=${detail.place.id}&type=minsu`}><b>查询民宿</b><small>客栈 · 青旅 · 小院 · 实时房价</small><em>→</em></a>
            </div>
          )}
        </section>
      )}

      <section className="story-grid">
        <div className="story-main">
          <div className="detail-section-head"><span>01</span><div><small>PLACE / CONTEXT</small><h2>{detail.sections[0].title}</h2></div></div>
          <p>{detail.sections[0].text}</p>
          <blockquote>“不是多加一个打卡点，而是让这个节点在整条环线中承担明确角色。”</blockquote>
        </div>
        <aside className="highlight-card">
          <small>WHY IT MATTERS</small><h3>{copy.highlight}</h3>
          <ol>{detail.highlights.map((item,index)=><li key={item}><span>{String(index+1).padStart(2,"0")}</span>{item}</li>)}</ol>
        </aside>
      </section>

      <section className="context-band">
        <div className="detail-section-head light"><span>02</span><div><small>IN THE LOOP</small><h2>{detail.sections[1].title}</h2></div></div>
        <p>{detail.sections[1].text}</p>
        <div className="day-badge"><span>D{detail.place.day}</span><b>{detail.place.visit ?? "机动停留"}</b></div>
      </section>

      <section className="action-grid">
        <div>
          <div className="detail-section-head"><span>03</span><div><small>DO THIS</small><h2>{copy.action}</h2></div></div>
          <ul className="check-cards">{detail.actions.map((item)=><li key={item}><i>✓</i><span>{item}</span></li>)}</ul>
        </div>
        <div>
          <div className="detail-section-head"><span>04</span><div><small>WATCH FOR</small><h2>{copy.caution}</h2></div></div>
          <ul className="risk-cards">{detail.cautions.map((item,index)=><li key={item}><i>{index+1}</i><span>{item}</span></li>)}</ul>
        </div>
      </section>

      <section className="nearby-section">
        <div className="detail-section-head"><span>05</span><div><small>SAME DAY</small><h2>D{detail.place.day} 同日节点</h2></div></div>
        <div className="nearby-grid">
          {dayPlaces.length ? dayPlaces.map((place)=><a key={place.id} href={`${tripBase}/poi/${place.id}`}><small>{place.region}</small><b>{place.name}</b><span>{place.subtitle}</span><em>查看详情 →</em></a>) : <a href={`${tripBase}/route/${detail.place.day}`}><small>ROUTE DETAIL</small><b>D{detail.place.day} 完整线路</b><span>查看当天节奏、道路与风险</span><em>查看线路 →</em></a>}
          <a className="route-related" href={`${tripBase}/route/${detail.place.day}`}><small>ROUTE DETAIL</small><b>D{detail.place.day} 完整线路</b><span>道路、时间轴与驾驶边界</span><em>查看线路 →</em></a>
        </div>
      </section>

      <Sources items={detail.sources} />
    </div>
    <DetailPager
      progress={`节点 ${String(orderIndex+1).padStart(2,"0")} / ${poiOrder.length}`}
      previous={previousPlace ? { href:`${tripBase}/poi/${previousPlace.id}`, eyebrow:`D${previousPlace.day}`, title:previousPlace.name } : undefined}
      next={nextPlace ? { href:`${tripBase}/poi/${nextPlace.id}`, eyebrow:`D${nextPlace.day}`, title:nextPlace.name } : undefined}
    />
    <footer className="detail-footer"><a href={`${tripBase}/`}>← 回到地图继续规划</a><span>{tripName}自驾地图 · KE Journey</span></footer>
    <DetailMobileNav day={detail.place.day} tripBase={tripBase} />
  </main>;
}

export function RouteDetailPage({ detail, tripBase, tripName, places, days }:{ detail:RouteDetail; tripBase:string; tripName:string; places:Place[]; days:TripDay[] }) {
  const stops = detail.day.stops.map((id)=>places.find((p)=>p.id===id)).filter(Boolean);
  const previousDay = detail.day.day > 1 ? detail.day.day-1 : undefined;
  const nextDay = detail.day.day < 12 ? detail.day.day+1 : undefined;
  const previousRoute = previousDay ? days[previousDay-1] : undefined;
  const nextRoute = nextDay ? days[nextDay-1] : undefined;
  return <main className="detail-shell detail-route">
    <DetailHeader eyebrow={`线路档案 · D${detail.day.day}`} title={detail.day.title} subtitle={`${detail.day.start} → ${detail.day.end} · ${detail.roads}`} icon={`D${detail.day.day}`} className="route" tripBase={tripBase} />
    <div className="detail-content">
      <section className="hero-grid">
        <DetailMediaCarousel items={detail.gallery} title={`D${detail.day.day} ${detail.day.title}`} />
        <div className="lead-card"><span className="lead-label">DRIVING BRIEF / 驾驶简报</span><p>{detail.lead}</p><div className="coordinate">{detail.day.start} → {detail.day.end}</div></div>
      </section>
      <section className="stat-ribbon">{detail.stats.map((stat)=><div key={stat.label}><small>{stat.label}</small><strong>{stat.value}</strong></div>)}</section>
      <section className="route-story">
        <div className="detail-section-head"><span>01</span><div><small>ROUTE LOGIC</small><h2>{detail.sections[0].title}</h2></div></div><p>{detail.sections[0].text}</p>
        <div className="road-line"><small>RECOMMENDED ROADS</small><b>{detail.roads}</b></div>
      </section>
      <section className="timeline-section">
        <div className="detail-section-head"><span>02</span><div><small>DAY RHYTHM</small><h2>当天时间轴</h2></div></div>
        <div className="drive-timeline">{detail.rhythm.map((item,index)=><div key={`${item.time}-${item.title}`}><span>{item.time}</span><i>{index+1}</i><section><b>{item.title}</b><p>{item.note}</p></section></div>)}</div>
      </section>
      <section className="route-node-section">
        <div className="detail-section-head"><span>03</span><div><small>MAP NODES</small><h2>沿途详情入口</h2></div></div>
        <div className="route-node-flow"><span className="terminal">{detail.day.start}</span>{stops.map((place)=><a href={`${tripBase}/poi/${place!.id}`} key={place!.id}><small>{place!.category}</small><b>{place!.name}</b><em>详情 ↗</em></a>)}<span className="terminal">{detail.day.end}</span></div>
      </section>
      <section className="action-grid">
        <div><div className="detail-section-head"><span>04</span><div><small>ROAD CHOICE</small><h2>{detail.sections[1].title}</h2></div></div><p className="body-copy">{detail.sections[1].text}</p></div>
        <div><div className="detail-section-head"><span>05</span><div><small>NON-NEGOTIABLE</small><h2>驾驶边界</h2></div></div><ul className="risk-cards">{detail.cautions.map((item,index)=><li key={item}><i>{index+1}</i><span>{item}</span></li>)}</ul></div>
      </section>
      <Sources items={detail.sources} />
    </div>
    <DetailPager
      progress={`线路 D${String(detail.day.day).padStart(2,"0")} / 12`}
      previous={previousRoute ? { href:`${tripBase}/route/${previousRoute.day}`, eyebrow:`D${previousRoute.day}`, title:previousRoute.title } : undefined}
      next={nextRoute ? { href:`${tripBase}/route/${nextRoute.day}`, eyebrow:`D${nextRoute.day}`, title:nextRoute.title } : undefined}
    />
    <footer className="detail-footer"><a href={`${tripBase}/`}>← 回到地图继续规划</a><span>D{detail.day.day} · {detail.day.start} → {detail.day.end}</span></footer>
    <DetailMobileNav day={detail.day.day} tripBase={tripBase} />
  </main>;
}
