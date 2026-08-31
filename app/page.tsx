import type { Metadata } from "next";
import Link from "next/link";
import MediaImage from "./components/media-image";
import { journeys } from "./journeys/registry";

/** Travel Story 旅行影片工具站点地址（独立部署）；构建时可用环境变量覆盖 */
const TRAVEL_STORY_URL =
  process.env.NEXT_PUBLIC_TRAVEL_STORY_URL ?? "https://travel-story.bordy.cn/";

export const metadata: Metadata = {
  title: { absolute: "KE Journey｜把每一次远行整理成可以出发的路书" },
  description: "收录自驾旅行路线、交互地图、逐日行程、景点住宿、补给与风险提示。",
};

export default function JourneyIndex() {
  return (
    <main className="journey-index">
      <header className="journey-hero">
        <div className="journey-hero-bg" aria-hidden="true"><MediaImage src="/detail/qinghai.jpg" alt="" loading="eager" fetchPriority="high" sizes="100vw" /></div>
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
          <div><p>{String(journeys.length).padStart(2, "0")} / JOURNEY LIBRARY</p><h2>旅程目录</h2></div>
          <span>从一条完整路线开始，逐步建立属于自己的旅行档案。</span>
        </div>

        <div className="journey-grid">
          {journeys.map((journey) => (
            <article className="journey-card" key={journey.slug}>
              <a className="journey-cover" href={`/${journey.slug}/`} aria-label={`打开${journey.title}`}>
                <MediaImage src={journey.image} alt={`${journey.title}沿途景观`} sizes="(min-width: 1200px) 40vw, 100vw" />
                <span>{journey.eyebrow}</span>
                <strong>{journey.number}</strong>
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

          <article className="journey-card journey-card-tool">
            <a className="journey-cover" href={TRAVEL_STORY_URL} target="_blank" rel="noreferrer" aria-label="打开 Travel Story 旅行影片工具">
              <MediaImage src="/detail/mingsha.jpg" alt="鸣沙山沙漠落日，Travel Story 旅行影片工具封面" sizes="(min-width: 1200px) 40vw, 100vw" />
              <span>旅行规划 · 地图影片</span>
              <strong>TS</strong>
            </a>
            <div className="journey-card-body">
              <p>PLAN · RECORD · STORY</p>
              <h3>Travel Story</h3>
              <span>把这里的目的地变成一部旅行纪录片：按天规划行程、上传沿途照片与视频，让地图镜头、路线与字幕沿时间线自动合成影片。青甘大环线已作为内置行程预置其中。</span>
              <dl>
                <div><dt>内置行程</dt><dd>青甘大环线 12 天</dd></div>
                <div><dt>运行方式</dt><dd>本地 / 自部署</dd></div>
                <div><dt>成片画幅</dt><dd>16:9 · 9:16</dd></div>
                <div><dt>输出</dt><dd>720p / 1080p MP4</dd></div>
              </dl>
              <a className="journey-enter" href={TRAVEL_STORY_URL} target="_blank" rel="noreferrer"><span>打开 Travel Story</span><b>→</b></a>
            </div>
          </article>

          <article className="journey-card journey-card-soon">
            <div><span>{String(journeys.length + 1).padStart(2, "0")}</span><p>NEXT JOURNEY</p><h3>下一段路，正在整理。</h3><small>新的路线会继续加入这里。</small></div>
          </article>
        </div>
      </section>

      <footer className="journey-index-footer"><b>KE JOURNEY</b><span>路线会改变，出发的理由不会。</span><small>© 2026 BORDY.CN</small></footer>
    </main>
  );
}
