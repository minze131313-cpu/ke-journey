import { permanentRedirect } from "next/navigation";
import { getJourney } from "../../journeys/registry";

// 旧版 /route/:day 链接（无旅程前缀）永久重定向到青甘大环线对应线路。

export function generateStaticParams() {
  return Object.keys(getJourney("qinggan-loop")!.routeDetails).map((day) => ({ day }));
}

export default async function Page({ params }:{ params:Promise<{day:string}> }) {
  const { day } = await params;
  permanentRedirect(`/qinggan-loop/route/${day}`);
}
