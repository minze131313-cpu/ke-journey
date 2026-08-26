import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RouteDetailPage } from "../../../components/detail-pages";
import { getJourney, journeys } from "../../../journeys/registry";

export function generateStaticParams() {
  return journeys.flatMap((journey) => Object.keys(journey.routeDetails).map((day) => ({ journey: journey.slug, day })));
}

export async function generateMetadata({ params }:{ params:Promise<{journey:string;day:string}> }):Promise<Metadata> {
  const { journey: slug, day } = await params;
  const journey = getJourney(slug);
  const detail = journey?.routeDetails[day];
  if (!journey || !detail) return { title: "线路不存在｜KE Journey" };
  const title = `D${day} ${detail.day.title}｜${journey.title}线路详情`;
  return {
    title,
    description: detail.lead,
    alternates: { canonical: `/${slug}/route/${day}/` },
    openGraph: { title, description: detail.lead, url: `/${slug}/route/${day}/`, images: [{ url: detail.hero.src, alt: detail.hero.alt }] },
    twitter: { card: "summary_large_image", title, description: detail.lead, images: [detail.hero.src] },
  };
}

export default async function Page({ params }:{ params:Promise<{journey:string;day:string}> }) {
  const { journey: slug, day } = await params;
  const journey = getJourney(slug);
  const detail = journey?.routeDetails[day];
  if (!journey || !detail) notFound();
  return <RouteDetailPage detail={detail} tripBase={`/${slug}`} tripName={journey.title} places={journey.trip.places} days={journey.trip.days} />;
}
