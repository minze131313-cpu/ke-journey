// 多旅程共享类型：每条旅程的 trip-data.ts / detail-data.ts / config.ts 都从这里取类型。

export type Category = "scenic" | "city" | "supply" | "warning";

export type Place = {
  id: string;
  name: string;
  day: number;
  coords: [number, number];
  category: Category;
  region: string;
  subtitle: string;
  altitude?: string;
  visit?: string;
  booking?: string;
  description: string;
  tips: string[];
  /** 酒店/民宿搜索使用的地点名；未设置时用 name。小城镇/景点可回退到可解析的上级地名。 */
  staySearch?: string;
  /** 酒店/民宿搜索的地点类型；未设置时按 category 推导（scenic→景点，其余→城市）。 */
  stayPlaceType?: "城市" | "景点";
};

export type TripDay = {
  day: number;
  title: string;
  start: string;
  end: string;
  km: string;
  drive: string;
  stay: string;
  color: string;
  summary: string;
  route: [number, number][];
  stops: string[];
  tasks: string[];
};

export type TripStats = { days: number; distance: string; sights: number; nights: number };

export type TripData = {
  places: Place[];
  days: TripDay[];
  routeRoads: Record<number, string>;
  tripStats: TripStats;
};

// 图文详情层

export type SourceLink = { name: string; publisher: string; url: string; note?: string };
export type Stat = { label: string; value: string };
export type StorySection = { title: string; text: string };
export type MediaAsset = {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  sourceUrl: string;
  framing?: "full" | "detail";
  contextLabel?: string;
};

export type PoiDetail = {
  place: Place;
  kindLabel: string;
  icon: string;
  hero: MediaAsset;
  gallery: MediaAsset[];
  lead: string;
  stats: Stat[];
  sections: StorySection[];
  highlights: string[];
  actions: string[];
  cautions: string[];
  sources: SourceLink[];
};

export type RouteDetail = {
  day: TripDay;
  hero: MediaAsset;
  gallery: MediaAsset[];
  roads: string;
  lead: string;
  stats: Stat[];
  sections: StorySection[];
  rhythm: { time: string; title: string; note: string }[];
  cautions: string[];
  sources: SourceLink[];
};

// 交互地图配置

export type ClosedRoad = { path: [number, number][]; color: string };
export type RoadAlert = {
  badge: string;
  title: string;
  description: string;
  detourLabel: string;
  detour: string;
  focusDay: number;
};
export type RoadNote = { title: string; text: string };
export type ChecklistGroup = { title: string; items: string[] };
export type EmergencyCard = { label: string; numbers: string; note: string };

export type JourneyConfig = {
  kicker: string;
  title: string;
  loopSummary: string;
  directionLabel: string;
  exportTitle: string;
  exportFilename: string;
  mapCenter: [number, number];
  mapZoom: number;
  terminalPlaceId: string;
  extendedStayDays: Record<string, number[]>;
  roads: { kicker: string; lastCheck: string; alert: RoadAlert; notes: RoadNote[] };
  checklist: { groups: ChecklistGroup[]; emergency: EmergencyCard };
  closedRoads: ClosedRoad[];
};

// 旅程注册表条目

export type Journey = {
  slug: string;
  number: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  days: string;
  distance: string;
  season: string;
  difficulty: string;
  trip: TripData;
  config: JourneyConfig;
  poiDetails: Record<string, PoiDetail>;
  routeDetails: Record<string, RouteDetail>;
  poiOrder: readonly string[];
};
