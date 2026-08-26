import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PoiDetailPage } from "../../../components/detail-pages";
import { getJourney, journeys } from "../../../journeys/registry";

export function generateStaticParams() {
  return journeys.flatMap((journey) => Object.keys(journey.poiDetails).map((id) => ({ journey: journey.slug, id })));
}

export async function generateMetadata({ params }:{ params:Promise<{journey:string;id:string}> }):Promise<Metadata> {
  const { journey: slug, id } = await params;
  const journey = getJourney(slug);
  const detail = journey?.poiDetails[id];
  if (!journey || !detail) return { title: "节点不存在｜KE Journey" };
  const title = `${detail.place.name}｜${detail.kindLabel}｜${journey.title}`;
  return {
    title,
    description: detail.lead,
    alternates: { canonical: `/${slug}/poi/${id}/` },
    openGraph: { title, description: detail.lead, url: `/${slug}/poi/${id}/`, images: [{ url: detail.hero.src, alt: detail.hero.alt }] },
    twitter: { card: "summary_large_image", title, description: detail.lead, images: [detail.hero.src] },
  };
}

export default async function Page({ params }:{ params:Promise<{journey:string;id:string}> }) {
  const { journey: slug, id } = await params;
  const journey = getJourney(slug);
  const detail = journey?.poiDetails[id];
  if (!journey || !detail) notFound();
  return <PoiDetailPage detail={detail} tripBase={`/${slug}`} tripName={journey.title} poiOrder={journey.poiOrder} places={journey.trip.places} />;
}
