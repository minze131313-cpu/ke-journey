"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Category, Journey, Place } from "../journeys/types";

declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: { securityJsCode: string };
  }
}

type Filter = "all" | Category;
type Tab = "plan" | "roads" | "checklist";
type MobileView = "map" | "trip" | "roads" | "checklist";
type RouteMetric = { distance: string; time: string; tolls?: string };

const categoryLabels: Record<Filter, string> = {
  all: "全部节点",
  scenic: "景点",
  city: "住宿",
  supply: "补给",
  warning: "风险",
};

const categorySymbols: Record<Category, string> = {
  scenic: "景",
  city: "宿",
  supply: "补",
  warning: "险",
};

const filterSymbols: Record<Filter, string> = { all: "环", ...categorySymbols };

function loadAmap() {
  if (typeof window === "undefined") return Promise.reject(new Error("browser only"));
  if (window.AMap) return Promise.resolve(window.AMap);
  const current = document.querySelector<HTMLScriptElement>("script[data-amap-trip]");
  if (current) {
    return new Promise((resolve, reject) => {
      current.addEventListener("load", () => resolve(window.AMap), { once: true });
      current.addEventListener("error", reject, { once: true });
    });
  }
  const key = process.env.NEXT_PUBLIC_AMAP_KEY;
  const securityJsCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE;
  if (!key || !securityJsCode) return Promise.reject(new Error("missing credentials"));
  window._AMapSecurityConfig = { securityJsCode };
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.dataset.amapTrip = "true";
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Driving,AMap.Scale,AMap.ToolBar,AMap.MapType,AMap.Traffic`;
    script.async = true;
    script.onload = () => resolve(window.AMap);
    script.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(script);
  });
}

// 主题 → 高德内置底图风格
function amapStyleForTheme(theme: string | undefined): string {
  if (theme === "dusk") return "amap://styles/dark";
  if (theme === "alpine") return "amap://styles/fresh";
  return "amap://styles/whitesmoke";
}

function markerContent(place: Place, terminalPlaceId: string) {
  if (place.id === terminalPlaceId) {
    return `<button class="loop-terminal-pin" aria-label="环线起点和终点：${place.name}"><span><i>起</i><i>终</i></span><b>${place.name}</b><small>环线起终点</small></button>`;
  }
  return `<button class="poi-pin poi-${place.category}" aria-label="${place.name}"><span>${categorySymbols[place.category]}</span><b>${place.name}</b></button>`;
}

function placeMatchesDay(place: Place, day: number, extendedStayDays: Record<string, number[]>) {
  return place.day === day || extendedStayDays[place.id]?.includes(day) || false;
}

export default function JourneyMap({ journey }: { journey: Journey }) {
  const { slug, config } = journey;
  const { places, days, routeRoads, tripStats } = journey.trip;
  const tripBase = `/${slug}`;
  const extendedStayDays = config.extendedStayDays;

  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const routesRef = useRef<Map<number, any>>(new Map());
  const satelliteRef = useRef<any>(null);
  const trafficRef = useRef<any>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");
  const [activeDay, setActiveDay] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [tab, setTab] = useState<Tab>("plan");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedRouteDay, setSelectedRouteDay] = useState<number | null>(null);
  const [routeMetrics, setRouteMetrics] = useState<Record<number, RouteMetric>>({});
  const [query, setQuery] = useState("");
  const [satellite, setSatellite] = useState(false);
  const [traffic, setTraffic] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("map");

  const filteredDays = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return days;
    return days.filter((day) => `${day.title}${day.start}${day.end}${day.stay}${day.summary}`.toLowerCase().includes(value));
  }, [query, days]);

  useEffect(() => {
    let disposed = false;
    let routeTimer: ReturnType<typeof setTimeout> | undefined;
    loadAmap().then((AMap) => {
      if (disposed || !mapNode.current) return;
      const map = new AMap.Map(mapNode.current, {
        zoom: config.mapZoom,
        center: config.mapCenter,
        mapStyle: amapStyleForTheme(document.documentElement.dataset.theme),
        viewMode: "3D",
        pitch: 18,
        rotateEnable: false,
        showLabel: true,
      });
      mapRef.current = map;
      map.addControl(new AMap.Scale({ position: "RB" }));
      map.addControl(new AMap.ToolBar({ position: { right: "18px", top: "84px" }, liteStyle: true }));

      days.filter((day) => day.route.length > 1).forEach((day) => {
        const polyline = new AMap.Polyline({
          path: day.route,
          strokeColor: day.color,
          strokeWeight: 5,
          strokeOpacity: .58,
          lineJoin: "round",
          lineCap: "round",
          zIndex: 40,
          cursor: "pointer",
          showDir: true,
          isOutline: true,
          borderWeight: 4,
          outlineColor: "rgba(255,255,255,.72)",
        });
        polyline.on("click", () => {
          setActiveDay(day.day);
          setSelectedPlace(null);
          setSelectedRouteDay(day.day);
          const relatedMarkers = places
            .filter((place) => placeMatchesDay(place, day.day, extendedStayDays))
            .map((place) => markersRef.current.get(place.id))
            .filter(Boolean);
          map.setFitView([polyline, ...relatedMarkers], false, [90, 70, 90, 70], 9.5);
        });
        routesRef.current.set(day.day, polyline);
        map.add(polyline);

      });

      config.closedRoads.forEach((closed) => {
        const closedRoad = new AMap.Polyline({
          path: closed.path,
          strokeColor: closed.color,
          strokeWeight: 5,
          strokeOpacity: .9,
          strokeStyle: "dashed",
          borderWeight: 2,
          outlineColor: "#fff5f0",
          zIndex: 55,
        });
        map.add(closedRoad);
      });

      places.forEach((place) => {
        const marker = new AMap.Marker({
          position: place.coords,
          title: place.name,
          content: markerContent(place, config.terminalPlaceId),
          offset: place.id === config.terminalPlaceId ? new AMap.Pixel(-38, -60) : new AMap.Pixel(-17, -17),
          zIndex: place.category === "warning" ? 130 : 100,
        });
        marker.on("click", () => {
          setSelectedPlace(place);
          setSelectedRouteDay(null);
          map.panTo(place.coords);
        });
        markersRef.current.set(place.id, marker);
        map.add(marker);
      });

      satelliteRef.current = new AMap.TileLayer.Satellite({ opacity: .9 });
      trafficRef.current = new AMap.TileLayer.Traffic({ zIndex: 9 });
      map.setFitView([...routesRef.current.values()], false, [70, 70, 70, 70], 6.5);
      setMapStatus("ready");

      let routeIndex = 0;
      const routeableDays = days.filter((day) => day.route.length > 1);
      const enrichRoute = () => {
        if (disposed || routeIndex >= routeableDays.length) return;
        const day = routeableDays[routeIndex++];
        const driving = new AMap.Driving({
          policy: AMap.DrivingPolicy.LEAST_TIME,
          ferry: 0,
          hideMarkers: true,
          showTraffic: false,
        });
        const origin = day.route[0];
        const destination = day.route[day.route.length - 1];
        const waypoints = day.route.slice(1, -1).map((point) => new AMap.LngLat(point[0], point[1]));
        driving.search(
          new AMap.LngLat(origin[0], origin[1]),
          new AMap.LngLat(destination[0], destination[1]),
          { waypoints },
          (status: string, result: any) => {
            if (status === "complete" && result.routes?.[0]) {
              const apiRoute = result.routes[0];
              const path = apiRoute.steps.flatMap((step: any) => step.path || []);
              if (path.length) routesRef.current.get(day.day)?.setPath(path);
              const minutes = Math.max(1, Math.round((apiRoute.time || 0) / 60));
              const hours = Math.floor(minutes / 60);
              const restMinutes = minutes % 60;
              setRouteMetrics((current) => ({
                ...current,
                [day.day]: {
                  distance: `${Math.round((apiRoute.distance || 0) / 1000)} km`,
                  time: hours ? `${hours}小时${restMinutes ? `${restMinutes}分` : ""}` : `${restMinutes}分钟`,
                  tolls: typeof apiRoute.tolls === "number" ? `约 ¥${apiRoute.tolls}` : undefined,
                },
              }));
            }
            routeTimer = setTimeout(enrichRoute, 260);
          },
        );
      };
      routeTimer = setTimeout(enrichRoute, 300);
    }).catch(() => setMapStatus("error"));

    return () => {
      disposed = true;
      if (routeTimer) clearTimeout(routeTimer);
      mapRef.current?.destroy();
      mapRef.current = null;
      markersRef.current.clear();
      routesRef.current.clear();
    };
  }, []);

  // 主题切换时同步高德底图风格
  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<{ theme: string }>).detail;
      if (!mapRef.current) return;
      try {
        mapRef.current.setMapStyle(amapStyleForTheme(detail?.theme));
      } catch {
        // 部分官方风格名需要重建地图，失败时保持当前底图
      }
    };
    window.addEventListener("ke-journey:theme-change", onThemeChange);
    return () => window.removeEventListener("ke-journey:theme-change", onThemeChange);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapStatus !== "ready") return;
    markersRef.current.forEach((marker, id) => {
      const place = places.find((item) => item.id === id);
      if (!place) return;
      if (place.id === config.terminalPlaceId) {
        marker.setMap(mapRef.current);
        return;
      }
      const categoryMatch = filter === "all" || place.category === filter;
      const dayMatch = activeDay === 0 || placeMatchesDay(place, activeDay, extendedStayDays);
      marker.setMap(categoryMatch && dayMatch ? mapRef.current : null);
    });
    routesRef.current.forEach((route, day) => {
      const active = activeDay === 0 || day === activeDay;
      route.setOptions({
        strokeOpacity: active ? (activeDay ? .96 : .52) : .09,
        strokeWeight: activeDay === day ? 8 : 5,
        zIndex: activeDay === day ? 75 : 40,
      });
    });
  }, [activeDay, filter, mapStatus]);

  const chooseDay = useCallback((dayNumber: number) => {
    setActiveDay(dayNumber);
    setSelectedPlace(null);
    setSelectedRouteDay(null);
    setSidebarOpen(false);
    setMobileView("map");
    if (!mapRef.current) return;
    if (dayNumber === 0) {
      mapRef.current.setFitView([...routesRef.current.values()], false, [80, 80, 80, 80], 6.5);
      return;
    }
    const route = routesRef.current.get(dayNumber);
    const relatedMarkers = places
      .filter((place) => placeMatchesDay(place, dayNumber, extendedStayDays))
      .map((place) => markersRef.current.get(place.id))
      .filter(Boolean);
    mapRef.current.setFitView(route ? [route, ...relatedMarkers] : relatedMarkers, false, [90, 70, 90, 70], 9.5);
  }, []);

  const focusPlace = (place: Place) => {
    setSelectedPlace(place);
    setSelectedRouteDay(null);
    setMobileView("map");
    mapRef.current?.setZoomAndCenter(10.5, place.coords, false, 500);
  };

  const chooseMobileView = (view: MobileView) => {
    setMobileView(view);
    setSidebarOpen(view !== "map");
    if (view !== "map") setTab(view === "trip" ? "plan" : view);
  };

  const toggleSatellite = () => {
    if (!mapRef.current || !satelliteRef.current) return;
    const next = !satellite;
    if (next) mapRef.current.add(satelliteRef.current);
    else mapRef.current.remove(satelliteRef.current);
    setSatellite(next);
  };

  const toggleTraffic = () => {
    if (!mapRef.current || !trafficRef.current) return;
    const next = !traffic;
    if (next) mapRef.current.add(trafficRef.current);
    else mapRef.current.remove(trafficRef.current);
    setTraffic(next);
  };

  const exportPlan = () => {
    const payload = JSON.stringify({ title: config.exportTitle, generated: new Date().toISOString().slice(0, 10), days, places }, null, 2);
    const href = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = href;
    link.download = config.exportFilename;
    link.click();
    URL.revokeObjectURL(href);
  };

  const selectedRoute = selectedRouteDay ? days[selectedRouteDay - 1] : null;

  return (
    <main className={`app-shell mobile-view-${mobileView}`}>
      <aside className={`sidebar ${sidebarOpen ? "mobile-open" : ""}`} aria-label="行程规划面板">
        <header className="brand-row">
          <Link className="brand-mark" href="/" aria-label="返回全部旅程">KE</Link>
          <div className="brand-copy">
            <p>{config.kicker}</p>
            <h1>{config.title}</h1>
          </div>
          <button className="export-button" onClick={exportPlan}>导出路书</button>
        </header>

        <div className="summary-card">
          <div><strong>{tripStats.days}</strong><span>天</span></div>
          <div><strong>{tripStats.distance}</strong><span>公里</span></div>
          <div><strong>{tripStats.nights}</strong><span>晚住宿</span></div>
          <div><strong>{tripStats.sights}</strong><span>核心节点</span></div>
        </div>

        <div className="search-wrap">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索城市、景点或路段" aria-label="搜索行程" />
          {query && <button onClick={() => setQuery("")} aria-label="清除搜索">×</button>}
        </div>

        <nav className="tabs" aria-label="地图内容">
          <button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>行程</button>
          <button className={tab === "roads" ? "active" : ""} onClick={() => setTab("roads")}>路况</button>
          <button className={tab === "checklist" ? "active" : ""} onClick={() => setTab("checklist")}>准备</button>
        </nav>

        <div className="sidebar-scroll">
          {tab === "plan" && (
            <section className="day-list">
              <button className={`all-route-card ${activeDay === 0 ? "active" : ""}`} onClick={() => chooseDay(0)}>
                <span className="route-ring">↻</span>
                <span><b>完整环线总览</b><small>{config.loopSummary}</small></span>
                <em>全图</em>
              </button>
              {filteredDays.map((day) => (
                <article className={`day-card ${activeDay === day.day ? "active" : ""}`} key={day.day}>
                  <button className="day-card-main" onClick={() => chooseDay(day.day)}>
                    <span className="day-number" style={{ background: day.color }}>D{day.day}</span>
                    <span className="day-copy"><b>{day.title}</b><small>{day.start} → {day.end}</small></span>
                    <span className="day-metrics"><b>{day.km}</b><small>{day.drive}</small></span>
                  </button>
                  {activeDay === day.day && (
                    <div className="day-detail">
                      <p>{day.summary}</p>
                      <div className="stay-row"><span>今夜住宿</span><b>{day.stay}</b></div>
                      <div className="task-list">{day.tasks.map((task) => <span key={task}>✓ {task}</span>)}</div>
                      <div className="stop-chips">
                        {day.stops.map((id) => {
                          const place = places.find((item) => item.id === id);
                          return place ? <button key={id} onClick={() => focusPlace(place)}>{place.name}</button> : null;
                        })}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </section>
          )}

          {tab === "roads" && (
            <section className="info-section">
              <div className="section-title"><span className="alert-icon">!</span><div><b>{config.roads.kicker}</b><small>{config.roads.lastCheck}</small></div></div>
              <div className="road-alert">
                <span>{config.roads.alert.badge}</span>
                <h2>{config.roads.alert.title}</h2>
                <p>{config.roads.alert.description}</p>
                <div className="safe-route"><small>{config.roads.alert.detourLabel}</small><b>{config.roads.alert.detour}</b></div>
                <button onClick={() => chooseDay(config.roads.alert.focusDay)}>在地图上查看绕行</button>
              </div>
              {config.roads.notes.map((note) => (
                <div className="road-note" key={note.title}><b>{note.title}</b><p>{note.text}</p></div>
              ))}
            </section>
          )}

          {tab === "checklist" && (
            <section className="info-section checklist">
              {config.checklist.groups.map((group) => (
                <div className="check-group" key={group.title}><h2>{group.title}</h2>{group.items.map((item) => <label key={item}><input type="checkbox" /> {item}</label>)}</div>
              ))}
              <div className="emergency-card"><span>{config.checklist.emergency.label}</span><b>{config.checklist.emergency.numbers}</b><p>{config.checklist.emergency.note}</p></div>
            </section>
          )}
        </div>
      </aside>

      <section className="map-stage">
        <div ref={mapNode} className="map-canvas" aria-label={`${config.title}高德交互地图`} />
        {mapStatus !== "ready" && (
          <div className={`map-loader ${mapStatus === "error" ? "error" : ""}`}>
            <span>{mapStatus === "error" ? "!" : "环"}</span>
            <b>{mapStatus === "error" ? "高德地图没有加载成功" : "正在整理完整环线…"}</b>
            <small>{mapStatus === "error" ? "请检查网络、Key白名单与安全密钥" : "路线与节点会逐段显示"}</small>
          </div>
        )}

        <div className="map-topbar">
          <button className="mobile-menu" onClick={() => chooseMobileView("trip")} aria-label="打开行程">路线</button>
          <div className="status-pill"><span className={mapStatus === "ready" ? "live-dot" : "wait-dot"} />{mapStatus === "ready" ? "高德地图已连接" : "地图加载中"}</div>
          <div className="filter-pills">
            {(Object.keys(categoryLabels) as Filter[]).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}><i>{filterSymbols[item]}</i>{categoryLabels[item]}</button>)}
          </div>
        </div>

        <div className="layer-controls">
          <button className={satellite ? "active" : ""} onClick={toggleSatellite}><span>▦</span>卫星</button>
          <button className={traffic ? "active" : ""} onClick={toggleTraffic}><span>≋</span>路况</button>
          <button onClick={() => chooseDay(0)}><span>◎</span>全环</button>
        </div>

        <div className="map-legend">
          <span><i className="scenic">景</i>景点</span><span><i className="city">宿</i>住宿</span><span><i className="supply">补</i>补给</span><span><i className="warning">险</i>风险</span><span><i className="closed" />封闭路段</span>
        </div>

        <div className="route-direction-card" aria-label={`环线方向：${config.directionLabel}`}>
          <span>↻</span><div><small>环线方向</small><b>{config.directionLabel}</b></div>
        </div>

        {activeDay > 0 && (
          <div className="active-day-banner" style={{ borderColor: days[activeDay - 1].color }}>
            <span style={{ background: days[activeDay - 1].color }}>D{activeDay}</span>
            <div><b>{days[activeDay - 1].title}</b><small>{days[activeDay - 1].km} · {days[activeDay - 1].drive} · 住 {days[activeDay - 1].stay}</small></div>
            <button onClick={() => chooseDay(0)}>×</button>
          </div>
        )}

        {selectedRoute && (
          <article className="route-panel" style={{ borderTopColor: selectedRoute.color }}>
            <button className="place-close" onClick={() => setSelectedRouteDay(null)} aria-label="关闭线路详情">×</button>
            <div className="route-panel-kicker"><span style={{ background: selectedRoute.color }}>D{selectedRoute.day}</span>线路详情 · 点击彩色路线查看</div>
            <h2>{selectedRoute.start} <em>→</em> {selectedRoute.end}</h2>
            <h3>{selectedRoute.title}</h3>
            <div className="route-stat-grid">
              <span><small>计划总里程</small><b>{selectedRoute.km}</b></span>
              <span><small>计划驾驶</small><b>{selectedRoute.drive}</b></span>
              <span><small>今夜住宿</small><b>{selectedRoute.stay}</b></span>
              <span><small>高德当前线路</small><b>{routeMetrics[selectedRoute.day]?.distance || "计算中…"}</b></span>
            </div>
            {routeMetrics[selectedRoute.day] && (
              <div className="amap-metric"><span>高德驾车规划</span><b>{routeMetrics[selectedRoute.day].time}</b>{routeMetrics[selectedRoute.day].tolls && <em>{routeMetrics[selectedRoute.day].tolls}</em>}<small>当前地图所示方向；往返日请以计划总里程为准</small></div>
            )}
            <div className="route-section">
              <small>主要道路</small>
              <p>{routeRoads[selectedRoute.day]}</p>
            </div>
            <div className="route-section">
              <small>途经与停靠</small>
              <div className="route-stop-list">
                <b>{selectedRoute.start}</b>
                {selectedRoute.stops.map((id) => {
                  const place = places.find((item) => item.id === id);
                  return place ? <button key={id} onClick={() => focusPlace(place)}>{place.name}</button> : null;
                })}
                {selectedRoute.end !== selectedRoute.start && <b>{selectedRoute.end}</b>}
              </div>
            </div>
            <p className="route-summary">{selectedRoute.summary}</p>
            <div className="route-task-grid">{selectedRoute.tasks.map((task) => <span key={task}>✓ {task}</span>)}</div>
            <div className="panel-actions">
              <a className="day-link primary" href={`${tripBase}/route/${selectedRoute.day}`}>查看线路图文详情 →</a>
              <button className="day-link secondary" onClick={() => chooseDay(selectedRoute.day)}>展开 D{selectedRoute.day} 安排</button>
            </div>
          </article>
        )}

        {selectedPlace && (
          <article className="place-panel">
            <button className="place-close" onClick={() => setSelectedPlace(null)} aria-label="关闭详情">×</button>
            <div className="place-kicker"><span className={`category-dot ${selectedPlace.category}`} />{selectedPlace.region}</div>
            <h2>{selectedPlace.name}</h2>
            <h3>{selectedPlace.subtitle}</h3>
            <div className="place-meta">
              {selectedPlace.altitude && <span><small>海拔</small><b>{selectedPlace.altitude}</b></span>}
              {selectedPlace.visit && <span><small>建议停留</small><b>{selectedPlace.visit}</b></span>}
            </div>
            <p>{selectedPlace.description}</p>
            {selectedPlace.booking && <div className="booking-note"><span>预约</span>{selectedPlace.booking}</div>}
            <ul>{selectedPlace.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
            <div className="panel-actions">
              <a className="day-link primary" href={`${tripBase}/poi/${selectedPlace.id}`}>查看图文详情 →</a>
              <button className="day-link secondary" onClick={() => chooseDay(selectedPlace.day)}>展开 D{selectedPlace.day} 安排</button>
            </div>
          </article>
        )}

        <button className="mobile-sheet-button" onClick={() => chooseMobileView("trip")}>
          <span>{activeDay ? `D${activeDay}` : `${tripStats.days}天`}</span><b>{activeDay ? days[activeDay - 1].title : "查看完整行程"}</b><em>查看安排</em>
        </button>
      </section>

      <nav className="mobile-bottom-nav" aria-label="手机主导航">
        <button className={mobileView === "map" ? "active" : ""} onClick={() => chooseMobileView("map")} aria-current={mobileView === "map" ? "page" : undefined}><i>⌖</i><span>地图</span></button>
        <button className={mobileView === "trip" ? "active" : ""} onClick={() => chooseMobileView("trip")} aria-current={mobileView === "trip" ? "page" : undefined}><i>≡</i><span>行程</span></button>
        <button className={mobileView === "roads" ? "active" : ""} onClick={() => chooseMobileView("roads")} aria-current={mobileView === "roads" ? "page" : undefined}><i>!</i><span>路况</span></button>
        <button className={mobileView === "checklist" ? "active" : ""} onClick={() => chooseMobileView("checklist")} aria-current={mobileView === "checklist" ? "page" : undefined}><i>✓</i><span>准备</span></button>
      </nav>
    </main>
  );
}
