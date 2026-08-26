import type { Metadata } from "next";
import LegacyRedirect from "../../components/legacy-redirect";
import { getJourney } from "../../journeys/registry";

// 旧版 /route/:day 链接（无旅程前缀）永久迁移到青甘大环线对应线路。
// 静态托管环境无法做服务端 301，通过 canonical + 客户端跳转衔接。

export function generateStaticParams() {
  return Object.keys(getJourney("qinggan-loop")!.routeDetails).map((day) => ({ day }));
}

export async function generateMetadata({ params }:{ params:Promise<{day:string}> }):Promise<Metadata> {
  const { day } = await params;
  return {
    title: `线路已迁移｜KE Journey`,
    alternates: { canonical: `/qinggan-loop/route/${day}/` },
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params }:{ params:Promise<{day:string}> }) {
  const { day } = await params;
  return <LegacyRedirect target={`/qinggan-loop/route/${day}/`} />;
}
