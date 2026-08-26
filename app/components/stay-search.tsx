"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Place } from "../journeys/types";
import { rewriteBookingUrl, searchHotels, type HotelSummary } from "../lib/travel-api";

type StayType = "hotel" | "minsu";

const MINSU_KEYWORDS = ["民宿", "客栈", "青旅", "青年旅舍", "公寓", "小院", "之家"];

function todayPlus(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function nextDay(date: string): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + 1);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function isMinsuLike(hotel: HotelSummary): boolean {
  const text = `${hotel.name ?? ""} ${(hotel.tags ?? []).join(" ")} ${(hotel.amenities ?? []).join(" ")}`;
  return MINSU_KEYWORDS.some((keyword) => text.includes(keyword));
}

function hotelSearchKey(place: Place): { place: string; placeType: "城市" | "景点" } {
  return { place: place.staySearch ?? place.name, placeType: place.stayPlaceType ?? "城市" };
}

export default function StaySearch({
  tripBase,
  places,
}: {
  tripBase: string;
  places: Place[];
}) {
  // 静态导出下无法使用服务端 searchParams，从 window.location 懒初始化读取
  const [placeId, setPlaceId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("place");
  });
  const [type, setType] = useState<StayType>(() => {
    if (typeof window === "undefined") return "hotel";
    return new URLSearchParams(window.location.search).get("type") === "minsu" ? "minsu" : "hotel";
  });
  const [checkIn, setCheckIn] = useState(todayPlus(1));
  const [nights, setNights] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ok">("idle");
  const [hotels, setHotels] = useState<HotelSummary[]>([]);
  const [errorText, setErrorText] = useState("");
  const [rawCount, setRawCount] = useState(0);

  const place = places.find((item) => item.id === placeId) ?? null;

  const runSearch = useCallback(async (targetPlace: Place, targetType: StayType, targetCheckIn: string, targetNights: number) => {
    setStatus("loading");
    setHotels([]);
    setRawCount(0);
    setErrorText("");
    const key = hotelSearchKey(targetPlace);
    try {
      const result = await searchHotels({
        place: key.place,
        placeType: key.placeType,
        checkInDate: targetCheckIn,
        stayNights: targetNights,
        adultCount: 2,
        size: 20,
        requiredTag: targetType === "minsu" ? "民宿" : undefined,
      });
      setRawCount(result.length);
      setHotels(targetType === "minsu" ? result.filter(isMinsuLike) : result);
      setStatus("ok");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "查询失败，请稍后再试");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!place) return;
    // 通过宏任务触发首查，避免在 effect 内同步 setState
    const timer = window.setTimeout(() => { void runSearch(place, type, checkIn, nights); }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  const switchType = (next: StayType) => {
    setType(next);
    if (place) void runSearch(place, next, checkIn, nights);
  };

  const submit = () => {
    if (place) void runSearch(place, type, checkIn, nights);
  };

  const checkOut = nextDay(checkIn);

  if (!place) {
    const selectable = places.filter((item) => item.category !== "warning");
    return (
      <main className="travel-shell">
        <header className="travel-header">
          <Link className="back-map" href={`${tripBase}/`}><span>←</span> 返回环线地图</Link>
          <div className="travel-title-wrap">
            <small>STAY DESK · 实时住宿</small>
            <h1>选择停留点</h1>
            <p>选择环线上的一个停留点，查询周边实时酒店与民宿。</p>
          </div>
        </header>
        <section className="stay-picker-list">
          {selectable.map((item) => (
            <a key={item.id} href={`${tripBase}/stay?place=${item.id}&type=hotel`}>
              <span className="category-dot" data-category={item.category} />
              <b>{item.name}</b>
              <small>D{item.day} · {item.region}</small>
              <em>查住宿 →</em>
            </a>
          ))}
        </section>
      </main>
    );
  }

  const searchPlace = hotelSearchKey(place).place;

  return (
    <main className="travel-shell">
      <header className="travel-header">
        <Link className="back-map" href={`${tripBase}/`}><span>←</span> 返回环线地图</Link>
        <div className="travel-title-wrap">
          <small>STAY DESK · 实时住宿</small>
          <h1>{place.name} · 住宿查询</h1>
          <p>实时房价与房态，酒店与民宿分开查询；价格为参考价，下单以预订页为准。</p>
        </div>
      </header>

      <section className="travel-form">
        <nav className="travel-type-tabs" aria-label="住宿类型">
          <button className={type === "hotel" ? "active" : ""} aria-pressed={type === "hotel"} onClick={() => switchType("hotel")}>
            <b>酒店</b><small>星级 · 品牌 · 设施</small>
          </button>
          <button className={type === "minsu" ? "active" : ""} aria-pressed={type === "minsu"} onClick={() => switchType("minsu")}>
            <b>民宿</b><small>客栈 · 青旅 · 小院</small>
          </button>
        </nav>

        <div className="travel-controls">
          <label className="travel-field">
            <small>入住日期</small>
            <input type="date" value={checkIn} min={todayPlus(0)} onChange={(event) => setCheckIn(event.target.value)} />
          </label>
          <label className="travel-field">
            <small>入住晚数</small>
            <select value={nights} onChange={(event) => setNights(Number(event.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} 晚</option>)}
            </select>
          </label>
          <div className="travel-field static">
            <small>搜索地点</small>
            <b>{searchPlace}{type === "minsu" ? "（民宿类）" : ""}</b>
          </div>
          <button type="button" className="travel-submit" onClick={submit} disabled={status === "loading"}>
            {status === "loading" ? "查询中…" : "重新查询"}
          </button>
        </div>
      </section>

      {errorText && (
        <section className="travel-notice" role="alert">
          <b>查询失败</b>
          <p>{errorText}</p>
          <small>住宿服务由合作方提供，可能暂时不可用，请稍后再试。</small>
        </section>
      )}

      {status === "ok" && !hotels.length && (
        <section className="travel-empty">
          <p>
            {rawCount > 0
              ? `「${searchPlace}」附近暂未找到明确的${type === "minsu" ? "民宿" : "酒店"}类房源（共 ${rawCount} 家住宿未分类匹配）。`
              : `「${searchPlace}」附近暂时没有搜索到${type === "minsu" ? "民宿" : "酒店"}，换一个日期或附近城镇试试。`}
          </p>
        </section>
      )}

      {hotels.length > 0 && (
        <section className="stay-results">
          <div className="travel-section-head">
            <small>RESULTS · {type === "hotel" ? "酒店" : "民宿"}</small>
            <h2>{place.name} · {checkIn} 入住 · {nights} 晚</h2>
            <span>参考价 · 实际以预订页为准</span>
          </div>
          <div className="stay-grid">
            {hotels.map((hotel) => (
              <article className="stay-card" key={hotel.hotelId}>
                {hotel.imageUrl ? (
                  <div className="stay-cover"><img src={hotel.imageUrl} alt={hotel.name} loading="lazy" referrerPolicy="no-referrer" /></div>
                ) : (
                  <div className="stay-cover placeholder" aria-hidden="true"><span>宿</span></div>
                )}
                <div className="stay-body">
                  <div className="stay-head">
                    <h3>{hotel.name}</h3>
                    {hotel.starRating != null && <b className="stay-stars">{"★".repeat(Math.min(5, Math.round(hotel.starRating)))}</b>}
                  </div>
                  <p className="stay-meta">
                    {hotel.distanceInMeters != null && <span>📍 距搜索点约 {(hotel.distanceInMeters / 1000).toFixed(1)} km</span>}
                    {hotel.address && <span>{hotel.address}</span>}
                  </p>
                  {(hotel.tags?.length || hotel.amenities?.length) && (
                    <div className="stay-tags">
                      {(hotel.tags ?? []).slice(0, 4).map((tag) => <i key={tag}>{tag}</i>)}
                      {(hotel.amenities ?? []).slice(0, 3).map((item) => <i key={item}>{item}</i>)}
                    </div>
                  )}
                  <div className="stay-foot">
                    <div className="stay-price">
                      {hotel.hasPrice && hotel.lowestPrice != null
                        ? <><b>¥{Math.round(hotel.lowestPrice)}</b><small>/ 晚起 · 参考价</small></>
                        : <small>{hotel.priceMessage ?? "价格需进入预订页确认"}</small>}
                    </div>
                    <a className="stay-book" href={rewriteBookingUrl(hotel.bookingUrl, checkIn, checkOut) ?? undefined} target="_blank" rel="nofollow noreferrer">
                      查看与预订 →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="travel-footer">
        <span>房价与库存为实时抓取的合作方数据，可能存在延迟；下单前请以预订页信息为准。</span>
      </footer>
    </main>
  );
}
