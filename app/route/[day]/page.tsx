import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RouteDetailPage } from "../../components/detail-pages";
import { routeDetails } from "../../detail-data";

export function generateStaticParams() {
  return Object.keys(routeDetails).map((day)=>({ day }));
}

export async function generateMetadata({ params }:{ params:Promise<{day:string}> }):Promise<Metadata> {
  const { day } = await params;
  const detail = routeDetails[day];
  if (!detail) return { title:"线路不存在｜青甘环线" };
  const title = `D${day} ${detail.day.title}｜青甘环线线路详情`;
  return {
    title,
    description:detail.lead,
    alternates:{ canonical:`/qinggan-loop/route/${day}/` },
    openGraph:{ title, description:detail.lead, url:`/qinggan-loop/route/${day}/`, images:[{ url:detail.hero.src, alt:detail.hero.alt }] },
    twitter:{ card:"summary_large_image", title, description:detail.lead, images:[detail.hero.src] },
  };
}

export default async function Page({ params }:{ params:Promise<{day:string}> }) {
  const { day } = await params;
  const detail = routeDetails[day];
  if (!detail) notFound();
  return <RouteDetailPage detail={detail} />;
}
