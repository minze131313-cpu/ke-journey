import type { Journey } from "./types";
import { days as qgDays, places as qgPlaces, routeRoads as qgRouteRoads, tripStats as qgTripStats } from "./qinggan-loop/trip-data";
import { poiDetails as qgPoiDetails, poiOrder as qgPoiOrder, routeDetails as qgRouteDetails } from "./qinggan-loop/detail-data";
import { qingganConfig } from "./qinggan-loop/config";

export const journeys: Journey[] = [
  {
    slug: "qinggan-loop",
    number: "01",
    eyebrow: "中国西北 · 已发布",
    title: "青甘大环线",
    subtitle: "从青海湖、柴达木到敦煌与祁连山",
    description: "一条把高原湖泊、荒漠雅丹、丝路文明和雪山草原串成闭环的自驾路书。",
    image: "/detail/qinghai.jpg",
    days: "12 天",
    distance: "约 3,000 km",
    season: "5–10 月",
    difficulty: "进阶",
    trip: { places: qgPlaces, days: qgDays, routeRoads: qgRouteRoads, tripStats: qgTripStats },
    config: qingganConfig,
    poiDetails: qgPoiDetails,
    routeDetails: qgRouteDetails,
    poiOrder: qgPoiOrder,
  },
];

export function getJourney(slug: string): Journey | undefined {
  return journeys.find((journey) => journey.slug === slug);
}
