// ============================================================
// 部署基路径工具
//
// 应用发布在原站点二级域名下的独立目录时（ke-journey.bordy.cn/travel-story/），
// 通过 NEXT_PUBLIC_BASE_PATH=/travel-story 注入（须与 next.config.ts 的
// basePath 一致）。客户端与 /api 直连的绝对路径必须经 api() 拼接，
// Next 的 <Link> / useRouter 会自动带 basePath，无需处理。
// ============================================================

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 把应用内绝对路径（/api/...、/trip/...）拼上部署基路径 */
export function api(path: string): string {
  return `${BASE_PATH}${path}`;
}
