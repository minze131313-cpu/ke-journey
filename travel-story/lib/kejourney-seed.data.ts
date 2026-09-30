// ============================================================
// 本文件由 scripts/sync-travel-story-seed.mjs 自动生成，勿手改。
// 数据源：app/journeys/<slug>/trip-data.ts（KE Journey 主站唯一数据源）。
// 修改主站行程或新增旅程后运行：npm run sync:travel-story
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

export interface KeJourneySeed {
  /** 主站旅程 slug，用于回链与去重 */
  slug: string;
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
}

export const KEJOURNEY_SEEDS: KeJourneySeed[] = [
  {
    "slug": "qinggan-loop",
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
  },
  {
    "slug": "guangxi-hk",
    "trip": {
      "name": "国庆广西 · 香港之旅 · 14日",
      "startDate": "2026-10-03",
      "endDate": "2026-10-16",
      "origin": "北京出发 · 南宁取车 · 高铁进港",
      "region": "中国 · 广西 / 广东 / 香港",
      "description": "从北京飞南宁，自驾穿罗城仫佬山乡、柳州与阳朔，再长途开进深圳，转高铁进香港，随后以深圳为基地每天往返参加环球资源消费电子展与香港秋季电子产品展。返程日期、深圳北站车辆处置与展会期间深圳住宿仍待定。",
      "isPublic": false
    },
    "days": 14,
    "stops": [
      {
        "name": "北京首都机场 T2",
        "day": 1,
        "lat": 40.079904,
        "lon": 116.594548,
        "type": "city",
        "city": "顺义",
        "country": "中国"
      },
      {
        "name": "南宁吴圩国际机场",
        "day": 1,
        "lat": 22.601718,
        "lon": 108.187631,
        "type": "other",
        "city": "南宁",
        "country": "中国"
      },
      {
        "name": "南宁 · 朝阳广场",
        "day": 1,
        "lat": 22.819149,
        "lon": 108.321142,
        "type": "city",
        "city": "南宁",
        "country": "中国"
      },
      {
        "name": "南宁邕江宾馆（朝阳广场店）",
        "day": 1,
        "lat": 22.811261,
        "lon": 108.321481,
        "type": "city",
        "city": "南宁",
        "country": "中国"
      },
      {
        "name": "南宁邕江宾馆（朝阳广场店）",
        "day": 2,
        "lat": 22.811261,
        "lon": 108.321481,
        "type": "city",
        "city": "南宁",
        "country": "中国"
      },
      {
        "name": "罗城 · 小长安镇",
        "day": 2,
        "lat": 24.882474,
        "lon": 109.048244,
        "type": "city",
        "city": "河池",
        "country": "中国"
      },
      {
        "name": "村语村宿三尖堂",
        "day": 2,
        "lat": 24.88657,
        "lon": 109.029734,
        "type": "city",
        "city": "河池",
        "country": "中国"
      },
      {
        "name": "武阳江",
        "day": 3,
        "lat": 24.883746,
        "lon": 109.055877,
        "type": "scenic",
        "city": "河池",
        "country": "中国"
      },
      {
        "name": "罗城天门山",
        "day": 3,
        "lat": 24.836895,
        "lon": 108.540661,
        "type": "scenic",
        "city": "河池",
        "country": "中国"
      },
      {
        "name": "村语村宿三尖堂",
        "day": 3,
        "lat": 24.88657,
        "lon": 109.029734,
        "type": "city",
        "city": "河池",
        "country": "中国"
      },
      {
        "name": "村语村宿三尖堂",
        "day": 4,
        "lat": 24.88657,
        "lon": 109.029734,
        "type": "city",
        "city": "河池",
        "country": "中国"
      },
      {
        "name": "柳州",
        "day": 4,
        "lat": 24.326458,
        "lon": 109.428065,
        "type": "city",
        "city": "柳州",
        "country": "中国"
      },
      {
        "name": "柳州富力万达嘉华酒店",
        "day": 4,
        "lat": 24.328101,
        "lon": 109.440857,
        "type": "city",
        "city": "柳州",
        "country": "中国"
      },
      {
        "name": "马鞍山公园",
        "day": 4,
        "lat": 24.302344,
        "lon": 109.414559,
        "type": "scenic",
        "city": "柳州",
        "country": "中国"
      },
      {
        "name": "柳州工业博物馆",
        "day": 4,
        "lat": 24.320583,
        "lon": 109.429361,
        "type": "scenic",
        "city": "柳州",
        "country": "中国"
      },
      {
        "name": "柳州富力万达嘉华酒店",
        "day": 5,
        "lat": 24.328101,
        "lon": 109.440857,
        "type": "city",
        "city": "柳州",
        "country": "中国"
      },
      {
        "name": "阳朔县城",
        "day": 5,
        "lat": 24.777511,
        "lon": 110.49592,
        "type": "city",
        "city": "桂林",
        "country": "中国"
      },
      {
        "name": "阳朔糖舍酒店",
        "day": 5,
        "lat": 24.781556,
        "lon": 110.51797,
        "type": "city",
        "city": "桂林",
        "country": "中国"
      },
      {
        "name": "阳朔西街",
        "day": 5,
        "lat": 24.77582,
        "lon": 110.495811,
        "type": "scenic",
        "city": "桂林",
        "country": "中国"
      },
      {
        "name": "遇龙河",
        "day": 6,
        "lat": 24.77753,
        "lon": 110.433115,
        "type": "scenic",
        "city": "桂林",
        "country": "中国"
      },
      {
        "name": "兴坪古镇",
        "day": 6,
        "lat": 24.916611,
        "lon": 110.530606,
        "type": "scenic",
        "city": "桂林",
        "country": "中国"
      },
      {
        "name": "阳朔糖舍酒店",
        "day": 6,
        "lat": 24.781556,
        "lon": 110.51797,
        "type": "city",
        "city": "桂林",
        "country": "中国"
      },
      {
        "name": "阳朔糖舍酒店",
        "day": 7,
        "lat": 24.781556,
        "lon": 110.51797,
        "type": "city",
        "city": "桂林",
        "country": "中国"
      },
      {
        "name": "深圳北站",
        "day": 7,
        "lat": 22.609878,
        "lon": 114.029506,
        "type": "other",
        "city": "深圳",
        "country": "中国"
      },
      {
        "name": "香港西九龙站",
        "day": 7,
        "lat": 22.301135,
        "lon": 114.170406,
        "type": "other",
        "city": "油尖旺",
        "country": "中国"
      },
      {
        "name": "香港旺角希尔顿花园酒店",
        "day": 7,
        "lat": 22.312985,
        "lon": 114.17197,
        "type": "city",
        "city": "旺角",
        "country": "中国"
      },
      {
        "name": "旺角",
        "day": 7,
        "lat": 22.316633,
        "lon": 114.17432,
        "type": "city",
        "city": "油尖旺",
        "country": "中国"
      },
      {
        "name": "香港旺角希尔顿花园酒店",
        "day": 8,
        "lat": 22.312985,
        "lon": 114.17197,
        "type": "city",
        "city": "旺角",
        "country": "中国"
      },
      {
        "name": "香港W酒店",
        "day": 8,
        "lat": 22.302492,
        "lon": 114.165766,
        "type": "city",
        "city": "西九龙",
        "country": "中国"
      },
      {
        "name": "维多利亚港",
        "day": 8,
        "lat": 22.290393,
        "lon": 114.176217,
        "type": "scenic",
        "city": "维港",
        "country": "中国"
      },
      {
        "name": "尖沙咀星光大道",
        "day": 8,
        "lat": 22.290228,
        "lon": 114.178304,
        "type": "scenic",
        "city": "尖沙咀",
        "country": "中国"
      },
      {
        "name": "太平山顶",
        "day": 8,
        "lat": 22.268594,
        "lon": 114.154783,
        "type": "scenic",
        "city": "中西区",
        "country": "中国"
      },
      {
        "name": "香港W酒店",
        "day": 9,
        "lat": 22.302492,
        "lon": 114.165766,
        "type": "city",
        "city": "西九龙",
        "country": "中国"
      },
      {
        "name": "福田口岸",
        "day": 9,
        "lat": 22.515176,
        "lon": 114.067731,
        "type": "other",
        "city": "深圳",
        "country": "中国"
      },
      {
        "name": "深圳（展会住宿基地）",
        "day": 9,
        "lat": 22.541834,
        "lon": 114.06097,
        "type": "city",
        "city": "深圳",
        "country": "中国"
      },
      {
        "name": "深圳（展会住宿基地）",
        "day": 10,
        "lat": 22.541834,
        "lon": 114.06097,
        "type": "city",
        "city": "深圳",
        "country": "中国"
      },
      {
        "name": "福田口岸",
        "day": 10,
        "lat": 22.515176,
        "lon": 114.067731,
        "type": "other",
        "city": "深圳",
        "country": "中国"
      },
      {
        "name": "亚洲国际博览馆",
        "day": 10,
        "lat": 22.318331,
        "lon": 113.948141,
        "type": "other",
        "city": "赤鱲角",
        "country": "中国"
      },
      {
        "name": "亚洲国际博览馆",
        "day": 11,
        "lat": 22.318331,
        "lon": 113.948141,
        "type": "other",
        "city": "赤鱲角",
        "country": "中国"
      },
      {
        "name": "香港会议展览中心",
        "day": 11,
        "lat": 22.279829,
        "lon": 114.178032,
        "type": "other",
        "city": "湾仔",
        "country": "中国"
      },
      {
        "name": "深圳（展会住宿基地）",
        "day": 12,
        "lat": 22.541834,
        "lon": 114.06097,
        "type": "city",
        "city": "深圳",
        "country": "中国"
      },
      {
        "name": "福田口岸",
        "day": 12,
        "lat": 22.515176,
        "lon": 114.067731,
        "type": "other",
        "city": "深圳",
        "country": "中国"
      },
      {
        "name": "香港会议展览中心",
        "day": 12,
        "lat": 22.279829,
        "lon": 114.178032,
        "type": "other",
        "city": "湾仔",
        "country": "中国"
      },
      {
        "name": "深圳（展会住宿基地）",
        "day": 13,
        "lat": 22.541834,
        "lon": 114.06097,
        "type": "city",
        "city": "深圳",
        "country": "中国"
      },
      {
        "name": "广交会展馆",
        "day": 13,
        "lat": 23.100952,
        "lon": 113.360903,
        "type": "other",
        "city": "广州",
        "country": "中国"
      },
      {
        "name": "广州塔",
        "day": 13,
        "lat": 23.106428,
        "lon": 113.324521,
        "type": "scenic",
        "city": "广州",
        "country": "中国"
      },
      {
        "name": "深圳（展会住宿基地）",
        "day": 14,
        "lat": 22.541834,
        "lon": 114.06097,
        "type": "city",
        "city": "深圳",
        "country": "中国"
      }
    ]
  }
];
