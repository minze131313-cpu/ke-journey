import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute:"KE Journey｜把每一次远行整理成可以出发的路书" },
  description: "收录自驾旅行路线、交互地图、逐日行程、景点住宿、补给与风险提示。",
};

const journeys = [
  {
    slug: "qinggan-loop",
    eyebrow: "中国西北 · 已发布",
    title: "青甘大环线",
    subtitle: "从青海湖、柴达木到敦煌与祁连山",
    description: "一条把高原湖泊、荒漠雅丹、丝路文明和雪山草原串成闭环的自驾路书。",
    image: "/detail/qinghai.jpg",
    days: "12 天",
    distance: "约 3,000 km",
    season: "5–10 月",
    difficulty: "进阶",
  },
];

export default function JourneyIndex() {
  return (
    <main className="journey-index">
      <header className="journey-hero">
        <nav className="journey-nav" aria-label="站点导航">
          <Link className="journey-logo" href="/"><span>KE</span><b>JOURNEY</b></Link>
          <div><a href="#journeys">所有旅程</a><span>持续更新</span></div>
        </nav>
        <div className="journey-hero-copy">
          <p>FIELD NOTES · ROAD TRIPS · MAPS</p>
          <h1>把每一次远行，<br />整理成可以出发的路书。</h1>
          <span>真实路线、逐日节奏、地图节点与风险边界。这里记录的不只是目的地，而是如何抵达。</span>
          <a href="#journeys">浏览旅程 <i>↓</i></a>
        </div>
        <div className="journey-hero-stamp" aria-hidden="true"><b>KE</b><span>ON THE ROAD</span></div>
      </header>

      <section className="journey-library" id="journeys">
        <div className="journey-section-head">
          <div><p>01 / JOURNEY LIBRARY</p><h2>旅程目录</h2></div>
          <span>从一条完整路线开始，逐步建立属于自己的旅行档案。</span>
        </div>

        <div className="journey-grid">
          {journeys.map((journey) => (
            <article className="journey-card" key={journey.slug}>
              <a className="journey-cover" href={`/${journey.slug}/`} aria-label={`打开${journey.title}`}>
                <img src={journey.image} alt="青海湖沿线高原景观" />
                <span>{journey.eyebrow}</span>
                <strong>01</strong>
              </a>
              <div className="journey-card-body">
                <p>{journey.subtitle}</p>
                <h3>{journey.title}</h3>
                <span>{journey.description}</span>
                <dl>
                  <div><dt>行程</dt><dd>{journey.days}</dd></div>
                  <div><dt>里程</dt><dd>{journey.distance}</dd></div>
                  <div><dt>季节</dt><dd>{journey.season}</dd></div>
                  <div><dt>难度</dt><dd>{journey.difficulty}</dd></div>
                </dl>
                <a className="journey-enter" href={`/${journey.slug}/`}><span>打开完整路书</span><b>→</b></a>
              </div>
            </article>
          ))}

          <article className="journey-card journey-card-soon">
            <div><span>02</span><p>NEXT JOURNEY</p><h3>下一段路，正在整理。</h3><small>新的路线会继续加入这里。</small></div>
          </article>
        </div>
      </section>

      <footer className="journey-index-footer"><b>KE JOURNEY</b><span>路线会改变，出发的理由不会。</span><small>© 2026 BORDY.CN</small></footer>
    </main>
  );
}
