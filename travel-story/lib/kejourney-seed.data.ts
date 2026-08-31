// ============================================================
// 本文件由 scripts/sync-travel-story-seed.mjs 自动生成，勿手改。
// 数据源：app/journeys/qinggan-loop/trip-data.ts（KE Journey 主站唯一数据源）。
// 修改主站行程后运行：npm run sync:travel-story
// ============================================================

import type { StopType } from "./types";

export interface KeJourneySeedStop {
  name: string;
  day: number;
  lat: number;
  lon: number;
  type: StopType;
  city?: string;
  country: string;
}

export const KEJOURNEY_SEED: {
  trip: {
    name: string;
    startDate: string;
    endDate: string;
    origin: string;
    region: string;
    description: string;
    isPublic: boolean;
  };
  days: number;
  stops: KeJourneySeedStop[];
} = {
  "trip": {
    "name": "青甘大环线 · 12日",
    "startDate": "2026-08-01",
    "endDate": "2026-08-12",
    "origin": "西宁取还车",
    "region": "中国 · 青海 / 甘肃",
    "description": "一条把高原湖泊、荒漠雅丹、丝路文明和雪山草原串成闭环的自驾路书。12 天约 3,000 公里，顺时针由西宁取还车；已按 2026 年 G227 封闭施工官方绕行方案（张掖→肃南→G213→祁连→S302→峨堡→G0611→西宁）更新。出发前请通过 12328 复核路况。",
    "isPublic": false
  },
  "days": 12,
  "stops": [
    {
      "name": "西宁",
      "day": 1,
      "lat": 36.6171,
      "lon": 101.7782,
      "type": "city",
      "city": "西宁",
      "country": "中国"
    },
    {
      "name": "日月山",
      "day": 2,
      "lat": 36.4467,
      "lon": 100.9822,
      "type": "scenic",
      "city": "湟源",
      "country": "中国"
    },
    {
      "name": "青海湖二郎剑",
      "day": 2,
      "lat": 36.5819,
      "lon": 100.4927,
      "type": "scenic",
      "city": "海南州",
      "country": "中国"
    },
    {
      "name": "茶卡盐湖",
      "day": 3,
      "lat": 36.6906,
      "lon": 99.0767,
      "type": "scenic",
      "city": "乌兰",
      "country": "中国"
    },
    {
      "name": "德令哈",
      "day": 3,
      "lat": 37.3746,
      "lon": 97.3701,
      "type": "city",
      "city": "海西州",
      "country": "中国"
    },
    {
      "name": "大柴旦翡翠湖",
      "day": 4,
      "lat": 37.8395,
      "lon": 95.2062,
      "type": "scenic",
      "city": "大柴旦",
      "country": "中国"
    },
    {
      "name": "大柴旦镇",
      "day": 4,
      "lat": 37.8527,
      "lon": 95.3565,
      "type": "other",
      "city": "海西州",
      "country": "中国"
    },
    {
      "name": "G315 U形路段",
      "day": 5,
      "lat": 37.5188,
      "lon": 94.1434,
      "type": "other",
      "country": "中国"
    },
    {
      "name": "乌素特水上雅丹",
      "day": 5,
      "lat": 37.2759,
      "lon": 93.0815,
      "type": "scenic",
      "city": "海西州",
      "country": "中国"
    },
    {
      "name": "阿克塞",
      "day": 6,
      "lat": 39.6337,
      "lon": 94.3407,
      "type": "other",
      "city": "酒泉",
      "country": "中国"
    },
    {
      "name": "敦煌",
      "day": 6,
      "lat": 40.1421,
      "lon": 94.6619,
      "type": "city",
      "city": "酒泉",
      "country": "中国"
    },
    {
      "name": "莫高窟",
      "day": 7,
      "lat": 40.0372,
      "lon": 94.8041,
      "type": "scenic",
      "city": "敦煌",
      "country": "中国"
    },
    {
      "name": "鸣沙山月牙泉",
      "day": 8,
      "lat": 40.0871,
      "lon": 94.6821,
      "type": "scenic",
      "city": "敦煌",
      "country": "中国"
    },
    {
      "name": "嘉峪关关城",
      "day": 9,
      "lat": 39.8014,
      "lon": 98.2172,
      "type": "scenic",
      "city": "嘉峪关",
      "country": "中国"
    },
    {
      "name": "张掖七彩丹霞",
      "day": 10,
      "lat": 38.9736,
      "lon": 100.0611,
      "type": "scenic",
      "city": "张掖",
      "country": "中国"
    },
    {
      "name": "张掖",
      "day": 10,
      "lat": 38.9259,
      "lon": 100.4498,
      "type": "city",
      "city": "张掖",
      "country": "中国"
    },
    {
      "name": "G227封闭施工段",
      "day": 11,
      "lat": 38.06,
      "lon": 101.171,
      "type": "other",
      "country": "中国"
    },
    {
      "name": "肃南",
      "day": 11,
      "lat": 38.837,
      "lon": 99.6156,
      "type": "other",
      "city": "张掖",
      "country": "中国"
    },
    {
      "name": "祁连县",
      "day": 11,
      "lat": 38.1771,
      "lon": 100.2531,
      "type": "city",
      "city": "海北州",
      "country": "中国"
    },
    {
      "name": "岗什卡雪峰",
      "day": 12,
      "lat": 37.4149,
      "lon": 101.6913,
      "type": "scenic",
      "city": "门源",
      "country": "中国"
    },
    {
      "name": "西宁",
      "day": 12,
      "lat": 36.6171,
      "lon": 101.7782,
      "type": "city",
      "city": "西宁",
      "country": "中国"
    }
  ]
};
