export type Category = "scenic" | "city" | "supply" | "warning";

export type Place = {
  id: string;
  name: string;
  day: number;
  coords: [number, number];
  category: Category;
  region: string;
  subtitle: string;
  altitude?: string;
  visit?: string;
  booking?: string;
  description: string;
  tips: string[];
};

export type TripDay = {
  day: number;
  title: string;
  start: string;
  end: string;
  km: string;
  drive: string;
  stay: string;
  color: string;
  summary: string;
  route: [number, number][];
  stops: string[];
  tasks: string[];
};

export const routeRoads: Record<number, string> = {
  1: "西宁市区道路",
  2: "G6京藏高速 → G109京拉线 → 倒湖茶公路 → G6京藏高速",
  3: "G6京藏高速 / G315西吐线",
  4: "G0612西和高速 → G315西吐线 → S314",
  5: "S314 → G3011柳格高速 → G315西吐线（原路返回）",
  6: "S314 → G3011柳格高速 → G215马宁线",
  7: "敦煌市区道路 → S240莫高窟连接线",
  8: "敦煌市区道路 → 鸣山路",
  9: "G3011柳格高速 → G30连霍高速",
  10: "G30连霍高速 → 丹霞景区连接路",
  11: "张肃公路 → 肃南 → G213二尕公路",
  12: "S302 → 峨堡收费站 → G0611张汶高速",
};

export const places: Place[] = [
  { id:"xining", name:"西宁", day:1, coords:[101.7782,36.6171], category:"city", region:"青海 · 西宁", subtitle:"环线起终点与高原适应日", altitude:"约2,260m", visit:"半天—1天", description:"抵达后取车、采购、检查车辆，在较低强度下适应高原环境。", tips:["首日避免饮酒和剧烈运动","完成跨省租车与道路救援确认","下载青海、甘肃离线地图"] },
  { id:"riyue", name:"日月山", day:2, coords:[100.9822,36.4467], category:"scenic", region:"青海 · 湟源", subtitle:"进入青藏高原的第一道门户", altitude:"约3,520m", visit:"1小时", description:"唐蕃古道的重要垭口，也是环线首次明显升高海拔的位置。", tips:["停留以短时观景为主","大风时注意保暖","不要在公路弯道临停"] },
  { id:"qinghai", name:"青海湖二郎剑", day:2, coords:[100.4927,36.5819], category:"scenic", region:"青海 · 海南州", subtitle:"高原湖泊与草原景观核心", altitude:"约3,200m", visit:"2—3小时", booking:"走正规景区通道", description:"从官方开放区域亲近青海湖，避免翻越围栏进入保护区或私人草场。", tips:["旺季提前购票","只在正规停车区停车","湖边紫外线和风力都很强"] },
  { id:"chaka", name:"茶卡盐湖", day:3, coords:[99.0767,36.6906], category:"scenic", region:"青海 · 乌兰", subtitle:"天空之镜与盐湖铁路", altitude:"约3,059m", visit:"3小时", booking:"建议提前购票", description:"上午光线柔和、风相对较小；天气和风速决定倒影效果。", tips:["准备鞋套或可清洗鞋","阴雨天气减少盐湖停留","前一晚住茶卡镇便于早入园"] },
  { id:"delingha", name:"德令哈", day:3, coords:[97.3701,37.3746], category:"city", region:"青海 · 海西州", subtitle:"柴达木盆地东部补给中心", altitude:"约2,980m", visit:"住宿补给", description:"进入大柴旦前最稳定的住宿、医疗和车辆补给节点。", tips:["在市区加满油","补充饮水和两顿应急食品","关注次日G315施工信息"] },
  { id:"emerald", name:"大柴旦翡翠湖", day:4, coords:[95.2062,37.8395], category:"scenic", region:"青海 · 大柴旦", subtitle:"多色盐池与雪山倒影", altitude:"约3,140m", visit:"2—3小时", booking:"旺季建议预约", description:"不同矿物浓度形成蓝绿相间的盐池，傍晚侧光更有层次。", tips:["景区内按指定线路活动","无人机须遵守现场规定","盐壳薄弱处不可进入"] },
  { id:"daqaidam", name:"大柴旦镇", day:4, coords:[95.3565,37.8527], category:"supply", region:"青海 · 海西州", subtitle:"进入G315前的关键基地", altitude:"约3,170m", visit:"住宿补给", description:"水上雅丹往返与敦煌方向的核心住宿点，旺季房源紧张。", tips:["到达即补满油","检查胎压和备胎","次日天亮出发避免夜驾"] },
  { id:"u-road", name:"G315 U形路段", day:5, coords:[94.1434,37.5188], category:"warning", region:"青海 · G315", subtitle:"景观公路，也是正常运营国道", visit:"沿途观看", description:"坡顶视角极具冲击力，但车流与大型货车速度快，主车道禁止停车拍照。", tips:["只在合法停车区拍照","绝不站上机动车道","超车前确认长距离对向来车"] },
  { id:"yadan", name:"乌素特水上雅丹", day:5, coords:[93.0815,37.2759], category:"scenic", region:"青海 · 海西州", subtitle:"湖泊中的雅丹地貌群", altitude:"约2,680m", visit:"3小时", booking:"旺季提前购票", description:"本方案走G315铺装路往返大柴旦，不进入火星一号公路和俄博梁无人区。", tips:["单司机建议增加一晚","回程前确认剩余油量","不要驶入无管理土路"] },
  { id:"aksai", name:"阿克塞", day:6, coords:[94.3407,39.6337], category:"supply", region:"甘肃 · 酒泉", subtitle:"当金山北侧休息与补给点", visit:"短暂停留", description:"从柴达木翻越当金山进入甘肃后的第一个稳定补给节点。", tips:["检查刹车与轮胎温度","横风明显时降低车速","不把废弃景点当越野场地"] },
  { id:"dunhuang", name:"敦煌", day:6, coords:[94.6619,40.1421], category:"city", region:"甘肃 · 酒泉", subtitle:"环线人文核心与两晚基地", altitude:"约1,140m", visit:"2—3天", description:"莫高窟、鸣沙山月牙泉和敦煌博物馆集中于此，安排机动日应对天气变化。", tips:["住宿优先选择市区停车便利区域","莫高窟日期决定整条环线","夏季将户外游览放在早晚"] },
  { id:"mogao", name:"莫高窟", day:7, coords:[94.8041,40.0372], category:"scenic", region:"甘肃 · 敦煌", subtitle:"世界文化遗产与实名预约景区", visit:"约4小时", booking:"必须通过官方渠道实名预约", description:"常规票包含数字电影与实体洞窟，旺季名额有限，是整趟行程的首要预约项。", tips:["提前30分钟到数字展示中心","仅使用莫高窟参观预约网渠道","窟内禁止摄影"] },
  { id:"mingsha", name:"鸣沙山月牙泉", day:8, coords:[94.6821,40.0871], category:"scenic", region:"甘肃 · 敦煌", subtitle:"沙漠日落与夜游体验", visit:"3—4小时", booking:"旺季建议提前购票", description:"夏季建议傍晚进入，避开正午高温，同时保留白天作为莫高窟天气缓冲。", tips:["防沙鞋套视需要准备","相机做好防沙保护","日落后按现场交通组织离场"] },
  { id:"jiayuguan", name:"嘉峪关关城", day:9, coords:[98.2172,39.8014], category:"scenic", region:"甘肃 · 嘉峪关", subtitle:"河西走廊长城文化地标", altitude:"约1,600m", visit:"3小时", booking:"可提前购票", description:"从敦煌经瓜州、玉门沿G30抵达，适合下午游览后住嘉峪关或酒泉。", tips:["G30大型货车多","瓜州服务区安排休息","关城风大注意帽子和随身物品"] },
  { id:"danxia", name:"张掖七彩丹霞", day:10, coords:[100.0611,38.9736], category:"scenic", region:"甘肃 · 张掖", subtitle:"彩色丘陵与日落观景", visit:"3—4小时", booking:"旺季建议预约", description:"下午入园更适合观察色彩变化，雨后或侧光条件下层次更突出。", tips:["确认入园口与接驳路线","不要离开栈道进入地貌区","可住丹霞镇减少往返"] },
  { id:"zhangye", name:"张掖", day:10, coords:[100.4498,38.9259], category:"city", region:"甘肃 · 张掖", subtitle:"进入祁连绕行线前的补给城市", visit:"住宿补给", description:"从这里开始不再走传统G227扁都口路线，而按官方方案经肃南、祁连绕行。", tips:["补满油并核对G213路况","预留山区天气机动时间","不要接受导航引导进入封闭G227"] },
  { id:"g227", name:"G227封闭施工段", day:11, coords:[101.171,38.060], category:"warning", region:"青海 · G227", subtitle:"传统张掖—峨堡—门源通道失效", visit:"禁止驶入", description:"峨堡高速口—景阳岭及其后多段全封闭施工，官方计划截至2027年7月31日。小型车按政务通告经肃南—G213—祁连—S302—峨堡收费站—G0611绕行。", tips:["出发前48小时及当天复核12328","服从现场交通标识","地图上的风险点是走廊提示，并非封闭段精确边界"] },
  { id:"sunan", name:"肃南", day:11, coords:[99.6156,38.837], category:"supply", region:"甘肃 · 张掖", subtitle:"G213二尕公路南下节点", visit:"午餐补给", description:"正式绕行路线的重要县城，也是进入祁连山区前的补给点。", tips:["午餐后检查油量","山区不安排夜驾","注意牲畜和落石提示"] },
  { id:"qilian", name:"祁连县", day:11, coords:[100.2531,38.1771], category:"city", region:"青海 · 海北州", subtitle:"祁连草原与9号公路基地", altitude:"约2,800m", visit:"住宿", description:"经G213抵达后住宿，次日走S302至峨堡，再上G0611返回西宁。", tips:["夜间温度明显下降","高峰期提前订房","次日确认岗什卡通道是否开放"] },
  { id:"chaka-stay", name:"茶卡镇住宿区", day:2, coords:[99.0878,36.6842], category:"city", region:"青海 · 茶卡镇", subtitle:"D2住宿 · 盐湖东侧镇区", altitude:"约3,050m", visit:"住宿1晚", booking:"旺季提前7—14天预订", description:"选择镇中心或茶卡盐湖入口东侧、带独立停车场和供暖的住宿，方便次日早入盐湖。", tips:["确认热水和供暖条件","优先选择可免费取消房型","晚间减少剧烈活动"] },
  { id:"daqaidam-stay", name:"大柴旦住宿区", day:4, coords:[95.3678,37.8511], category:"city", region:"青海 · 大柴旦镇", subtitle:"D4—D5住宿 · 连住2晚", altitude:"约3,170m", visit:"连续住宿2晚", booking:"环线最紧张住宿点之一", description:"建议连订两晚并选择镇中心、有院内停车和制氧设备的酒店，避免水上雅丹长途日后再换房。", tips:["确认可晚到和停车位","两晚不要拆成不同酒店","入住当日检查房间供暖"] },
  { id:"jiayuguan-stay", name:"嘉峪关住宿区", day:9, coords:[98.2869,39.7737], category:"city", region:"甘肃 · 嘉峪关市", subtitle:"D9首选住宿 · 距关城较近", altitude:"约1,600m", visit:"住宿1晚", booking:"与酒泉二选一", description:"若当天重点游览嘉峪关关城，优先住嘉峪关市区，第二天直接向张掖方向上G30。", tips:["选择靠近主干道且有停车场的酒店","晚餐和补给便利","次日无需折返酒泉"] },
  { id:"jiuquan-stay", name:"酒泉住宿区", day:9, coords:[98.4945,39.7328], category:"city", region:"甘肃 · 酒泉市", subtitle:"D9备选住宿 · 城市配套更完整", altitude:"约1,480m", visit:"住宿1晚", booking:"与嘉峪关二选一", description:"若更看重餐饮、车辆服务和房源选择，可多行驶约半小时住酒泉市区。", tips:["适合需要车辆保养或采购时选择","避免住进无停车条件的老城小巷","次日沿G30前往张掖"] },
  { id:"danxia-stay", name:"七彩丹霞镇住宿区", day:10, coords:[100.0669,38.9788], category:"city", region:"甘肃 · 临泽", subtitle:"D10备选住宿 · 方便看日落", visit:"住宿1晚", booking:"与张掖市区二选一", description:"计划看丹霞日落时可住景区入口附近，减少夜间返回张掖市区的驾驶。", tips:["确认实际入园口和酒店位置","餐饮选择少于张掖市区","次日需经张掖方向进入肃南路线"] },
  { id:"gangshika", name:"岗什卡雪峰", day:12, coords:[101.6913,37.4149], category:"scenic", region:"青海 · 门源", subtitle:"仅在开放与天气允许时远眺", altitude:"主峰5,254m", visit:"机动停留", description:"受G227施工影响，不把进入雪峰景区作为刚性任务；可在开放连接路或合法观景点远眺。", tips:["不闯施工封闭区","不进行无向导登山活动","遇雨雪立即放弃支线"] },
];

export const days: TripDay[] = [
  { day:1,title:"抵达西宁 · 适应高原",start:"西宁",end:"西宁",km:"0–40 km",drive:"市内",stay:"西宁",color:"#315f59",summary:"取车、采购、确认两省通行和车辆救援，不安排高强度景点。",route:[[101.7782,36.6171]],stops:["xining"],tasks:["检查备胎与救援工具","下载两省离线地图","早点休息，避免饮酒"] },
  { day:2,title:"日月山 · 青海湖",start:"西宁",end:"茶卡",km:"约300 km",drive:"5–6小时",stay:"茶卡镇",color:"#2b8c82",summary:"从高原门户进入青海湖，傍晚抵达茶卡，避免住在海拔更高且房源少的湖边。",route:[[101.7782,36.6171],[100.9822,36.4467],[100.4927,36.5819],[99.0771,36.6908]],stops:["riyue","qinghai"],tasks:["只从正规入口进入青海湖","午后风大时缩短湖边停留","到茶卡后补满油"] },
  { day:3,title:"茶卡盐湖 · 德令哈",start:"茶卡",end:"德令哈",km:"约210 km",drive:"3小时",stay:"德令哈",color:"#48a8a2",summary:"上午进入盐湖，下午轻松前往德令哈，作为进入柴达木前的缓冲日。",route:[[99.0771,36.6908],[97.3701,37.3746]],stops:["chaka","delingha"],tasks:["早入园减少人流","德令哈完成两天物资补给","复核G315最新路况"] },
  { day:4,title:"柴达木 · 翡翠湖",start:"德令哈",end:"大柴旦",km:"约220 km",drive:"3小时",stay:"大柴旦",color:"#4f9d72",summary:"中午前抵达大柴旦，下午游览翡翠湖并为长距离雅丹日做准备。",route:[[97.3701,37.3746],[95.2062,37.8395],[95.3565,37.8527]],stops:["emerald","daqaidam"],tasks:["到镇后先办理入住","加满油并检查胎压","准备第二天车内午餐"] },
  { day:5,title:"G315 · 水上雅丹往返",start:"大柴旦",end:"大柴旦",km:"450–500 km",drive:"7–8小时",stay:"大柴旦",color:"#c79331",summary:"全程最长的一天，两名司机轮换；只走铺装主路，不进入火星一号公路。",route:[[95.3565,37.8527],[94.1434,37.5188],[93.0815,37.2759]],stops:["u-road","yadan"],tasks:["天亮出发，日落前回镇","主车道绝不停车拍照","单司机建议拆成两天"] },
  { day:6,title:"翻越当金山 · 抵达敦煌",start:"大柴旦",end:"敦煌",km:"约360 km",drive:"5小时",stay:"敦煌",color:"#b77736",summary:"经G3011/G215走铺装主路进入甘肃，在阿克塞短休后抵达敦煌。",route:[[95.3565,37.8527],[94.3407,39.6337],[94.6619,40.1421]],stops:["aksai","dunhuang"],tasks:["当金山长下坡控制车速","阿克塞休息并检查车辆","抵敦煌后确认莫高窟预约"] },
  { day:7,title:"莫高窟 · 丝路文明",start:"敦煌",end:"敦煌",km:"约50 km",drive:"市郊往返",stay:"敦煌",color:"#9c6847",summary:"以实名预约时段为中心安排整天，不叠加远距离景点。",route:[[94.6619,40.1421],[94.8041,40.0372]],stops:["mogao"],tasks:["提前30分钟抵达数字中心","携带预约证件原件","下午安排博物馆或休息"] },
  { day:8,title:"敦煌机动日 · 鸣沙山",start:"敦煌",end:"敦煌",km:"约40 km",drive:"市内",stay:"敦煌",color:"#d69234",summary:"白天作为天气和体力缓冲，傍晚进入鸣沙山月牙泉。",route:[[94.6619,40.1421],[94.6821,40.0871]],stops:["mingsha"],tasks:["避开正午高温","相机做好防沙保护","夜游后按官方交通组织离场"] },
  { day:9,title:"河西走廊 · 嘉峪关",start:"敦煌",end:"嘉峪关",km:"约390 km",drive:"4.5–5小时",stay:"嘉峪关/酒泉",color:"#c5673e",summary:"沿G30进入河西走廊，在瓜州服务区休息，下午游览嘉峪关关城。",route:[[94.6619,40.1421],[98.2172,39.8014]],stops:["jiayuguan"],tasks:["每两小时进入服务区休息","注意横风和大型货车","入住带停车场的酒店"] },
  { day:10,title:"嘉峪关 · 七彩丹霞",start:"嘉峪关",end:"张掖",km:"约250 km",drive:"3小时",stay:"张掖/丹霞镇",color:"#b94f48",summary:"中午前后抵达张掖丹霞区域，下午入园等待侧光和日落。",route:[[98.2172,39.8014],[100.0611,38.9736],[100.4498,38.9259]],stops:["danxia","zhangye"],tasks:["确认正确入园口","游览后给车辆补满油","准备进入祁连山区"] },
  { day:11,title:"官方绕行 · 二尕公路",start:"张掖",end:"祁连",km:"230–280 km",drive:"5–6小时",stay:"祁连县",color:"#7f6a42",summary:"避开封闭G227，按官方方案经肃南、G213二尕公路进入祁连。",route:[[100.4498,38.9259],[99.6156,38.837],[100.2531,38.1771]],stops:["g227","sunan","qilian"],tasks:["导航强制加入肃南与祁连","拨打12328复核路况","山区绝不夜间赶路"] },
  { day:12,title:"祁连草原 · 返回西宁",start:"祁连",end:"西宁",km:"280–320 km",drive:"5–6小时",stay:"西宁/返程",color:"#315f59",summary:"走S302至峨堡，上G0611返回西宁；岗什卡仅作天气与通行允许时的机动点。",route:[[100.2531,38.1771],[100.899,37.953],[101.7782,36.6171]],stops:["gangshika","xining"],tasks:["不进入G227封闭区","至少预留2小时还车缓冲","完成车辆外观与油量检查"] },
];

export const tripStats = { days:12, distance:"≈3,000", sights:12, nights:11 };
