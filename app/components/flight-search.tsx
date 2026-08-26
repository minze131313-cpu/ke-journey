"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  flightCities,
  popularDepartureCities,
  searchFlights,
  FlightUnavailableError,
  type FlightSummary,
} from "../lib/travel-api";

type Direction = "outbound" | "return";

function todayPlus(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function FlightSearch({
  tripBase,
  tripName,
  terminalName,
}: {
  tripBase: string;
  tripName: string;
  terminalName: string;
}) {
  // 静态导出环境无服务端 searchParams：从 window.location 懒初始化读取
  const [direction, setDirection] = useState<Direction>(() => {
    if (typeof window === "undefined") return "outbound";
    return new URLSearchParams(window.location.search).get("direction") === "return" ? "return" : "outbound";
  });
  const [from, setFrom] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("from") ?? "";
  });
  const [date, setDate] = useState(todayPlus(14));
  const [cabin, setCabin] = useState("ECONOMY");
  const [adults, setAdults] = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ok">("idle");
  const [flights, setFlights] = useState<FlightSummary[]>([]);
  const [unavailable, setUnavailable] = useState<{ message: string; suggestion: string } | null>(null);
  const [errorText, setErrorText] = useState("");

  const runSearch = useCallback(async (fromValue: string) => {
    if (!fromValue.trim()) {
      setPickerOpen(true);
      return;
    }
    setStatus("loading");
    setFlights([]);
    setUnavailable(null);
    setErrorText("");
    try {
      const terminal = terminalName;
      const result = await searchFlights({
        from: direction === "outbound" ? fromValue : terminal,
        to: direction === "outbound" ? terminal : fromValue,
        date,
        tripType: "ONE_WAY",
        cabin: cabin as "ECONOMY" | "BUSINESS" | "FIRST",
        adults,
      });
      setFlights(result);
      setStatus("ok");
    } catch (error) {
      if (error instanceof FlightUnavailableError) {
        setUnavailable({ message: error.message, suggestion: error.suggestion });
        setStatus("error");
      } else {
        setErrorText(error instanceof Error ? error.message : "查询失败，请稍后再试");
        setStatus("error");
      }
    }
  }, [direction, terminalName, date, cabin, adults]);

  const chooseCity = (name: string) => {
    setFrom(name);
    setPickerOpen(false);
    runSearch(name);
  };

  const filteredCities = query.trim()
    ? flightCities.filter((city) => city.name.includes(query.trim()) || city.code.toLowerCase().includes(query.trim().toLowerCase()))
    : flightCities;

  return (
    <main className="travel-shell">
      <header className="travel-header">
        <Link className="back-map" href={`${tripBase}/`}><span>←</span> 返回环线地图</Link>
        <div className="travel-title-wrap">
          <small>FLIGHT DESK · 实时航班</small>
          <h1>{tripName} · 航班查询</h1>
          <p>起终点为 {terminalName}，选择你的出发城市与日期，实时查看航班与参考价格。</p>
        </div>
      </header>

      <section className="travel-form">
        <nav className="travel-type-tabs" aria-label="航班方向">
          <button className={direction === "outbound" ? "active" : ""} aria-pressed={direction === "outbound"} onClick={() => { setDirection("outbound"); setFlights([]); setStatus("idle"); }}>
            <b>去程</b><small>{from || "你的城市"} → {terminalName}</small>
          </button>
          <button className={direction === "return" ? "active" : ""} aria-pressed={direction === "return"} onClick={() => { setDirection("return"); setFlights([]); setStatus("idle"); }}>
            <b>回程</b><small>{terminalName} → {from || "你的城市"}</small>
          </button>
        </nav>

        <div className="travel-controls">
          <button type="button" className="city-picker-trigger" onClick={() => setPickerOpen(true)}>
            <small>出发城市</small>
            <b>{from || "请选择"}</b>
            <em>⌄</em>
          </button>
          <label className="travel-field">
            <small>出发日期</small>
            <input type="date" value={date} min={todayPlus(0)} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="travel-field">
            <small>舱位</small>
            <select value={cabin} onChange={(event) => setCabin(event.target.value)}>
              <option value="ECONOMY">经济舱</option>
              <option value="BUSINESS">公务舱</option>
              <option value="FIRST">头等舱</option>
            </select>
          </label>
          <label className="travel-field">
            <small>乘机人</small>
            <select value={adults} onChange={(event) => setAdults(Number(event.target.value))}>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} 人</option>)}
            </select>
          </label>
          <button type="button" className="travel-submit" onClick={() => runSearch(from)} disabled={status === "loading"}>
            {status === "loading" ? "查询中…" : "查询航班"}
          </button>
        </div>
      </section>

      {status === "idle" && !pickerOpen && (
        <section className="travel-empty">
          <p>{from ? "选择日期与舱位后点击「查询航班」。" : "先选择你的出发城市，再查询飞往" + terminalName + "的航班。"}</p>
        </section>
      )}

      {unavailable && (
        <section className="travel-notice" role="alert">
          <b>✈ 机票服务暂停升级中</b>
          <p>{unavailable.message}</p>
          <small>{unavailable.suggestion}</small>
        </section>
      )}

      {errorText && !unavailable && (
        <section className="travel-notice" role="alert">
          <b>查询失败</b>
          <p>{errorText}</p>
        </section>
      )}

      {status === "ok" && !flights.length && (
        <section className="travel-empty">
          <p>没有找到符合条件的结果，换个日期或出发城市试试。</p>
        </section>
      )}

      {flights.length > 0 && (
        <section className="flight-results">
          <div className="travel-section-head">
            <small>RESULTS</small>
            <h2>{direction === "outbound" ? `${from} → ${terminalName}` : `${terminalName} → ${from}`} · {date}</h2>
            <span>价格为参考展示价，以出票页为准</span>
          </div>
          {flights.map((flight, index) => (
            <article className="flight-card" key={`${flight.flightNo ?? "flight"}-${index}`}>
              <div className="flight-route">
                <div><small>出发</small><b>{flight.departTime ?? "--:--"}</b><span>{flight.departCity ?? from}</span><em>{flight.departAirport}</em></div>
                <div className="flight-line">
                  <small>{flight.flightNo ?? ""} {flight.airlineName ?? flight.airline ?? ""}</small>
                  <i aria-hidden="true">→</i>
                  <small>{flight.stops ? `经停 ${flight.stopCities ?? flight.stops}` : "直飞"}</small>
                </div>
                <div><small>到达</small><b>{flight.arriveTime ?? "--:--"}</b><span>{flight.arriveCity ?? (direction === "outbound" ? terminalName : from)}</span><em>{flight.arriveAirport}</em></div>
              </div>
              <div className="flight-price">
                {flight.price != null && <b>¥{flight.price}</b>}
                {flight.cabinLabel && <small>{flight.cabinLabel}</small>}
                {flight.tag && <em>{flight.tag}</em>}
              </div>
            </article>
          ))}
        </section>
      )}

      {pickerOpen && (
        <div className="city-picker-overlay" role="dialog" aria-modal="true" aria-label="选择出发城市">
          <div className="city-picker">
            <header>
              <b>选择出发城市</b>
              <button type="button" onClick={() => setPickerOpen(false)} aria-label="关闭">×</button>
            </header>
            <div className="city-search">
              <span>⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索城市或机场三字码（如 杭州 / HGH）" aria-label="搜索城市" />
            </div>
            <div className="city-popular">
              <small>热门出发城市</small>
              <div>
                {popularDepartureCities.map((name) => (
                  <button key={name} type="button" onClick={() => chooseCity(name)}>{name}</button>
                ))}
              </div>
            </div>
            <div className="city-list">
              <small>全部城市</small>
              <div>
                {filteredCities.map((city) => (
                  <button key={city.code} type="button" onClick={() => chooseCity(city.name)}>
                    <b>{city.name}</b><em>{city.code}</em>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
