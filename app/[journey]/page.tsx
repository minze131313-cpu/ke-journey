import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JourneyMap from "../components/journey-map";
import { getJourney, journeys } from "../journeys/registry";

export function generateStaticParams() {
  return journeys.map((journey) => ({ journey: journey.slug }));
}

export async function generateMetadata({ params }:{ params:Promise<{journey:string}> }):Promise<Metadata> {
  const { journey: slug } = await params;
  const journey = getJourney(slug);
  if (!journey) return { title: "旅程不存在｜KE Journey" };
  return {
    title: `${journey.title}｜${journey.trip.tripStats.days}日自驾地图`,
    description: `${journey.title}完整自驾路书、景点、住宿、补给和道路风险地图。`,
  };
}

export default async function Page({ params }:{ params:Promise<{journey:string}> }) {
  const { journey: slug } = await params;
  const journey = getJourney(slug);
  if (!journey) notFound();
  return <JourneyMap journey={journey} />;
}
