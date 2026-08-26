import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StaySearch from "../../components/stay-search";
import { getJourney, journeys } from "../../journeys/registry";

export function generateStaticParams() {
  return journeys.map((journey) => ({ journey: journey.slug }));
}

export async function generateMetadata({ params }:{ params:Promise<{journey:string}> }):Promise<Metadata> {
  const { journey: slug } = await params;
  const journey = getJourney(slug);
  if (!journey) return { title: "旅程不存在｜KE Journey" };
  return {
    title: `住宿查询｜${journey.title}`,
    description: "沿环线各停留点的实时酒店与民宿查询：实时房价、房态、设施与预订入口。",
  };
}

export default async function Page({ params }:{ params:Promise<{journey:string}> }) {
  const { journey: slug } = await params;
  const journey = getJourney(slug);
  if (!journey) notFound();
  // 具体停留点与酒店/民宿类型由客户端按 URL 查询参数解析（静态导出环境无服务端 searchParams）
  return <StaySearch tripBase={`/${slug}`} places={journey.trip.places} />;
}
