import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FlightSearch from "../../components/flight-search";
import { getJourney, journeys } from "../../journeys/registry";

export function generateStaticParams() {
  return journeys.map((journey) => ({ journey: journey.slug }));
}

// 航班入口节点：线性行程用 flightPlaceId（行程起点），环线用起终点；都没有时退回第一个节点。
function flightPlace(journey: NonNullable<ReturnType<typeof getJourney>>) {
  const { places } = journey.trip;
  const id = journey.config.flightPlaceId ?? journey.config.terminalPlaceId;
  return places.find((place) => place.id === id) ?? places[0];
}

export async function generateMetadata({ params }:{ params:Promise<{journey:string}> }):Promise<Metadata> {
  const { journey: slug } = await params;
  const journey = getJourney(slug);
  if (!journey) return { title: "旅程不存在｜KE Journey" };
  const terminal = flightPlace(journey)?.name ?? journey.config.title;
  return {
    title: `航班查询｜${journey.title}`,
    description: `${terminal}起终点的实时航班查询：选择出发城市与日期，查看去程/回程航班与参考价格。`,
  };
}

export default async function Page({ params }:{ params:Promise<{journey:string}> }) {
  const { journey: slug } = await params;
  const journey = getJourney(slug);
  if (!journey) notFound();
  const terminal = flightPlace(journey);
  if (!terminal) notFound();
  return <FlightSearch tripBase={`/${slug}`} tripName={journey.title} terminalName={terminal.name} isLoop={Boolean(journey.config.terminalPlaceId)} />;
}
