import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PoiDetailPage } from "../../components/detail-pages";
import { poiDetails } from "../../detail-data";

export function generateStaticParams() {
  return Object.keys(poiDetails).map((id)=>({ id }));
}

export async function generateMetadata({ params }:{ params:Promise<{id:string}> }):Promise<Metadata> {
  const { id } = await params;
  const detail = poiDetails[id];
  if (!detail) return { title:"节点不存在｜青甘环线" };
  const title = `${detail.place.name}｜${detail.kindLabel}｜青甘环线`;
  return {
    title,
    description:detail.lead,
    alternates:{ canonical:`/qinggan-loop/poi/${id}/` },
    openGraph:{ title, description:detail.lead, url:`/qinggan-loop/poi/${id}/`, images:[{ url:detail.hero.src, alt:detail.hero.alt }] },
    twitter:{ card:"summary_large_image", title, description:detail.lead, images:[detail.hero.src] },
  };
}

export default async function Page({ params }:{ params:Promise<{id:string}> }) {
  const { id } = await params;
  const detail = poiDetails[id];
  if (!detail) notFound();
  return <PoiDetailPage detail={detail} />;
}
