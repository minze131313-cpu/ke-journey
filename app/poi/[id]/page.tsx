import { permanentRedirect } from "next/navigation";
import { getJourney } from "../../journeys/registry";

// 旧版 /poi/:id 链接（无旅程前缀）永久重定向到青甘大环线对应节点。

export function generateStaticParams() {
  return Object.keys(getJourney("qinggan-loop")!.poiDetails).map((id) => ({ id }));
}

export default async function Page({ params }:{ params:Promise<{id:string}> }) {
  const { id } = await params;
  permanentRedirect(`/qinggan-loop/poi/${id}`);
}
