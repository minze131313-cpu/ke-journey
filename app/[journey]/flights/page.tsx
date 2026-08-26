import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FlightSearch from "../../components/flight-search";
import { getJourney, journeys } from "../../journeys/registry";

export function generateStaticParams() {
  return journeys.map((journey) => ({ journey: journey.slug }));
}

export async function generateMetadata({ params }:{ params:Promise<{journey:string}> }):Promise<Metadata> {
  const { journey: slug } = await params;
  const journey = getJourney(slug);
  if (!journey) return { title: "旅程不存在｜KE Journey" };
  const terminal = journey.trip.places.find((place) => place.id === journey.config.terminalPlaceId)?.name ?? journey.config.title;
  return {
    title: `航班查询｜${journey.title}｜KE Journey`,
    description: `${terminal}起终点的实时航班查询：选择出发城市与日期，查看去程/回程航班与参考价格。`,
  };
}

export default async function Page({ params }:{ params:Promise<{journey:string}> }) {
  const { journey: slug } = await params;
  const journey = getJourney(slug);
  if (!journey) notFound();
  const terminal = journey.trip.places.find((place) => place.id === journey.config.terminalPlaceId);
  if (!terminal) notFound();
  return <FlightSearch tripBase={`/${slug}`} tripName={journey.title} terminalName={terminal.name} />;
}
