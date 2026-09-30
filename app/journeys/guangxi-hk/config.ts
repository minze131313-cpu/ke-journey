import type { JourneyConfig } from "../types";

export const guangxiHkConfig: JourneyConfig = {
  kicker: "国庆广西 · 香港之旅及展会",
  title: "国庆广西 · 香港之旅",
  loopSummary: "北京出发 · 广西自驾 · 高铁进港 · 展会返深",
  directionLabel: "北京 → 南宁 → 罗城 → 柳州 → 阳朔 → 深圳 ⇄ 香港",
  exportTitle: "国庆广西·香港之旅 14 日行程单",
  exportFilename: "国庆广西香港之旅-14日行程.json",
  mapCenter: [111.5, 24.5],
  mapZoom: 6.2,
  // 线性行程没有闭环起终点，留空即不渲染「起/终」图钉，界面文案自动切换为「行程」。
  terminalPlaceId: "",
  // 航班入口挂在行程起点：北京首都机场 T2。
  flightPlaceId: "beijing",
  extendedStayDays: {
    "yongjiang-hotel": [1],
    "cunyu-hotel": [2, 3],
    "liuzhou-hotel": [4],
    "tangshe-hotel": [5, 6],
    "mongkok-hotel": [7],
    "hk-w-hotel": [8, 9],
    shenzhen: [9, 10, 11, 12, 13, 14],
    "asiaworld-expo": [10, 11],
    hkcec: [11, 12],
    "canton-fair": [13],
    guangzhou: [13],
  },
  roads: {
    kicker: "长途驾驶与跨境通行",
    lastCheck: "最后核对：出发前 48 小时",
    alert: {
      badge: "全程最长一天 · 约 550 km",
      title: "10/9 阳朔 → 深圳北站 → 香港",
      description: "当天 8:00 前必须从阳朔出发，约 6 小时赶到深圳北站，再换乘 14:55 的 G927 进港。任何一段延误都会连锁影响后面的高铁与入住。",
      detourLabel: "更稳妥的走法",
      detour: "阳朔 → G65包茂高速 → G55二广高速 → 广州北三环 → G4京港澳高速 → 深圳北站（每 2 小时进服务区，11:30 前过广州）",
      focusDay: 7,
    },
    notes: [
      { title: "深港每日往返", text: "展会期间住深圳、每天经福田口岸往返香港。早高峰 7:30—9:30 排队明显，亚博在机场旁，单程需预留 1.5 小时。" },
      { title: "广西山区乡道", text: "罗城小长安与怀群一带以县乡道为主，弯多路窄，会车要提前减速；不安排夜间山路。" },
      { title: "尚未确定的三件事", text: "返程日期（10/15 或 10/16）、深圳北站车辆如何处置、展会期间深圳住宿，目前都待定，出发前需逐项落实。" },
      { title: "动态核验", text: "内地路况可拨打 12328；香港口岸开放时间与港铁班次以官方当天公告为准。地图路线只用于规划，不替代临时管制。" },
    ],
  },
  checklist: {
    groups: [
      { title: "证件与预约", items: ["港澳通行证与签注在有效期内", "G927 车票 · 订单 E341010291", "阳朔糖舍确认号（最晚 10/1 发出）", "展会证件与入场二维码", "广交会进馆证（如确定前往）"] },
      { title: "车辆与长途", items: ["出发前全车检查：轮胎、刹车、机油", "备胎、千斤顶、充气泵", "手机支架与双口车充", "深圳北站停车场位置与缴费方式", "至少两名司机轮换"] },
      { title: "跨境与支付", items: ["八达通或手机跨境支付可用", "少量港币现金", "随身网络（漫游或 eSIM）", "充电宝必须随身，不可托运"] },
      { title: "住宿与票据", items: ["南宁、罗城、柳州、阳朔四段住宿凭证", "香港旺角与 W 酒店两晚订单", "深圳展会期间住宿（待订）", "各段发票抬头与开票要求"] },
    ],
    emergency: {
      label: "紧急情况",
      numbers: "内地 报警 110 · 急救 120 · 路况 12328 ｜ 香港 999",
      note: "跨境行程中证件丢失，先联系当地警方与出入境管理部门，再顺延调整后续安排。",
    },
  },
  closedRoads: [],
};
