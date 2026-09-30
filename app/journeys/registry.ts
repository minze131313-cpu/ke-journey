import type { Journey } from "./types";
import { days as qgDays, places as qgPlaces, routeRoads as qgRouteRoads, tripStats as qgTripStats } from "./qinggan-loop/trip-data";
import { poiDetails as qgPoiDetails, poiOrder as qgPoiOrder, routeDetails as qgRouteDetails } from "./qinggan-loop/detail-data";
import { qingganConfig } from "./qinggan-loop/config";
import { days as gxDays, places as gxPlaces, routeRoads as gxRouteRoads, tripStats as gxTripStats } from "./guangxi-hk/trip-data";
import { poiDetails as gxPoiDetails, poiOrder as gxPoiOrder, routeDetails as gxRouteDetails } from "./guangxi-hk/detail-data";
import { guangxiHkConfig } from "./guangxi-hk/config";

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
  {
    slug: "guangxi-hk",
    number: "02",
    eyebrow: "华南 · 广西 / 香港 · 已发布",
    title: "国庆广西 · 香港之旅",
    subtitle: "从罗城仫佬山乡、阳朔漓江到香港展会",
    description: "北京飞南宁、自驾穿越罗城与阳朔，再长途开进深圳、高铁进港参加电子展，最后把返程留给待定。",
    image: "/detail/yangshuo.jpg",
    days: "14 天",
    distance: "约 1,700 km",
    season: "10 月",
    difficulty: "进阶",
    trip: { places: gxPlaces, days: gxDays, routeRoads: gxRouteRoads, tripStats: gxTripStats },
    config: guangxiHkConfig,
    poiDetails: gxPoiDetails,
    routeDetails: gxRouteDetails,
    poiOrder: gxPoiOrder,
  },
];

export function getJourney(slug: string): Journey | undefined {
  return journeys.find((journey) => journey.slug === slug);
}
