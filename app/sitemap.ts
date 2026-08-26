import type { MetadataRoute } from "next";
import { journeys } from "./journeys/registry";

export const dynamic = "force-static";

const baseUrl = "https://ke-journey.bordy.cn";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    ...journeys.flatMap((journey) => [
      { path: `/${journey.slug}`, priority: 0.9 },
      { path: `/${journey.slug}/flights`, priority: 0.6 },
      { path: `/${journey.slug}/stay`, priority: 0.6 },
      ...Object.keys(journey.routeDetails).map((day) => ({ path: `/${journey.slug}/route/${day}`, priority: 0.7 })),
      ...Object.keys(journey.poiDetails).map((id) => ({ path: `/${journey.slug}/poi/${id}`, priority: 0.7 })),
    ]),
  ];
  return routes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority,
  }));
}
