import type { JourneyConfig } from "../types";

export const qingganConfig: JourneyConfig = {
  kicker: "国家精品自驾旅游公路",
  title: "青甘大环线",
  loopSummary: "顺时针 · 西宁取还车 · 2026路况版",
  directionLabel: "西宁出发 · 顺时针",
  exportTitle: "青甘大环线12日自驾路书",
  exportFilename: "青甘大环线-12日路书.json",
  mapCenter: [98.1, 37.75],
  mapZoom: 6.25,
  terminalPlaceId: "xining",
  extendedStayDays: {
    xining: [1, 12],
    dunhuang: [6, 7, 8],
    "daqaidam-stay": [4, 5],
  },
  roads: {
    kicker: "2026年核心施工绕行",
    lastCheck: "最后核对：出发前48小时",
    alert: {
      badge: "全封闭 · 不要按旧攻略行驶",
      title: "G227 扁都口—峨堡—门源",
      description: "传统张掖—西宁景观路线多段施工，部分计划持续至2027年。",
      detourLabel: "小型车辆正式绕行",
      detour: "张掖 → 肃南 → G213二尕公路 → 祁连 → S302 → 峨堡收费站 → G0611 → 西宁",
      focusDay: 11,
    },
    notes: [
      { title: "G315 柴达木段", text: "部分交叉口及路面存在半幅施工和临时限速；U形路段是正常国道，禁止在主车道停车。" },
      { title: "动态核验", text: "青海、甘肃均可拨打交通运输服务监督电话 12328。地图路线只用于规划，不替代临时管制。" },
    ],
  },
  checklist: {
    groups: [
      { title: "出发前", items: ["莫高窟实名预约已锁定", "租车允许跨青甘两省", "玻璃、轮胎与道路救援保险", "大柴旦、敦煌、祁连住宿"] },
      { title: "车辆与补给", items: ["备胎、千斤顶、充气泵", "每人4升应急饮水", "两顿车载干粮", "双手机与离线地图"] },
      { title: "不进入区域", items: ["火星一号公路与俄博梁无人区", "青海湖私设草场通道", "G227施工封闭区域"] },
    ],
    emergency: { label: "紧急情况", numbers: "道路 12328 · 报警 110 · 急救 120", note: "严重高反时停止上升，尽快前往医疗点或下降海拔。" },
  },
  closedRoads: [
    { path: [[100.95, 38.28], [100.90, 37.95], [101.18, 37.78], [101.66, 37.38], [101.69, 36.96]], color: "#c54b3f" },
  ],
};
