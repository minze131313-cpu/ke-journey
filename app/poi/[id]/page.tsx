import type { Metadata } from "next";
import LegacyRedirect from "../../components/legacy-redirect";
import { getJourney } from "../../journeys/registry";

// 旧版 /poi/:id 链接（无旅程前缀）永久迁移到青甘大环线对应节点。
// 静态托管环境无法做服务端 301，通过 canonical + 客户端跳转衔接。

export function generateStaticParams() {
  return Object.keys(getJourney("qinggan-loop")!.poiDetails).map((id) => ({ id }));
}

export async function generateMetadata({ params }:{ params:Promise<{id:string}> }):Promise<Metadata> {
  const { id } = await params;
  return {
    title: `节点已迁移｜KE Journey`,
    alternates: { canonical: `/qinggan-loop/poi/${id}/` },
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params }:{ params:Promise<{id:string}> }) {
  const { id } = await params;
  return <LegacyRedirect target={`/qinggan-loop/poi/${id}/`} />;
}
