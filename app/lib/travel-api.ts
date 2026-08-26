// 出行服务 API 客户端。
// 所有请求走同源 /api/ 反向代理（线上 nginx 转发并注入 X-Proxy-Token，本地 vite dev 代理），
// 浏览器不接触上游 token，也不存在跨域问题。

export type FlightDirection = "outbound" | "return";

export type FlightParams = {
  from: string;
  to: string;
  date: string;
};

export type FlightSummary = {
  flightNo?: string;
  airline?: string;
  airlineName?: string;
  departTime?: string;
  arriveTime?: string;
  departAirport?: string;
  arriveAirport?: string;
  departCity?: string;
  arriveCity?: string;
  stops?: number | string;
  stopCities?: string;
  price?: number;
  cabinLabel?: string;
  tag?: string;
};

export type HotelSummary = {
  hotelId: number;
  name: string;
  nameEn?: string | null;
  brand?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceInMeters?: number | null;
  starRating?: number | null;
  lowestPrice?: number | null;
  hasPrice?: boolean;
  priceMessage?: string | null;
  imageUrl?: string | null;
  bookingUrl?: string | null;
  description?: string | null;
  amenities?: string[] | null;
  tags?: string[] | null;
};

export type HotelSearchParams = {
  place: string;
  placeType: "城市" | "景点" | "机场" | "火车站" | "地铁站" | "酒店" | "区/县" | "详细地址";
  checkInDate: string;
  stayNights?: number;
  adultCount?: number;
  size?: number;
  distanceInMeter?: number;
  requiredTag?: string;
  maxPricePerNight?: number;
};

export class TravelApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

type HotelRaw = {
  hotelId: number;
  name?: string | null;
  nameEn?: string | null;
  brand?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceInMeters?: number | null;
  starRating?: number | null;
  price?: { hasPrice?: boolean; lowestPrice?: number | null; message?: string | null } | null;
  imageUrl?: string | null;
  bookingUrl?: string | null;
  description?: string | null;
  hotelAmenities?: string[] | null;
  tags?: string[] | null;
};

type ProxyResponse = {
  code?: number | string;
  error?: string;
  message?: string;
  data?: {
    code?: number | string;
    error?: string;
    message?: string;
    success?: boolean;
    suggestion?: string;
    flightList?: FlightSummary[];
    list?: FlightSummary[];
    hotelInformationList?: HotelRaw[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

async function callProxy(type: string, params: Record<string, unknown>): Promise<ProxyResponse["data"]> {
  let response: Response;
  try {
    response = await fetch("/api/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, params }),
    });
  } catch {
    throw new TravelApiError("NETWORK", "出行服务暂时无法连接，请稍后再试");
  }
  if (!response.ok) {
    throw new TravelApiError("HTTP_" + response.status, `服务返回异常（${response.status}）`);
  }
  const body = (await response.json()) as ProxyResponse;
  if (body && typeof body === "object" && body.code !== undefined && body.code !== 0) {
    throw new TravelApiError(String(body.code), body.error || "查询失败");
  }
  return body?.data ?? null;
}

// 航班查询走途牛桥接服务（VPS 常驻容器 + nginx /api/flight/ 转发；
// 本地开发由 vite 代理到 127.0.0.1:8787 的本地桥接）。
// 途牛上游返回结构：data[] { flightNumber, airlineCompany, departureTime, arrivalTime,
//   departureAirport, arrivalAirport, cabinClass, remainingSeats, type, basePrice, totalTax }
type TuniuFlightRaw = {
  flightNumber?: string;
  airlineCompany?: string;
  departureTime?: string;
  arrivalTime?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  cabinClass?: string;
  remainingSeats?: string;
  type?: string;
  basePrice?: string | number;
  totalTax?: string | number;
};

type FlightBridgeResponse = {
  success?: boolean;
  data?: TuniuFlightRaw[];
  error?: { code?: number | string; message?: string };
};

function clockOf(datetime?: string): string | undefined {
  if (!datetime) return undefined;
  const match = /(\d{2}:\d{2})$/.exec(datetime);
  return match ? match[1] : datetime;
}

export async function searchFlights(params: FlightParams): Promise<FlightSummary[]> {
  let response: Response;
  try {
    response = await fetch("/api/flight/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departureCityName: params.from, arrivalCityName: params.to, departureDate: params.date }),
    });
  } catch {
    throw new TravelApiError("NETWORK", "航班服务暂时无法连接，请稍后再试");
  }
  if (!response.ok) {
    throw new TravelApiError("HTTP_" + response.status, `航班服务返回异常（${response.status}）`);
  }
  const body = (await response.json()) as FlightBridgeResponse;
  if (body?.success !== true) {
    throw new TravelApiError(String(body?.error?.code ?? "UNKNOWN"), body?.error?.message ?? "航班查询失败");
  }
  return (body.data ?? []).map((raw) => ({
    flightNo: raw.flightNumber,
    airline: raw.airlineCompany,
    airlineName: raw.airlineCompany,
    departTime: clockOf(raw.departureTime),
    arriveTime: clockOf(raw.arrivalTime),
    departAirport: raw.departureAirport,
    arriveAirport: raw.arrivalAirport,
    departCity: params.from,
    arriveCity: params.to,
    stops: raw.type === "直飞" ? 0 : (raw.type ?? ""),
    stopCities: raw.type,
    price: Number(raw.basePrice ?? 0) + Number(raw.totalTax ?? 0),
    cabinLabel: raw.cabinClass,
    tag: raw.remainingSeats != null ? `余座 ${raw.remainingSeats}` : undefined,
  }));
}

export async function searchHotels(params: HotelSearchParams): Promise<HotelSummary[]> {
  const data = await callProxy("hotel_search", {
    place: params.place,
    placeType: params.placeType,
    checkInDate: params.checkInDate,
    stayNights: params.stayNights ?? 1,
    adultCount: params.adultCount ?? 2,
    size: params.size ?? 20,
    distanceInMeter: params.distanceInMeter,
    requiredTag: params.requiredTag,
    maxPricePerNight: params.maxPricePerNight,
  });
  const list = Array.isArray(data?.hotelInformationList) ? data.hotelInformationList : [];
  return list.map((raw: HotelRaw) => ({
    hotelId: raw.hotelId,
    name: raw.name ?? "",
    nameEn: raw.nameEn,
    brand: raw.brand,
    address: raw.address,
    latitude: raw.latitude,
    longitude: raw.longitude,
    distanceInMeters: raw.distanceInMeters,
    starRating: raw.starRating,
    lowestPrice: raw.price?.lowestPrice,
    hasPrice: raw.price?.hasPrice,
    priceMessage: raw.price?.message,
    imageUrl: raw.imageUrl,
    bookingUrl: raw.bookingUrl,
    description: raw.description,
    amenities: raw.hotelAmenities,
    tags: raw.tags,
  }));
}

/** 给预订链接重写日期参数（上游 bookingUrl 常带默认日期）。 */
export function rewriteBookingUrl(url: string | null | undefined, checkIn: string, checkOut: string): string | null {
  if (!url) return null;
  try {
    const target = new URL(url);
    target.searchParams.set("checkInDate", checkIn);
    target.searchParams.set("checkOutDate", checkOut);
    return target.toString();
  } catch {
    return url;
  }
}

/** 航班城市选择器用的常用出发城市（含三字码，供纯码输入兜底）。 */
export const flightCities: { name: string; code: string }[] = [
  { name: "北京", code: "BJS" }, { name: "上海", code: "SHA" }, { name: "广州", code: "CAN" },
  { name: "深圳", code: "SZX" }, { name: "成都", code: "CTU" }, { name: "重庆", code: "CKG" },
  { name: "杭州", code: "HGH" }, { name: "南京", code: "NKG" }, { name: "武汉", code: "WUH" },
  { name: "长沙", code: "CSX" }, { name: "西安", code: "SIA" }, { name: "厦门", code: "XMN" },
  { name: "青岛", code: "TAO" }, { name: "大连", code: "DLC" }, { name: "昆明", code: "KMG" },
  { name: "丽江", code: "LJG" }, { name: "桂林", code: "KWL" }, { name: "海口", code: "HAK" },
  { name: "三亚", code: "SYX" }, { name: "天津", code: "TSN" }, { name: "济南", code: "TNA" },
  { name: "沈阳", code: "SHE" }, { name: "哈尔滨", code: "HRB" }, { name: "长春", code: "CGQ" },
  { name: "郑州", code: "CGO" }, { name: "合肥", code: "HFE" }, { name: "福州", code: "FOC" },
  { name: "南昌", code: "KHN" }, { name: "太原", code: "TYN" }, { name: "石家庄", code: "SJW" },
  { name: "贵阳", code: "KWE" }, { name: "南宁", code: "NNG" }, { name: "兰州", code: "LHW" },
  { name: "银川", code: "INC" }, { name: "呼和浩特", code: "HET" }, { name: "乌鲁木齐", code: "URC" },
  { name: "拉萨", code: "LXA" }, { name: "西宁", code: "XNN" }, { name: "无锡", code: "WUX" },
  { name: "宁波", code: "NGB" }, { name: "温州", code: "WNZ" }, { name: "烟台", code: "YNT" },
  { name: "扬州", code: "YTY" }, { name: "大理", code: "DLU" }, { name: "西双版纳", code: "JHG" },
  { name: "张家界", code: "DYG" }, { name: "黄山", code: "TXN" }, { name: "洛阳", code: "LYA" },
  { name: "敦煌", code: "DNH" }, { name: "香港", code: "HKG" }, { name: "澳门", code: "MFM" },
  { name: "台北", code: "TPE" },
];

/** 常用出发城市（选择页置顶的快捷项）。 */
export const popularDepartureCities = ["北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "重庆", "兰州", "银川"];
