import { days, places, routeRoads, type Category, type Place, type TripDay } from "./trip-data";

export type SourceLink = { name: string; publisher: string; url: string; note?: string };
export type Stat = { label: string; value: string };
export type StorySection = { title: string; text: string };
export type MediaAsset = { src: string; alt: string; caption: string; credit: string; sourceUrl: string; framing?:"full"|"detail"; contextLabel?:string };

export type PoiDetail = {
  place: Place;
  kindLabel: string;
  icon: string;
  hero: MediaAsset;
  gallery: MediaAsset[];
  lead: string;
  stats: Stat[];
  sections: StorySection[];
  highlights: string[];
  actions: string[];
  cautions: string[];
  sources: SourceLink[];
};

export type RouteDetail = {
  day: TripDay;
  hero: MediaAsset;
  gallery: MediaAsset[];
  roads: string;
  lead: string;
  stats: Stat[];
  sections: StorySection[];
  rhythm: { time: string; title: string; note: string }[];
  cautions: string[];
  sources: SourceLink[];
};

const sources = {
  qhLake: { name:"青海湖与柴达木地理综述", publisher:"中国国家地理", url:"https://www.dili360.com/cng/article/p5350c3d6904b621.htm", note:"湖盆、盐湖与环线地理背景" },
  qhScenic: { name:"青海观景点专题", publisher:"中国国家地理", url:"https://www.dili360.com/article/p5559a3acdf6d164.htm" },
  chaka: { name:"茶卡盐湖专题", publisher:"中国国家地理", url:"https://www.dili360.com/article/p57cad2081618d07.htm" },
  qaidam: { name:"柴达木盆地专题", publisher:"中国国家地理", url:"https://www.dili360.com/article/p5350c3d76b59735.htm" },
  qhGov: { name:"打造世界级生态旅游目的地", publisher:"青海省人民政府新闻办", url:"https://www.qhio.gov.cn/system/2025/05/16/030394600.shtml" },
  qhRoad: { name:"2026年8月8日青海省国省干线路况", publisher:"青海省交通运输厅", url:"https://jtyst.qinghai.gov.cn/jtyst/2026-08/08/article_2026080808353841781.html", note:"页面路况核验基准；出发前仍需查询当天公告" },
  g227: { name:"G227扁都口至峨堡段全幅封闭施工通告", publisher:"青海广播电视台（政务通告）", url:"https://www.qhbtv.com.cn/m/default/2026/04/3732385.html", note:"小型车经G0611—S302—祁连—G213—肃南绕行" },
  altitude: { name:"高原旅行健康提示", publisher:"国家卫生健康委员会", url:"https://www.nhc.gov.cn/zwgkzt/pjbkz1/201005/47316.shtml" },
  mogao: { name:"Mogao Caves", publisher:"UNESCO World Heritage Centre", url:"https://whc.unesco.org/en/list/440/" },
  mogaoVisit: { name:"2026年莫高窟开放管理公告", publisher:"敦煌研究院", url:"https://www.dha.ac.cn/info/1020/7498.htm", note:"实名分时预约与票型规则" },
  natGeoMogao: { name:"Caves of Faith", publisher:"National Geographic", url:"https://www.nationalgeographic.com/magazine/article/dunhuang-caves", note:"丝绸之路艺术与跨文化背景" },
  lonelyMogao: { name:"Mogao Grottoes travel guide", publisher:"Lonely Planet", url:"https://www.lonelyplanet.com/points-of-interest/mogao-grottoes/1496278", note:"旅行者视角；票务以敦煌研究院最新公告为准" },
  lonelyMingsha: { name:"Singing Sands Dune", publisher:"Lonely Planet", url:"https://www.lonelyplanet.com/points-of-interest/singing-sands-dune/1496279" },
  natGeoCorridor: { name:"Travel by rail through the Hexi Corridor", publisher:"National Geographic Travel", url:"https://www.nationalgeographic.com/travel/article/travel-by-bullet-train-through-china", note:"河西走廊、张掖、嘉峪关与敦煌的区域视角" },
  wall: { name:"The Great Wall", publisher:"UNESCO World Heritage Centre", url:"https://whc.unesco.org/document/225990" },
  danxia: { name:"Zhangye UNESCO Global Geopark", publisher:"UNESCO", url:"https://www.unesco.org/en/iggp/zhangye-unesco-global-geopark" },
  danxiaGov: { name:"张掖七彩丹霞旅游景区", publisher:"张掖市人民政府", url:"https://www.zhangye.gov.cn/chzy/zyly/ajjq/202303/t20230318_1007476.html" },
  qhTourRoad: { name:"青海交旅融合精品旅游公路", publisher:"青海省人民政府", url:"https://www.qinghai.gov.cn/zwgk/system/2026/01/30/030091965.shtml" },
  qhLakeAccess: { name:"青海湖自然保护地游览提醒", publisher:"共和县人民政府", url:"https://www.gonghe.gov.cn/xwdt/tzgg/content_1013648235" },
};

const media = {
  xining: { src:"/detail/xining.jpg", alt:"西宁城区俯瞰", caption:"西宁城区实景，用于环线起终点与住宿节点。", credit:"央视新闻（海南州政府页面转载）", sourceUrl:"https://www.hainanzhou.gov.cn/xwzx/tpxw/content_1013642214" },
  riyue: { src:"/detail/riyue.jpg", alt:"日月山唐蕃古道石碑与山地", caption:"日月山景区的唐蕃古道标志，确属本页地点。", credit:"慕尼黑啤酒 / Wikimedia Commons（CC BY-SA 3.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:Riyue_Mountain.jpg" },
  qinghai: { src:"/detail/qinghai.jpg", alt:"从高处俯瞰青海湖湖岸", caption:"青海湖俯瞰实景；二郎剑是本环线采用的正规游览入口。", credit:"ping lin / Wikimedia Commons（CC BY-SA 3.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:%E9%9D%92%E6%B5%B7%E6%B9%96%E4%BF%AF%E7%9E%B0_-_panoramio.jpg" },
  chaka: { src:"/detail/chaka.jpg", alt:"茶卡盐湖水面倒影", caption:"茶卡盐湖“天空之镜”实景。倒影效果取决于风速与水面条件。", credit:"西安兵马俑 / Wikimedia Commons（CC BY-SA 4.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:%E8%8C%B6%E5%8D%A1%E7%9B%90%E6%B9%96%E5%A4%A9%E7%A9%BA%E4%B9%8B%E5%A2%8303.jpg" },
  delingha: { src:"/detail/delingha.jpg", alt:"德令哈市区广场与城市建筑", caption:"德令哈市区实景，展示其作为柴达木东部城市补给节点的环境。", credit:"Gruschke / Wikimedia Commons（CC BY-SA 3.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:Delingha.jpg" },
  qaidam: { src:"/detail/qaidam.jpg", alt:"柴达木盆地荒漠地貌", caption:"柴达木盆地风成地貌现场；这是区域环境图，不代表具体城镇。", credit:"David Rubin / U.S. Geological Survey（Public Domain）", sourceUrl:"https://commons.wikimedia.org/wiki/File:China%27s_Qaidam_Basin_Landscape_Similar_to_Mars.jpg" },
  emerald: { src:"/detail/emerald.jpg", alt:"大柴旦翡翠湖蓝绿色盐池", caption:"大柴旦翡翠湖实景，确属本页地点；图中为航拍视角。", credit:"央视新闻（海南州政府页面转载）", sourceUrl:"https://www.hainanzhou.gov.cn/xwzx/tpxw/content_1013642214" },
  uroad: { src:"/detail/uroad.jpg", alt:"G315柴达木段U形起伏公路", caption:"G315 U形公路实景。图片不构成停车点指引，主车道严禁停车拍摄。", credit:"央视新闻（海南州政府页面转载）", sourceUrl:"https://www.hainanzhou.gov.cn/xwzx/tpxw/content_1013642214" },
  yadan: { src:"/detail/yadan.jpg", alt:"乌素特水上雅丹湖面与风蚀丘", caption:"乌素特水上雅丹地质公园实景，确属本页地点。", credit:"Sparktour / Wikimedia Commons（CC BY-SA 4.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:Wusute_Yardang_on_Water_Geological_Park.jpg" },
  aksai: { src:"/detail/aksai.jpg", alt:"阿克塞哈萨克族自治县公路与山地", caption:"阿克塞县境内公路与山地实景，用于翻越当金山后的补给节点。", credit:"Hiroki Ogawa / Wikimedia Commons（CC BY 3.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:Aksai_Jiuquan_Gansu_China_%E7%94%98%E7%B2%9B%E7%9C%81_%E9%98%BF%E5%85%8B%E5%A1%9E%E5%93%88%E8%90%A8%E5%85%8B%E6%97%8F%E8%87%AA%E6%B2%BB%E5%8E%BF_-_panoramio.jpg" },
  dunhuangCity: { src:"/detail/dunhuang-city.jpg", alt:"敦煌市区夜景与街头雕塑", caption:"敦煌市区实景；城市住宿页不再误用鸣沙山照片。", credit:"白云悠悠 / Wikimedia Commons（CC BY-SA 3.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:%E6%95%A6%E7%85%8Cdunhuang_city_-_panoramio.jpg" },
  mogao: { src:"/detail/mogao.jpg", alt:"莫高窟崖壁外立面与窟门", caption:"莫高窟崖壁及窟门实景；画面不是九层楼，原错误说明已纠正。", credit:"Zossolino / Wikimedia Commons（CC BY-SA 4.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:2015-09-20-083138_-_Mogao-Grotten.jpg" },
  mingsha: { src:"/detail/mingsha.jpg", alt:"鸣沙山月牙泉景区的沙丘与绿洲植被", caption:"鸣沙山月牙泉景区实景；画面展示沙丘与绿洲边缘，不把未入镜的月牙泉误写进画面。", credit:"Zossolino / Wikimedia Commons（CC BY-SA 4.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:2015-09-20-132538_-_Mondsichelsee_und_D%C3%BCnen.jpg" },
  jiayuguan: { src:"/detail/jiayuguan.jpg", alt:"嘉峪关关城内部与远处城市", caption:"嘉峪关关城内部实景，远处可见嘉峪关市区。", credit:"Dan Lundberg / Wikimedia Commons（CC BY-SA 2.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:20160507_China_6085_Jiayuguan_sRGB_(29367641204).jpg" },
  jiuquan: { src:"/detail/jiuquan.jpg", alt:"酒泉市区街道与商业建筑", caption:"酒泉市区实景，用于与嘉峪关二选一的住宿节点。", credit:"Sigismund von Dobschütz / Wikimedia Commons（CC BY-SA 3.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:Jiuquan-03.JPG" },
  zhangye: { src:"/detail/zhangye.jpg", alt:"张掖彩色丘陵层理", caption:"张掖七彩丹霞国家地质公园内部实景。", credit:"YubYub41 / Wikimedia Commons（CC BY-SA 4.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:Zhangye_Danxia.JPG" },
  zhangyeCity: { src:"/detail/zhangye-city.jpg", alt:"张掖大佛寺土塔", caption:"张掖市大佛寺土塔实景，用于张掖城市住宿与补给节点。", credit:"guan / Wikimedia Commons（CC BY 3.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:%E7%94%98%E8%82%83%E7%9C%81%E5%BC%A0%E6%8E%96%E5%B8%82%E5%A4%A7%E4%BD%9B%E5%AF%BA_-_panoramio_%282%29.jpg" },
  sunan: { src:"/detail/sunan.jpg", alt:"肃南裕固族自治县景观通道入口", caption:"肃南裕固族自治县境内裕固风情走廊入口实景。", credit:"Terry Wu / Wikimedia Commons（CC BY-SA 2.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:Sunan_gate_on_Chinese_Yugur_Scenic_Corridor.jpg" },
  qilianCounty: { src:"/detail/qilian-county.jpg", alt:"祁连县默勒一带山地草原", caption:"祁连县境内山地草原实景，用于县城基地与山区线路说明。", credit:"Neil Young / Wikimedia Commons（CC BY-SA 2.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:Qilian_in_Qilian_Qinghai.jpg" },
  gangshika: { src:"/detail/gangshika.jpg", alt:"岗什卡雪峰山体", caption:"岗什卡雪峰实景，确属本页地点；环线仅建议在合法点位远眺。", credit:"NoGhost / Wikimedia Commons（CC BY-SA 4.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:%E5%B2%97%E4%BB%80%E5%8D%A1%E9%9B%AA%E5%B3%B0.jpg" },
  qilian: { src:"/detail/qilian.jpg", alt:"祁连山雪峰与高山草原", caption:"祁连山区域景观图；仅用于跨区域道路背景，不代表施工现场。", credit:"Stefan Wagener / Wikimedia Commons（CC BY 2.0）", sourceUrl:"https://commons.wikimedia.org/wiki/File:Qilian_landscape.jpg" },
};

const kindMeta: Record<Category, { label:string; icon:string }> = {
  scenic: { label:"景点档案", icon:"景" }, city: { label:"住宿档案", icon:"宿" },
  supply: { label:"补给档案", icon:"补" }, warning: { label:"风险档案", icon:"险" },
};

const poiMedia: Record<string, MediaAsset> = {
  xining:media.xining, riyue:media.riyue, qinghai:media.qinghai,
  chaka:media.chaka, delingha:media.delingha, emerald:media.emerald,
  daqaidam:media.qaidam, "u-road":media.uroad, yadan:media.yadan,
  aksai:media.aksai, dunhuang:media.dunhuangCity, mogao:media.mogao,
  mingsha:media.mingsha, jiayuguan:media.jiayuguan, danxia:media.zhangye,
  zhangye:media.zhangyeCity, g227:media.qilianCounty, sunan:media.sunan,
  qilian:media.qilianCounty, "chaka-stay":media.chaka,
  "daqaidam-stay":media.qaidam, "jiayuguan-stay":media.jiayuguan,
  "jiuquan-stay":media.jiuquan, "danxia-stay":media.zhangye,
  gangshika:media.gangshika,
};

// POI carousels only contain the current destination or an explicitly defined
// corridor/base area. Same-day places are no longer mixed into a POI gallery.
const strictGalleryKeys: Partial<Record<string, (keyof typeof media)[]>> = {
  dunhuang:["dunhuangCity","mogao","mingsha"],
  g227:["qilianCounty","qilian","sunan"],
  qilian:["qilianCounty","qilian"],
};

function poiGallery(place: Place): MediaAsset[] {
  const hero = poiMedia[place.id] ?? media.qilian;
  const keys = strictGalleryKeys[place.id];
  if (keys) {
    const label = place.id === "g227" ? "G227官方绕行沿线（非施工现场）"
      : place.id === "dunhuang" ? "敦煌目的地范围"
      : "祁连县及祁连山区域";
    return keys.map((key)=>({ ...media[key], framing:"full", contextLabel:label }));
  }
  const scope = place.category === "city" ? "住宿所在城市 / 区域（非酒店实拍）"
    : place.category === "supply" ? "补给节点所在区域"
    : place.category === "warning" ? "风险路段语境图"
    : "当前景点 · 已核验原图";
  return [
    { ...hero, framing:"full", contextLabel:scope },
    { ...hero, framing:"detail", contextLabel:"同一原图 · 细节裁切", caption:`${hero.caption} 此页仅追加同一张已核验原图的细节视角，不混入其他地点照片。` },
  ];
}

type Override = { lead?:string; story?:string; highlights?:string[]; actions?:string[]; cautions?:string[]; sources?:SourceLink[] };

const overrides: Record<string, Override> = {
  xining:{ lead:"把西宁当成高原环线的‘减压舱’，而不只是取车点：较低海拔、完整医疗和车辆服务，让第一晚与最后一晚都有明确作用。", story:"城市处在湟水谷地，既连接青藏高原东缘，也连接河西走廊。首日不赶景点，是为了给睡眠、补液和车辆检查留出空间。", highlights:["城东/海湖新区：道路宽、停车相对方便","医院、轮胎与租车服务最完整","返程前一晚可消化山区天气延误"], sources:[sources.altitude,sources.qhGov] },
  riyue:{ lead:"日月山不是简单的公路打卡点，而是从河湟谷地抬升到高原湖盆的地形门槛，也是当天最需要观察身体反应的位置。", story:"垭口处风强、天气变化快。它在历史上联系河湟与青海湖盆地，今天仍是理解环线海拔跃迁的最佳观察点。", highlights:["短停看地形，不在垭口长时间活动","经幡与宗教空间保持距离与尊重","从这里开始加强防晒和保温"], sources:[sources.qhScenic,sources.altitude] },
  qinghai:{ lead:"青海湖是高原内流湖系统的核心景观。真正值得看的不只是蓝色水面，而是湖盆、草原、鸟类栖息地和季节性水岸共同构成的生态系统。", story:"在官方开放区域停留，可以同时降低生态扰动和停车风险。不要把翻越围栏、驶入草场或追逐湖岸当作‘小众路线’。", highlights:["二郎剑提供成熟停车与游览组织","上午逆光较弱，傍晚层次更柔和","湖岸风大，体感温度明显低于西宁"], sources:[sources.qhLake,sources.qhLakeAccess,sources.qhScenic] },
  chaka:{ lead:"茶卡的倒影不是固定节目，而是浅水、低风速、云量与光线共同作用的结果。把它当成气象驱动型景点，体验会更现实。", story:"盐湖来自封闭盆地长期蒸发与盐类富集。小火车、盐雕和水面倒影是游览层，盐湖地质与生产历史才是它和普通湖泊的根本差异。", highlights:["早晨通常风更小、人更少","倒影好坏看风，不要为照片涉入禁区","盐水腐蚀性强，保护鞋和器材"], sources:[sources.chaka,sources.qhLake] },
  delingha:{ lead:"德令哈是从湖区进入柴达木后的功能型住宿城：医院、商超、油站与车辆服务，比沿途景观点更重要。", story:"把大型采购放在这里，可以减少大柴旦旺季物资和选择受限的问题；这里也是判断是否继续进入长距离荒漠段的最后一道舒适缓冲。", highlights:["加满油并补充两日饮水","检查备胎胎压与玻璃水","高反不缓解时优先在此就医"], sources:[sources.qaidam,sources.altitude] },
  emerald:{ lead:"翡翠湖不是一整片湖，而是多组因矿物、盐度和水深差异呈现不同颜色的盐池。最有价值的是观察色彩如何随视角与侧光改变。", story:"景区位于柴达木盐湖群环境中。盐壳可能看似坚固但承载力不均，因此观景必须遵循栈道与现场边界。", highlights:["下午侧光更能表现盐池层次","广角看盐池组合，长焦压缩雪山背景","不触碰生产设施、不踩薄盐壳"], sources:[sources.qaidam,sources.qhGov] },
  daqaidam:{ lead:"大柴旦镇是G315与水上雅丹路线的生命线式补给点。这里的价值不是‘有一家网红店’，而是油、水、轮胎、住宿和撤退选择集中。", story:"长距离荒漠驾驶前，车辆状态优先于景点数量。把补给清单在镇内一次完成，第二天就无需依赖国道边不稳定的服务点。", highlights:["每次离镇都以满油为基准","备2升/人以上车载饮水","确认救援电话和租车边界"], sources:[sources.qhRoad,sources.qaidam] },
  "u-road":{ lead:"G315所谓U形公路是透视压缩形成的视觉效果，同时也是大型货车持续通行的普通国道。最危险的行为，正是为了复制网络照片走进车道。", story:"坡顶会遮挡双向视距，重型车辆制动距离远大于小客车。任何主车道停车、站立拍摄或掉头，都会把景观风险放大成交通事故风险。", highlights:["只在合法停车区观察","拍摄使用长焦，不进入车道","遇施工服从临时交通组织"], cautions:["严禁在坡顶、弯道和主车道停车","严禁站在道路中心线拍照","不跟随他人违规停车"], sources:[sources.qhRoad,sources.qaidam] },
  yadan:{ lead:"水上雅丹把风蚀土丘与湖面并置，是柴达木极少见的景观组合；但往返里程远，真正的难点是驾驶疲劳与补给管理。", story:"雅丹来自干旱区松散沉积物被长期风蚀。环线只采用铺装道路和受管理景区，不把俄博梁或无人区穿越混进行程。", highlights:["景区内观察风蚀脊线与湖岸关系","两名司机轮换更合理","回程必须在天黑前完成主要荒漠段"], sources:[sources.qaidam,sources.qhRoad] },
  aksai:{ lead:"阿克塞是翻过当金山后的刹车检查与人体休息点。长下坡之后，让车辆和驾驶者一起降温，比再赶一个打卡点更重要。", story:"这里位于柴达木向河西走廊的转换地带，风场、温度和景观都会明显变化，适合完成简单补给后继续敦煌。", highlights:["检查轮胎与制动是否异常发热","补水、如厕、换驾驶员","风大时控制横向稳定性"], sources:[sources.qhRoad,sources.qhGov] },
  dunhuang:{ lead:"敦煌应当作为两到三晚的人文基地来使用。莫高窟预约、沙漠气温和大风都可能改变顺序，多住一晚就是整条线路的缓冲机制。", story:"城市位于丝绸之路多方向交通的汇合地带。白天可用博物馆补齐历史背景，早晚安排户外，能显著降低高温与赶路压力。", highlights:["住市区便于餐饮和停车","用预约时段反推其他活动","至少保留半天不排刚性项目"], sources:[sources.mogao,sources.mogaoVisit,sources.natGeoCorridor] },
  mogao:{ lead:"莫高窟的核心不是‘看几个洞’，而是观察一千年间宗教艺术、贸易网络和社会生活如何被连续保存在崖壁中。", story:"UNESCO记录莫高窟现存492个洞窟、约45,000平方米壁画和2,000余身彩塑。它在1987年列入世界遗产，是整趟环线最需要提前锁定的参观项目。", highlights:["数字电影先建立时空背景","实体洞窟由当日开放和讲解路线决定","窟内禁拍是文物保护要求"], sources:[sources.mogao,sources.mogaoVisit,sources.natGeoMogao,sources.lonelyMogao] },
  mingsha:{ lead:"鸣沙山月牙泉适合在傍晚进入：气温下降、沙丘阴影拉长，地形结构比正午更清晰。", story:"月牙泉位于沙丘环抱的低地，沙、水与绿洲城市紧密相邻。不要把它只理解为骑骆驼项目，登高观察沙脊和绿洲边缘更能看懂环境。", highlights:["傍晚爬沙丘、日落后下撤","镜头与手机做好防沙","尊重现场客流单向组织"], sources:[sources.lonelyMingsha,sources.mogaoVisit,sources.qhGov] },
  jiayuguan:{ lead:"嘉峪关关城最适合从‘边关系统’而非单体城楼理解：关城、长城、烽燧与河西走廊交通共同构成防御体系。", story:"UNESCO对长城的描述强调其跨越两万多公里的复杂体系，西至嘉峪关。站在关城看山口与荒漠，空间关系比建筑打卡更重要。", highlights:["先看展陈，再登城观察走廊地形","预留3小时，不和敦煌长途硬挤","午后风强，保管帽子和票证"], sources:[sources.wall,sources.natGeoCorridor] },
  danxia:{ lead:"张掖丹霞的色彩来自不同沉积层与后期构造、侵蚀共同作用。雨后和侧光会增强对比，但无需为天气冒险偏离栈道。", story:"UNESCO世界地质公园将这里的彩色丘陵、河流、峡谷和裕固族文化放在同一地质—人文框架下。官方景区面积约50平方公里，必须乘接驳车串联观景台。", highlights:["下午至日落观察色彩变化","不同观景台看层理与尺度","全程留在栈道，地貌不可踩踏"], sources:[sources.danxia,sources.danxiaGov,sources.natGeoCorridor] },
  zhangye:{ lead:"张掖是进入祁连山区前最后一座配套完整的大城市，也是从高速巡航切换到山区绕行的决策点。", story:"在这里应把油、水、轮胎与路况核查一次完成。次日导航必须加入肃南和祁连两个强制点，防止重新计算回封闭的G227。", highlights:["加满油、清洁玻璃、检查胎压","下载G213与S302离线地图","出发前再次查询交通公告"], sources:[sources.g227,sources.qhRoad] },
  g227:{ lead:"这不是普通‘拥堵点’，而是会让传统张掖—峨堡—门源方案失效的多段施工管制。核心封闭期明确到2027年7月31日。", story:"2026年8月8日官方路况仍显示：峨堡高速口至景阳岭、景阳岭至门源皇城乡，以及铁迈煤矿至大通黑泉水库等路段存在全封闭施工。小型车往返张掖与西宁，应按政务通告走张掖—肃南—G213—祁连—S302—峨堡收费站—G0611；现场标志和当天公告优先。", highlights:["导航强制加入肃南、祁连和峨堡收费站","出发前48小时与当天各复核一次","封闭计划截至2027-07-31，期间不赌导航自动更新"], cautions:["不驶入任何物理封闭或施工便道","不以社交平台旧帖替代官方路况","天黑前无法到祁连就缩短行程"], sources:[sources.g227,sources.qhRoad] },
  sunan:{ lead:"肃南是绕行线从河西走廊进入祁连山的关键补给县城。午餐、加油和路况确认应集中在这里完成。", story:"之后道路进入山地，服务密度和通信稳定性下降。把肃南当作‘最后检查点’，可避免在景观最漂亮、也最不适合处理问题的路段临时补救。", highlights:["午餐后检查油量与胎压","询问前方天气和道路管制","不把山区到达时间估得过紧"], sources:[sources.g227,sources.qhTourRoad] },
  qilian:{ lead:"祁连县是绕行线的高原住宿基地。住宿的核心不是奢华，而是停车、供暖、热水、安静睡眠和次日通行信息。", story:"县城位于祁连山北麓草原与河谷环境中，夜间温差大。晚到后不再安排远距离夜游，体力恢复优先。", highlights:["选择县城主干道附近带停车场住宿","确认供暖和热水","次日向前台和官方渠道双重核路况"], sources:[sources.qhTourRoad,sources.altitude] },
  "chaka-stay":{ lead:"茶卡住宿应围绕‘次日早入园’选择：离盐湖入口的真实车程、独立停车场、供暖和可取消政策，比装修风格更重要。", story:"镇区海拔仍在三千米左右。睡眠受高反影响时，不要用洗澡、饮酒或熬夜进一步增加负担。", highlights:["镇中心：餐饮更集中","景区东侧：次日通勤更短","旺季提前7—14天锁定可退房型"], sources:[sources.chaka,sources.altitude] },
  "daqaidam-stay":{ lead:"大柴旦建议连住两晚，避免水上雅丹长距离往返后换酒店。院内停车、供暖和制氧条件是筛选重点。", story:"旺季房源紧张且价格波动明显。连续住宿能把行李留在房间，也给天气或疲劳导致的计划调整留下余地。", highlights:["两晚订同一房型并确认保留","接受晚到且有前台值守","检查停车场是否能停SUV"], sources:[sources.qaidam,sources.altitude] },
  "jiayuguan-stay":{ lead:"选择嘉峪关住宿，优势是关城游览后驾驶更短、第二天直接上G30；适合把当天重点放在长城文化。", story:"优先选择市区主干道附近、带停车场的酒店。不要为靠近景区而住进餐饮和补给都不便的孤立位置。", highlights:["关城结束后快速入住","餐饮与加油方便","次日向张掖无需折返"], sources:[sources.wall] },
  "jiuquan-stay":{ lead:"酒泉是D9的功能型备选：如果需要更多餐饮、车辆服务或房型，额外半小时车程可能值得。", story:"它与嘉峪关二选一即可，不要同一晚来回折返。选这里的前提是关城离开时间充裕且驾驶者仍有余力。", highlights:["车辆服务选择更多","房源和餐饮更丰富","晚到时直接住嘉峪关，不硬赶"], sources:[sources.wall] },
  "danxia-stay":{ lead:"丹霞镇住宿的价值是看完日落后减少夜驾；代价是餐饮和车辆服务少于张掖市区。", story:"预订前核对酒店与实际入园口，不能只看‘丹霞附近’。第二天去肃南仍需按规划方向行驶。", highlights:["适合坚持看日落的人","确认接驳车末班与离园口","补给需求高则回张掖市区"], sources:[sources.danxiaGov,sources.danxia] },
  gangshika:{ lead:"岗什卡应被视为天气与通行允许时的远眺支线，而不是必须完成的登山项目。雪峰尺度需要安全距离才能欣赏。", story:"青海精品旅游公路规划把青海湖—岗什卡串联为户外目的地，但施工、雨雪和高海拔会改变当日可达性。环线只做合法观景，不无向导登山。", highlights:["只在开放道路与合法停车点停留","云层低或降雪时直接放弃","不因打卡延误返程还车"], sources:[sources.qhTourRoad,sources.altitude] },
};

function defaultSources(place: Place) {
  if (place.region.includes("甘肃")) return [sources.mogaoVisit, sources.danxiaGov];
  return [sources.qhGov, sources.qhRoad];
}

function categoryActions(place: Place): string[] {
  if (place.category === "city") return ["筛选独立停车场与可取消房型","电话确认供暖、热水和晚到政策","入住后先休息，再决定是否加活动"];
  if (place.category === "supply") return ["油量低于半箱前完成补充","每人准备至少两升应急饮水","拍照记录车辆外观、胎压与救援电话"];
  if (place.category === "warning") return ["将官方公告截图保存离线","在导航中加入强制途经点","现场标志与交警指挥优先于既定计划"];
  return ["核对开放时间与预约证件","把游览结束时间写进当天计划","只在开放区域活动并带走垃圾"];
}

function buildPoiDetail(place: Place): PoiDetail {
  const o = overrides[place.id] ?? {};
  const meta = kindMeta[place.category];
  return {
    place, kindLabel:meta.label, icon:meta.icon, hero:poiMedia[place.id] ?? media.qilian,
    gallery:poiGallery(place),
    lead:o.lead ?? place.description,
    stats:[
      { label:"安排日", value:`D${place.day}` },
      { label:"停留", value:place.visit ?? "机动" },
      { label:"海拔", value:place.altitude ?? "以现场为准" },
      { label:"坐标", value:`${place.coords[1].toFixed(3)}°N` },
    ],
    sections:[
      { title:place.category === "city" ? "为什么住在这里" : place.category === "supply" ? "为什么在这里补给" : place.category === "warning" ? "风险从哪里来" : "如何读懂这里", text:o.story ?? place.description },
      { title:"放进环线的方式", text:`${place.name}安排在D${place.day}，与当天车程和体力恢复共同考虑。${place.description}` },
    ],
    highlights:o.highlights ?? place.tips,
    actions:o.actions ?? categoryActions(place),
    cautions:o.cautions ?? place.tips,
    sources:o.sources ?? defaultSources(place),
  };
}

export const poiDetails = Object.fromEntries(places.map((place) => [place.id, buildPoiDetail(place)])) as Record<string, PoiDetail>;

const routeNotes: Record<number, { lead:string; story:string; rhythm:RouteDetail["rhythm"]; sources:SourceLink[] }> = {
  1:{ lead:"用一整天把人、车和计划校准到高原节奏。", story:"首日看似没有里程，却决定后面是否需要用赶路来补救。取车验车、采购、预约复核和早睡是当天的四个明确任务。", rhythm:[{time:"上午",title:"抵达与取车",note:"逐项拍摄车况并核对救援范围"},{time:"下午",title:"物资采购",note:"饮水、食物、防晒与常用药"},{time:"晚上",title:"轻活动早休息",note:"观察头痛、恶心和睡眠情况"}], sources:[sources.altitude,sources.qhGov] },
  2:{ lead:"从河湟谷地跨过日月山，第一次完整进入高原湖盆。", story:"当天海拔变化比里程更值得关注。日月山短停、青海湖正规入口游览，随后继续到茶卡住宿，避免在湖边拖到天黑。", rhythm:[{time:"08:00",title:"西宁出发",note:"避开市区高峰"},{time:"10:00",title:"日月山短停",note:"以30—60分钟为限"},{time:"12:00",title:"青海湖",note:"正规景区与停车区"},{time:"17:30",title:"抵达茶卡",note:"先加油再入住"}], sources:[sources.qhLake,sources.qhLakeAccess,sources.altitude] },
  3:{ lead:"用盐湖晨光开场，以德令哈完整补给收尾。", story:"这是缓冲日而非冲刺日。上午风小则充分游览茶卡，天气不理想就提早离开，把时间留给德令哈采购和车辆检查。", rhythm:[{time:"08:00",title:"茶卡盐湖",note:"根据风速调整停留"},{time:"12:30",title:"午餐离开",note:"不在盐湖硬等天气"},{time:"16:00",title:"德令哈补给",note:"油、水、轮胎一次完成"}], sources:[sources.chaka,sources.qhRoad] },
  4:{ lead:"从盆地城市进入大柴旦，以短车程换一个准备充分的下午。", story:"抵达后先入住和加油，再游览翡翠湖；先处理刚性事务，能避免日落后回镇才发现房间或补给问题。", rhythm:[{time:"09:00",title:"德令哈出发",note:"出城前满油"},{time:"13:00",title:"大柴旦入住",note:"连续两晚不换房"},{time:"16:00",title:"翡翠湖",note:"等待侧光，按时离园"}], sources:[sources.qaidam,sources.qhRoad] },
  5:{ lead:"全程最长、容错最低的一天，景点价值必须让位于驾驶安全。", story:"往返水上雅丹约450—500公里，主路车速快、补给稀疏。两名司机轮换，并设置明确折返点；单司机应拆分住宿。", rhythm:[{time:"07:00",title:"满油出发",note:"车内备餐与饮水"},{time:"09:30",title:"G315合法观景",note:"不上车道拍照"},{time:"12:00",title:"水上雅丹",note:"控制游览上限"},{time:"16:00",title:"强制返程",note:"日落前完成荒漠段"}], sources:[sources.qaidam,sources.qhRoad] },
  6:{ lead:"翻越当金山完成从柴达木到河西走廊的地理切换。", story:"长上坡和长下坡连续出现，阿克塞承担车辆降温、驾驶员休息和简单补给功能。抵达敦煌后不再追加夜间远途。", rhythm:[{time:"08:00",title:"大柴旦出发",note:"确认油量与天气"},{time:"12:00",title:"阿克塞短休",note:"检查刹车与轮胎"},{time:"15:30",title:"敦煌入住",note:"确认莫高窟证件和时段"}], sources:[sources.qhRoad,sources.mogaoVisit] },
  7:{ lead:"整天围绕莫高窟预约时段组织，不把世界遗产压缩成赶场。", story:"数字展示、交通接驳和实体洞窟共同构成完整参观。下午只安排博物馆或休息，为洞窟信息留出消化时间。", rhythm:[{time:"预约前45分",title:"抵达数字中心",note:"核验证件与票型"},{time:"约4小时",title:"完整参观",note:"听从分组和开放洞窟安排"},{time:"下午",title:"博物馆或休息",note:"不叠加远距离项目"}], sources:[sources.mogao,sources.mogaoVisit,sources.natGeoMogao,sources.lonelyMogao] },
  8:{ lead:"把天气机动与沙漠体验放在同一天，避免正午高温。", story:"白天保留为莫高窟调整、休息或市内参观，傍晚再进鸣沙山。日落不是必须等到最后一刻，离场交通同样需要时间。", rhythm:[{time:"上午",title:"机动与恢复",note:"不设置刚性里程"},{time:"17:00",title:"进入鸣沙山",note:"按温度动态调整"},{time:"日落后",title:"有序离场",note:"防止疲劳夜驾"}], sources:[sources.lonelyMingsha,sources.mogaoVisit] },
  9:{ lead:"在高速长距离和关城游览之间保持清晰分界。", story:"每两小时进入服务区休息，午后到达关城再游览。若到达明显晚于计划，优先住宿，不用夜色追赶景点。", rhythm:[{time:"08:00",title:"敦煌出发",note:"瓜州方向进入高速"},{time:"10:00",title:"服务区休息",note:"换驾驶员"},{time:"14:00",title:"嘉峪关关城",note:"预留约3小时"},{time:"18:00",title:"入住",note:"嘉峪关或酒泉二选一"}], sources:[sources.wall,sources.natGeoCorridor] },
  10:{ lead:"上午平稳转场，下午把光线留给彩色丘陵。", story:"先确认入园口和末班接驳，再决定住丹霞镇还是张掖市区。看完日落不应再安排山路，第二天的绕行需要充足休息。", rhythm:[{time:"09:00",title:"嘉峪关出发",note:"G30巡航"},{time:"14:30",title:"七彩丹霞",note:"随接驳串联观景台"},{time:"日落后",title:"就近入住",note:"不疲劳夜驾"}], sources:[sources.danxia,sources.danxiaGov,sources.natGeoCorridor] },
  11:{ lead:"全环线最重要的导航纠偏日：绕开封闭G227，进入官方替代路径。", story:"路线必须经过肃南与祁连两个强制点。山地道路平均速度低于高速，里程虽不长但需要留出天气、施工和牲畜横穿的时间。", rhythm:[{time:"07:30",title:"张掖出发",note:"导航加入肃南、祁连"},{time:"10:30",title:"肃南补给",note:"最后一次完整检查"},{time:"下午",title:"G213山区",note:"不超速、不夜驾"},{time:"天黑前",title:"祁连入住",note:"到店后不再加项目"}], sources:[sources.g227,sources.qhRoad] },
  12:{ lead:"把返程日当作仍需认真驾驶的山区段，而不是已经结束的行程。", story:"S302与G0611承担返回西宁的主线。岗什卡只在开放、天气良好且还车时间充裕时远眺，任何不确定都应直接略过。", rhythm:[{time:"08:00",title:"祁连出发",note:"确认S302与高速路况"},{time:"上午",title:"机动远眺",note:"不进入封闭支线"},{time:"15:00前",title:"抵达西宁",note:"预留清洁、加油和还车"}], sources:[sources.qhTourRoad,sources.g227,sources.qhRoad] },
};

function routeHero(day:number):MediaAsset {
  return ({1:media.xining,2:media.qinghai,3:media.chaka,4:media.emerald,
    5:media.yadan,6:media.aksai,7:media.mogao,8:media.mingsha,
    9:media.jiayuguan,10:media.zhangye,11:media.sunan,12:media.gangshika} as Record<number,MediaAsset>)[day];
}

function routeGallery(day:number):MediaAsset[] {
  const keys = ({
    1:["xining","riyue","qinghai"], 2:["riyue","qinghai","chaka"],
    3:["chaka","delingha","qaidam"], 4:["delingha","emerald","qaidam"],
    5:["uroad","yadan","qaidam"], 6:["qaidam","aksai","dunhuangCity"],
    7:["dunhuangCity","mogao","mingsha"], 8:["dunhuangCity","mingsha","mogao"],
    9:["dunhuangCity","jiayuguan","jiuquan"], 10:["jiayuguan","zhangye","zhangyeCity"],
    11:["zhangyeCity","sunan","qilianCounty"], 12:["qilianCounty","gangshika","xining"],
  } as Record<number,(keyof typeof media)[]>)[day];
  return keys.map((key)=>({ ...media[key], framing:"full" as const, contextLabel:`D${day} 沿线实景` }));
}

export const routeDetails = Object.fromEntries(days.map((day) => {
  const n = routeNotes[day.day];
  const detail:RouteDetail = {
    day, hero:routeHero(day.day), gallery:routeGallery(day.day), roads:routeRoads[day.day], lead:n.lead,
    stats:[{label:"里程",value:day.km},{label:"驾驶",value:day.drive},{label:"住宿",value:day.stay},{label:"节点",value:`${day.stops.length}处`}],
    sections:[{title:"线路逻辑",text:n.story},{title:"道路选择",text:`主线采用 ${routeRoads[day.day]}。地图规划只作辅助，封闭、管制和现场交通标志拥有更高优先级。`}],
    rhythm:n.rhythm, cautions:day.tasks, sources:n.sources,
  };
  return [String(day.day),detail];
})) as Record<string,RouteDetail>;
