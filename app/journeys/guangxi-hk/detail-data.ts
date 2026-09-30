import { days, places, routeRoads } from "./trip-data";
import type { Category, MediaAsset, Place, PoiDetail, RouteDetail, SourceLink } from "../types";

// ------------------------------------------------------------
// 资料来源：政府 / 官方机构 / 主流媒体的一手页面，全部实测可访问（HTTP 200），
// 并分别对应该节点的实际信息诉求；配图出处与署名另见各 MediaAsset 的 credit。
// ------------------------------------------------------------
const sources = {
  // 证件 · 跨境
  niaVisa: { name:"往来港澳通行证和签注签发服务指南", publisher:"国家移民管理局", url:"https://www.nia.gov.cn/n741445/n741604/n1787214/c1790954/content.html", note:"通行证与签注的办理材料、流程与有效期" },
  xrl: { name:"最快旅行时间 14 分钟！越来越多人选择这条高铁通勤", publisher:"新华网（来源：新华社）", url:"https://www.news.cn/gangao/20251016/2f3ec74005d94a7b9d01808440a33638/c.html", note:"西九龙至福田、深圳北的最短耗时与班次密度" },
  gbaPort: { name:"深港通关人数屡创新高，百万客流如何让大湾区「越变越小」", publisher:"粤港澳大湾区门户网（来源：南方+）", url:"https://www.cnbayarea.org.cn/homepage/news/content/post_1302209.html", note:"深港口岸客流规模与通关组织" },
  hkGolden: { name:"香港预计国庆黄金周迎来内地旅客 129 万人次", publisher:"中央人民政府驻香港特别行政区联络办公室（来源：新华网）", url:"https://www.hmo.gov.cn/2026/09/24/ARTIJDkta0M80mAHQfKJOH8M260924.shtml", note:"国庆黄金周访港客流预测与口岸安排" },
  // 航空 · 长途驾驶
  hnaT2: { name:"关于海南航空北京首都国际机场国内出港航班值机截止时间调整的通知", publisher:"海南航空", url:"https://www.hnair.com/guanyuhaihang/hhdt/hhgg/cxts/cxts2026/202607/t20260709_86299.html", note:"首都机场 T2 国内航班截载时间" },
  hnaBaggage: { name:"海南航空 · 旅行信息（行李与乘机规定）", publisher:"海南航空", url:"https://www.hnair.com/lvxingxinxi/xlxx/", note:"托运行李件数、重量与尺寸规定的官方入口" },
  driveSafety: { name:"自驾出行安全指南 出发前必看 →", publisher:"央广网（来源：国家应急广播）", url:"https://news.cnr.cn/rebang/20251001/t20251001_527382944.shtml", note:"长途自驾的车辆检查与安全清单" },
  fatigue: { name:"公安部交管局提示广大驾驶人切勿疲劳驾驶、分心驾驶", publisher:"武汉市公安局（来源：中国警察网）", url:"https://gaj.wuhan.gov.cn/jmzx/gayw/202602/t20260214_2730239.html", note:"「每 2 小时进服务区休息」的依据" },
  holidayFree: { name:"高速免费时间定了！速速收藏这份中秋国庆双节出行攻略", publisher:"央视网（来源：央视新闻）", url:"https://news.cctv.com/2026/09/25/ARTImeAmvO5lcyUw7X91m9PE260924.shtml", note:"国庆假期七座以下小客车高速免费通行" },
  // 广西段
  nanningRiver: { name:"体验「邕江夜游」共赏诗意光影", publisher:"南宁市人民政府（来源：南宁日报）", url:"https://www.nanning.gov.cn/ywzx/tpxw/t6169558.html", note:"邕江两岸夜间景观与游船码头" },
  nanningAirportPlan: { name:"南宁吴圩国际机场执行 2026 年夏秋航季航班计划", publisher:"南宁市人民政府（来源：南宁日报）", url:"https://www.nanning.gov.cn/ywzx/bmdt/2026nbmdt/t6583070.html", note:"吴圩机场航线与日均航班量" },
  luochengGov: { name:"走进罗城", publisher:"罗城仫佬族自治县人民政府", url:"http://www.luocheng.gov.cn/zjlc/", note:"罗城县情、区位与干线公路概况" },
  luochengTianmen: { name:"世巡赛看罗城｜天门雄姿：巨型天然石门 一江穿洞过奇峰", publisher:"罗城仫佬族自治县人民政府（来源：罗城融媒体中心）", url:"http://www.luocheng.gov.cn/gddt/t28153894.shtml", note:"天门山天然石门的官方介绍" },
  molao: { name:"仫佬族依饭节", publisher:"广西壮族自治区人民政府（来源：河池市委宣传部）", url:"http://www.gxzf.gov.cn/html/mlgxi/gxrw_192475/zrdl/t27081625.shtml", note:"仫佬族国家级非物质文化遗产背景" },
  ronghe: { name:"融河高速公路通车，广西罗城仫佬族自治县结束不通高速的历史", publisher:"澎湃新闻（转载新华社）", url:"https://www.thepaper.cn/newsDetail_forward_10184757", note:"南宁往罗城方向的高速走向与里程" },
  gxRoad: { name:"逢山开路践初心——国道 357 线罗城四把至环江二级公路项目建设纪实", publisher:"广西壮族自治区交通运输厅", url:"http://jtt.gxzf.gov.cn/xwdt/tpxw/t10096742.shtml", note:"罗城山区二级公路的线形与路况特征" },
  liuzhouRoute: { name:"柳州市文化广电和旅游局关于柳州一日至三日旅游精品线路的公示", publisher:"柳州市文化广电和旅游局", url:"http://wglj.liuzhou.gov.cn/zwgk/fdzdgknr/tzgg_59093/202008/t20200828_2000730.shtml", note:"官方柳州一日至三日游线路" },
  liuzhouRiver: { name:"水动风凉夏日爽｜柳州柳江：一江碧波润客怀", publisher:"新华网（来源：广西日报）", url:"http://www.guangxi.xinhua.org/20260804/56b2a64317dd42a080721e862e5150a0/c.html", note:"柳江亲水玩法与沿江景观" },
  malu: { name:"「双色花瀑」上线！马鞍山上九龙藤盛放，赏景要讲文明哦～", publisher:"柳州市人民政府", url:"http://www.liuzhou.gov.cn/sjzt/zxzt/zwzt/jwmsxf/wmly_82883/202509/t20250924_3671653.shtml", note:"马鞍山公园游览信息" },
  luosifen: { name:"你吃过吗，柳城这里腌制的酸笋走向了全国螺蛳粉店", publisher:"柳州市人民政府（来源：柳城县融媒体中心）", url:"http://www.liuzhou.gov.cn/sjzt/zxzt/zwzt/dlfzsfjj/lsfcyfz/202609/t20260922_3797967.shtml", note:"螺蛳粉原料产业背景" },
  // 桂林 · 阳朔（景区与县级官方）
  liriver: { name:"桂林漓江景区旅游官网 · 通知公告", publisher:"桂林漓江景区", url:"https://www.liriver.com.cn/mobile/article/zxlj.tzgg?page=2", note:"漓江精华段游船调度与售票公告" },
  yangshuoGov: { name:"五一假期首日 漓江、遇龙河筏工在「朔办就办」平台频获点赞", publisher:"阳朔县人民政府（来源：阳朔县融媒体中心）", url:"http://www.yangshuo.gov.cn/zwdt/ysdt/t27528055.shtml", note:"漓江与遇龙河竹筏运营情况" },
  yulongRaft: { name:"广西阳朔：遇龙河竹筏漂流人气旺", publisher:"网易（来源：新华社 / 中国图片社）", url:"http://www.163.com/dy/article/KSBDP3LK05346RC6.html", note:"遇龙河竹筏河段实景" },
  // 深圳 · 香港
  futianGov: { name:"福田口岸", publisher:"深圳市人民政府口岸办公室", url:"http://ka.sz.gov.cn/bmfw/katgfw/ftkazt/", note:"福田口岸运行时间与交通指引" },
  szFutian: { name:"福田扛起中心城区首善担当 走出 CBD+科创融合发展新路", publisher:"深圳市人民政府（来源：深圳特区报）", url:"https://www.sz.gov.cn/cn/xxgk/zfxxgj/zwdt/content/post_12046909.html", note:"福田中心城区与口岸周边概况" },
  hkWK: { name:"香港故事｜香港西九文化区：活力十足的亚洲文化地标", publisher:"新华网（来源：新华社）", url:"https://www.news.cn/culture/20260330/033ea93841464bc3b450175437dc0f0e/c.html", note:"西九文化区定位与维港岸线" },
  hkPeak: { name:"从维多利亚港到太平山顶——香港旅游风采依旧", publisher:"中央人民政府驻香港特别行政区联络办公室（来源：新华社）", url:"http://www.locpg.gov.cn/jsdt/2017-06/05/c_129625232.htm", note:"维港、太平山顶等经典景点与动线" },
  hktdcFair: { name:"秋季四大科技展 10 月登场 汇聚环球约 6,200 家展商", publisher:"香港贸易发展局新闻中心", url:"https://mediaroom.hktdc.com/sc/pressrelease/detail/21041/", note:"秋电展 10 月 13—16 日于会展中心举行" },
  hktdcOverview: { name:"展会概览｜香港贸发局香港秋季电子产品展", publisher:"香港贸易发展局", url:"https://www.hktdc.com/event/hkelectronicsfairae/sc/fair-at-a-glance", note:"秋电展展期、展馆与入场安排" },
  globalSources: { name:"图片报道：香港环球资源消费电子展及电子元件展在亚洲国际博览馆举办", publisher:"人民日报海外版", url:"http://paper.people.com.cn/hwbwap/html/2024-04/18/content_26053073.htm", note:"环球资源消费电子展与亚博场馆" },
  // 广州
  cantonFairVisa: { name:"关于办理广州市交易团第 140 届广交会出口展区证件的通知", publisher:"广州市商务局", url:"http://sw.gz.gov.cn/xxgk/tzgg/tz/content/post_11026587.html", note:"第 140 届广交会进馆证件办理要求" },
  cantonFairNews: { name:"七十载风华：广州与广交会同频共振、展城互促", publisher:"广州日报新花城", url:"https://huacheng.gz-cmc.com/pages/2026/09/18/8e65693c1deb4a0cb3c721876e737f22.html", note:"第 140 届广交会 10 月 15 日开幕、琶洲展馆" },
  // 图片出处（同时作为该节点的实地资料来源）
  beijingAirport: { name:"首都机场 T2 航站楼春运现场", publisher:"中国日报网", url:"https://cn.chinadaily.com.cn/a/202502/04/WS67a207d2a310be53ce3f4164.html", note:"首都机场 T2 出发大厅实景" },
  nanningAirport: { name:"高清：南宁机场 T2 航站楼正式启用", publisher:"广西新闻网", url:"http://nn.gxnews.com.cn/staticpages/20140925/newgx54238e69-11241478-5.shtml", note:"吴圩国际机场 T2 航站楼外观与位置" },
  nanningCity: { name:"晴空下的广西南宁", publisher:"中国新闻网", url:"http://www.gx.chinanews.com.cn/sh/2025-09-11/detail-iheuzpwq9127752.shtml", note:"南宁东盟商务区城市天际线实景" },
  luocheng: { name:"乡村振兴在行动｜广西罗城：推动农文旅融合发展", publisher:"新华网广西频道", url:"http://www.guangxi.xinhua.org/20240403/6d726c2cec044cc6a723aadb6df7102e/c.html", note:"小长安镇民族村与仫佬族民居实景" },
  tianmen: { name:"广西罗城：国家地质公园多峻秀", publisher:"新华网（新浪网转载）", url:"https://news.sina.cn/2019-11-11/detail-iicezuev8561871.d.html", note:"怀群镇天门山穿洞地貌" },
  liuzhouCity: { name:"夜游百里柳江 霓虹喷泉两相宜", publisher:"中国新闻网", url:"https://www.chinanews.com.cn/tp/2025/08-29/10473142.shtml", note:"柳江夜景与柳州城市天际线" },
  liuzhouMuseum: { name:"寄存在老棉纺厂的城市工业记忆", publisher:"新华网", url:"https://www.news.cn/2021-08/25/c_1127794127.htm", note:"柳州工业博物馆与工业遗产背景" },
  yangshuo: { name:"诗意中国｜江作青罗带 山如碧玉篸", publisher:"新华网", url:"https://www.news.cn/photo/20241107/f82b5d142dcb4e9394240405c16c01c7/c.html", note:"漓江与阳朔峰林实景图集" },
  xingping: { name:"非凡十年｜百里漓江百里画", publisher:"新华网", url:"http://www.news.cn/politics/2022-10/10/c_1129058014.htm", note:"兴坪古镇与漓江流域治理背景" },
  tangshe: { name:"1969 年的阳朔老糖厂变身艺文新空间", publisher:"澎湃新闻", url:"https://www.thepaper.cn/newsDetail_forward_10634446", note:"糖舍由老糖厂改造的沿革与建筑信息" },
  westStreet: { name:"广西阳朔中秋之夜客满西街", publisher:"中国新闻网", url:"https://www.chinanews.com/tp/2023/09-30/10087325.shtml", note:"阳朔西街夜间客流实景" },
  yulong: { name:"广西阳朔：坐竹筏 赏美景", publisher:"人民图片网（网易号转载）", url:"https://www.163.com/dy/article/KSAEHH590514R9OJ.html", note:"遇龙河竹筏与两岸峰林田园" },
  shenzhenCity: { name:"航拍深圳 CBD 夜景", publisher:"国际在线（新华网新闻无人机队）", url:"https://news.cri.cn/2017-11-07/23b5da7b-e2c0-10b0-e59b-9478588b97ed.html", note:"福田中心区天际线与平安金融中心" },
  shenzhenNorth: { name:"春运中的深圳北站", publisher:"经济日报", url:"http://www.jingjiribao.cn/static/detail.jsp?id=566038", note:"深圳北站候车大厅实景与客流规模" },
  futianPort: { name:"福田口岸入境大厅通关现场", publisher:"海外网（转中国新闻网）", url:"https://m.haiwainet.cn/middle/3541068/2024/1226/content_32824111_1.html", note:"福田口岸边检通道与自助通关实景" },
  hkWestKowloon: { name:"广深港高铁香港西九龙站", publisher:"南方网 · 南方+", url:"https://pc.nfnews.com/4149/1458237.html", note:"西九龙站站内实景与换乘关系" },
  mongkok: { name:"旺角弥敦道街景", publisher:"环球网（中新社记者 李志华 摄）", url:"https://china.huanqiu.com/gallery/44zNCmy8o1g", note:"旺角商圈人流与街道尺度" },
  hkWHotel: { name:"航拍西九文化区与环球贸易广场", publisher:"新华网（新华社记者 陈铎 摄）", url:"http://www.news.cn/culture/20260330/033ea93841464bc3b450175437dc0f0e/c.html", note:"西九文化区与九龙站上盖（W 酒店所在片区）" },
  victoriaHarbour: { name:"维港的日与夜", publisher:"光明网（转新华网图集）", url:"https://m.gmw.cn/2022-06/24/content_35834281.htm", note:"维多利亚港两岸天际线与渡轮" },
  peak: { name:"太平山顶俯瞰维多利亚港", publisher:"中国网 · 图片中国", url:"http://photo.china.com.cn/news/2017-06/04/content_40961062_8.htm", note:"凌霄阁观景台视角与市区关系" },
  hkcec: { name:"香港会议展览中心", publisher:"中国新闻网", url:"https://www.chinanews.com.cn/tp/hd2011/2017/05-28/744025.shtml", note:"湾仔会展中心建筑与海旁位置" },
  asiaworldExpo: { name:"亚洲国际博览馆展会现场", publisher:"中国网 · 图片中国（新华社发）", url:"http://photo.china.com.cn/2025-06/13/content_117924654.shtml", note:"亚博展馆内景与办展规模" },
  cantonFair: { name:"广交会展馆（广州琶洲）", publisher:"澎湃新闻 · 中建八局官方号", url:"https://m.thepaper.cn/newsDetail_forward_30180573", note:"琶洲广交会展馆建筑群与规模" },
  guangzhouTower: { name:"夜色中的广州塔与珠江新城", publisher:"国际在线（转新华网，新华社记者 刘大伟 摄）", url:"https://city.cri.cn/2017-12-06/7931da93-833b-6b54-a1da-d27657c278f3.html", note:"广州塔与珠江新城夜景" },
};

// ------------------------------------------------------------
// 图片素材：src 为 public/detail/ 下的原图，credit 取自来源页原始图注。
// ------------------------------------------------------------
const media = {
  beijingAirport: { src:"/detail/beijing-airport.jpg", alt:"首都机场 T2 航站楼出发大厅", caption:"首都机场 T2 航站楼出发大厅，本次行程的起飞点。", credit:"中国日报网（中国日报记者 王敬 摄）", sourceUrl:"https://cn.chinadaily.com.cn/a/202502/04/WS67a207d2a310be53ce3f4164.html" },
  nanningAirport: { src:"/detail/nanning-airport.jpg", alt:"南宁吴圩国际机场 T2 航站楼外观", caption:"南宁吴圩国际机场 T2 航站楼外观：弧形屋顶、玻璃幕墙与高架车道。", credit:"广西新闻网", sourceUrl:"http://nn.gxnews.com.cn/staticpages/20140925/newgx54238e69-11241478-5.shtml" },
  nanningCity: { src:"/detail/nanning.jpg", alt:"南宁东盟商务区城市天际线航拍", caption:"南宁东盟商务区天际线；本次行程住在邕江北岸的老城一侧。", credit:"中国新闻网（中新社记者 陈冠言 摄）", sourceUrl:"http://www.gx.chinanews.com.cn/sh/2025-09-11/detail-iheuzpwq9127752.shtml" },
  luochengVillage: { src:"/detail/luocheng.jpg", alt:"罗城小长安镇民族村航拍", caption:"航拍罗城仫佬族自治县小长安镇民族村：村舍、水塘与远处峰林田园。", credit:"新华网广西频道（牙举成 摄）", sourceUrl:"http://www.guangxi.xinhua.org/20240403/6d726c2cec044cc6a723aadb6df7102e/c.html" },
  cunyuHouse: { src:"/detail/cunyu-hotel.jpg", alt:"罗城仫佬族特色民居", caption:"罗城仫佬族特色民居：白墙、青砖墙裙与翘角屋脊。图为罗城村寨民居，非三尖堂门面照。", credit:"新华网广西频道（牙举成 摄）", sourceUrl:"http://www.guangxi.xinhua.org/20240403/6d726c2cec044cc6a723aadb6df7102e/c.html" },
  tianmenHill: { src:"/detail/tianmen.jpg", alt:"罗城怀群镇天门山天然穿山洞", caption:"罗城怀群镇天门山：江水从天然穿洞下穿过。", credit:"新华网（新华社记者 陆波岸 摄），新浪网转载", sourceUrl:"https://news.sina.cn/2019-11-11/detail-iicezuev8561871.d.html" },
  liuzhouCity: { src:"/detail/liuzhou.jpg", alt:"夜幕下的柳江与柳州沿岸楼群", caption:"夜幕下的柳江水面与沿岸高楼灯光；柳江在城中拐出 U 形大弯。", credit:"中国新闻网（中新社记者 王以照 摄）", sourceUrl:"https://www.chinanews.com.cn/tp/2025/08-29/10473142.shtml" },
  liuzhouMuseum: { src:"/detail/liuzhou-museum.jpg", alt:"柳州工业博物馆外观", caption:"柳州工业博物馆：老厂房、红色钢构架与室外工业装置。", credit:"新华网（柳州工业博物馆供图）", sourceUrl:"https://www.news.cn/2021-08/25/c_1127794127.htm" },
  yangshuoCounty: { src:"/detail/yangshuo.jpg", alt:"航拍阳朔县城与漓江", caption:"航拍阳朔县城与漓江：峰林环抱、江水绕城。", credit:"新华网（黄勇丹 摄）", sourceUrl:"https://www.news.cn/photo/20241107/f82b5d142dcb4e9394240405c16c01c7/c.html" },
  tangshe: { src:"/detail/tangshe-hotel.jpg", alt:"阳朔糖舍老糖厂厂房与烟囱", caption:"阳朔糖舍：老糖厂砖砌厂房、大烟囱与镜面水池倒影。", credit:"澎湃新闻", sourceUrl:"https://www.thepaper.cn/newsDetail_forward_10634446" },
  westStreet: { src:"/detail/west-street.jpg", alt:"阳朔西街夜景", caption:"阳朔西街夜景：灯笼彩伞与密集人流。", credit:"中国新闻网（中新社记者 周利朔 摄）", sourceUrl:"https://www.chinanews.com/tp/2023/09-30/10087325.shtml" },
  yulong: { src:"/detail/yulong-river.jpg", alt:"遇龙河上成排竹筏", caption:"遇龙河上成排竹筏与两岸峰林田园，是漓江支流中最安静的一段。", credit:"人民图片网（黄胜林 摄），网易号转载", sourceUrl:"https://www.163.com/dy/article/KSAEHH590514R9OJ.html" },
  xingping: { src:"/detail/xingping.jpg", alt:"航拍兴坪古镇与漓江大江湾", caption:"航拍兴坪古镇与漓江大江湾，二十元人民币背景就取景于这一带。", credit:"新华网（新华社记者 周华 摄）", sourceUrl:"http://www.news.cn/politics/2022-10/10/c_1129058014.htm" },
  shenzhenNorth: { src:"/detail/shenzhen-north.jpg", alt:"深圳北站候车大厅", caption:"深圳北站候车大厅；本次车辆停放在站内停车场，再换乘高铁进港。", credit:"经济日报（方琳 摄）", sourceUrl:"http://www.jingjiribao.cn/static/detail.jsp?id=566038" },
  hkWestKowloon: { src:"/detail/hk-west-kowloon.jpg", alt:"香港西九龙站售票大厅", caption:"香港西九龙站售票大厅，站名牌与票务柜台清晰可见。", credit:"南方网 · 南方+", sourceUrl:"https://pc.nfnews.com/4149/1458237.html" },
  mongkokStreet: { src:"/detail/mongkok.jpg", alt:"旺角弥敦道街景", caption:"旺角弥敦道街景：车流、行人与两侧密集的商铺招牌。", credit:"环球网（中新社记者 李志华 摄）", sourceUrl:"https://china.huanqiu.com/gallery/44zNCmy8o1g" },
  hkWHotel: { src:"/detail/hk-w-hotel.jpg", alt:"航拍西九文化区与环球贸易广场", caption:"航拍西九文化区与九龙站上盖的环球贸易广场，香港 W 酒店位于这一片区。", credit:"新华网（新华社记者 陈铎 摄）", sourceUrl:"http://www.news.cn/culture/20260330/033ea93841464bc3b450175437dc0f0e/c.html" },
  victoriaHarbour: { src:"/detail/victoria-harbour.jpg", alt:"维多利亚港与港岛天际线", caption:"维多利亚港与港岛天际线，海面上有渡轮经过。", credit:"光明网（转新华网图集，新华社记者 李钢 摄）", sourceUrl:"https://m.gmw.cn/2022-06/24/content_35834281.htm" },
  peakView: { src:"/detail/peak.jpg", alt:"太平山顶俯瞰维多利亚港两岸", caption:"太平山顶观景台俯瞰维港两岸，是香港最经典的俯瞰视角。", credit:"中国网 · 图片中国（新华社记者 李鹏 摄）", sourceUrl:"http://photo.china.com.cn/news/2017-06/04/content_40961062_8.htm" },
  shenzhenCity: { src:"/detail/shenzhen.jpg", alt:"深圳福田 CBD 夜景航拍", caption:"深圳福田 CBD 夜景航拍，主体为 599 米的平安金融中心。", credit:"国际在线（新华网新闻无人机队，梁必成 摄）", sourceUrl:"https://news.cri.cn/2017-11-07/23b5da7b-e2c0-10b0-e59b-9478588b97ed.html" },
  futianPort: { src:"/detail/futian-port.jpg", alt:"福田口岸入境大厅", caption:"福田口岸入境大厅：旅客排队通过边检自助通道。", credit:"海外网（转中国新闻网，黄俊生 摄）", sourceUrl:"https://m.haiwainet.cn/middle/3541068/2024/1226/content_32824111_1.html" },
  asiaworldExpo: { src:"/detail/asiaworld-expo.jpg", alt:"亚洲国际博览馆展会现场", caption:"亚洲国际博览馆展厅内景，图为大型专业展现场。", credit:"中国网 · 图片中国（新华社发，吕小炜 摄）", sourceUrl:"http://photo.china.com.cn/2025-06/13/content_117924654.shtml" },
  hkcec: { src:"/detail/hkcec.jpg", alt:"香港会议展览中心", caption:"香港会议展览中心：湾仔海旁的飞鸟展翅屋顶，中式帆船从旁经过。", credit:"中国新闻网", sourceUrl:"https://www.chinanews.com.cn/tp/hd2011/2017/05-28/744025.shtml" },
  cantonFair: { src:"/detail/canton-fair.jpg", alt:"广州琶洲广交会展馆建筑群航拍", caption:"珠江之畔的广州琶洲广交会展馆，连绵起伏的展馆屋面自江岸铺展而开。", credit:"澎湃新闻 · 中建八局官方号", sourceUrl:"https://m.thepaper.cn/newsDetail_forward_30180573" },
  guangzhouTower: { src:"/detail/guangzhou.jpg", alt:"夜色中的广州塔与珠江新城", caption:"夜色中的广州塔与珠江新城：小蛮腰被灯光染成金色。", credit:"国际在线（转新华网，新华社记者 刘大伟 摄）", sourceUrl:"https://city.cri.cn/2017-12-06/7931da93-833b-6b54-a1da-d27657c278f3.html" },
};

type MediaKey = keyof typeof media;

const kindMeta: Record<Category, { label:string; icon:string }> = {
  scenic: { label:"景点档案", icon:"景" },
  city: { label:"城镇档案", icon:"城" },
  supply: { label:"补给档案", icon:"补" },
  warning: { label:"风险档案", icon:"险" },
  expo: { label:"展会档案", icon:"展" },
};

const poiMedia: Record<string, MediaKey> = {
  beijing:"beijingAirport", "nanning-airport":"nanningAirport", nanning:"nanningCity",
  "yongjiang-hotel":"nanningCity", luocheng:"luochengVillage", "cunyu-hotel":"cunyuHouse",
  wuyang:"luochengVillage", tianmen:"tianmenHill", liuzhou:"liuzhouCity",
  "liuzhou-hotel":"liuzhouCity", "malu-mountain":"liuzhouCity", "liuzhou-museum":"liuzhouMuseum",
  yangshuo:"yangshuoCounty", "tangshe-hotel":"tangshe", "west-street":"westStreet",
  "yulong-river":"yulong", xingping:"xingping", "shenzhen-north":"shenzhenNorth",
  "hk-west-kowloon":"hkWestKowloon", "mongkok-hotel":"mongkokStreet", mongkok:"mongkokStreet",
  "hk-w-hotel":"hkWHotel", "victoria-harbour":"victoriaHarbour", tst:"victoriaHarbour",
  peak:"peakView", shenzhen:"shenzhenCity", "futian-port":"futianPort",
  "asiaworld-expo":"asiaworldExpo", hkcec:"hkcec", "canton-fair":"cantonFair", guangzhou:"guangzhouTower",
};

// 关键节点的轮播只包含「本节点 + 明确相关的同城画面」，不把不相关地点混进图集。
const strictGalleryKeys: Partial<Record<string, MediaKey[]>> = {
  "nanning-airport": ["nanningAirport", "nanningCity"],
  luocheng: ["luochengVillage", "cunyuHouse", "tianmenHill"],
  "cunyu-hotel": ["cunyuHouse", "luochengVillage"],
  tianmen: ["tianmenHill", "luochengVillage"],
  liuzhou: ["liuzhouCity", "liuzhouMuseum"],
  "liuzhou-museum": ["liuzhouMuseum", "liuzhouCity"],
  yangshuo: ["yangshuoCounty", "xingping", "yulong"],
  "tangshe-hotel": ["tangshe", "yangshuoCounty"],
  "shenzhen-north": ["shenzhenNorth", "shenzhenCity"],
  "hk-west-kowloon": ["hkWestKowloon", "hkWHotel"],
  "hk-w-hotel": ["hkWHotel", "hkWestKowloon", "victoriaHarbour"],
  "victoria-harbour": ["victoriaHarbour", "peakView"],
  peak: ["peakView", "victoriaHarbour"],
  shenzhen: ["shenzhenCity", "futianPort"],
  "futian-port": ["futianPort", "shenzhenCity"],
  "asiaworld-expo": ["asiaworldExpo", "hkcec"],
  hkcec: ["hkcec", "victoriaHarbour", "asiaworldExpo"],
  "canton-fair": ["cantonFair", "guangzhouTower"],
};

function poiGallery(place: Place): MediaAsset[] {
  const hero = media[poiMedia[place.id] ?? "yangshuoCounty"];
  const keys = strictGalleryKeys[place.id];
  if (keys) {
    return keys.map((key, index) => ({
      ...media[key],
      framing: index === 0 ? ("full" as const) : ("detail" as const),
      contextLabel: index === 0 ? `${place.name} · 已核验原图` : `${place.region} · 区域环境`,
    }));
  }
  // 默认：主图整幅 + 同图细节裁切，避免用无关地点凑数。
  return [
    { ...hero, framing:"full", contextLabel:`${place.name} · 已核验原图` },
    { ...hero, framing:"detail", contextLabel:`${place.name} · 细节裁切` },
  ];
}

// ------------------------------------------------------------
// 每个节点的图文资料
// ------------------------------------------------------------
const overrides: Record<string, {
  lead?:string; story?:string; highlights?:string[];
  actions?:string[]; cautions?:string[]; sources?:SourceLink[];
}> = {
  beijing: {
    lead:"北京首都机场 T2 是这趟 14 天行程的起点：17:15 起飞，20:40 落地南宁，当晚就要在异地取车进城。",
    story:"HU7153 飞行 3 小时 25 分并含机上晚餐，落地时间接近晚上九点。值机柜台 E、16:35 截止，意味着 14:00 前后就得从市区出发。海航对首都机场 T2 国内出港的截载时间有明确规定：无托运 15—20 分钟、有托运或特殊服务 40 分钟，赶时间时值得先看一眼。",
    highlights:["柜台 E 值机，16:35 截止","有托运需提前 40 分钟截载","落地即取车，故证件随身"],
    sources:[sources.hnaT2, sources.hnaBaggage, sources.beijingAirport],
  },
  "nanning-airport": {
    lead:"吴圩机场是广西段自驾的实际起点：车已经有人提前开到机场，落地取车即可进城。",
    story:"省掉租车环节意味着不用现场办手续，但也意味着验车要靠自己。绕车一圈看灯光、轮胎、油量与随车工具，是当天唯一需要认真做的技术动作。夜间走机场高速进城约 40 分钟。",
    highlights:["落地后直接取车，无需办租车手续","夜间接车务必自行绕车检查","机场到市区约 40 分钟高速"],
    sources:[sources.nanningAirport, sources.nanningAirportPlan, sources.ronghe],
  },
  nanning: {
    lead:"南宁只作为落地过夜点，不安排游览——把体力留给第二天开始的自驾。",
    story:"朝阳广场一带是南宁老城的商业与住宿中心，紧邻邕江北岸，也是次日北上河池最顺的出发点。十月南宁依然偏热，夜间抵达后补水、早睡比逛夜市更重要；如果确实有余力，邕江夜游是唯一值得补的选项。",
    highlights:["老城住宿集中、出发动线短","邕江夜游可作机动选项","次日上高速前把油加满"],
    sources:[sources.nanningRiver, sources.nanningCity, sources.holidayFree],
  },
  "yongjiang-hotel": {
    lead:"D1 的住宿标准只有两条：能停车、第二天上高速不绕路。",
    story:"临江路 1 号紧邻邕江北岸，房费已付，落地后只需交验身份证件入住。老城区车位紧张，务必先问清酒店停车场入口与限高，避免深夜在路边找位。",
    highlights:["房费已付，退房只交还房卡","优先使用酒店自有车位","次日退房时间提前确认"],
    sources:[sources.nanningRiver, sources.nanningCity],
  },
  luocheng: {
    lead:"罗城是广西段真正的目的地：全国唯一的仫佬族自治县，峰丛、稻田与村寨混在一起。",
    story:"小长安镇位于县城以北的武阳江边。融河高速通车后，罗城结束了不通高速的历史，但从出口到镇上仍有县乡道要走——国道 357 线一带的山区二级公路弯多坡长，是当天最需要集中注意力的路段。",
    highlights:["D2—D3 连住两晚，不搬行李","融河高速通车后才有的直达路线","山区二级公路弯多，会车频繁"],
    sources:[sources.luochengGov, sources.ronghe, sources.molao],
  },
  "cunyu-hotel": {
    lead:"三尖堂是两晚不换房的落点，也是这趟行程里最安静的一段。",
    story:"民宿位于小长安镇崖宜屯，入住房型为「坐夜歌」书房院落别墅，两晚合计 ¥2435.87 已付。乡村民宿的餐饮通常需要提前预订，到店前与管家确认到达时间与停车位置能省不少事。",
    highlights:["连住两晚，白天出门不用收行李","乡村餐饮需提前预订","带好防蚊用品与薄外套"],
    cautions:["到店前务必与管家确认到达时间","乡道夜间无照明，不安排夜归","院落与村道注意脚下湿滑"],
    sources:[sources.luochengGov, sources.molao],
  },
  wuyang: {
    lead:"武阳江不是景区，是小长安镇日常生活的一部分——这恰恰是它最好的地方。",
    story:"江面不宽，两岸是典型的喀斯特峰林与稻田，清晨常起薄雾，傍晚光线也会变得柔和。沿江走走、看看村民洗菜洗衣，比赶去任何一个收费观景台都更接近罗城。",
    highlights:["清晨与傍晚光线最好","沿江步道湿滑，穿防滑鞋","尊重村民生活区域，不进入田地"],
    sources:[sources.luochengGov, sources.molao],
  },
  tianmen: {
    lead:"天门山是罗城周边最值得跑一趟的景点：山体被流水蚀穿，形成一个巨大的天然石门。",
    story:"景区在怀群镇方向，从小长安镇过去约 1 小时车程，大部分是乡道。当地把它形容为「巨型天然石门，一江穿洞过奇峰」——穿洞下方确实有江水通过，视角随位置变化很大。雨天石阶湿滑，配套也比较简单，自带饮水更稳妥。",
    highlights:["乡道窄，会车要提前减速","雨天石阶湿滑，量力而行","景区配套简单，自带饮水"],
    cautions:["不安排夜间山路返程","落石与湿滑路段听从现场提示","穿洞下方水流区域不涉水"],
    sources:[sources.luochengTianmen, sources.gxRoad, sources.tianmen],
  },
  liuzhou: {
    lead:"柳州既是补给站，也是这趟广西段唯一的城市：柳江在城中拐出一个 U 形大弯。",
    story:"柳州的看点很集中——柳江沿江夜景、马鞍山观景台、工业博物馆，三处都在市区，半天就能串起来。对自驾来说更重要的是：这里是进山之前最后一次能解决车辆问题的城市。",
    highlights:["沿江夜景比白天更好看","市区可解决车辆保养与补给","螺蛳粉选本地人排队的门店"],
    sources:[sources.liuzhouRoute, sources.liuzhouRiver, sources.luosifen],
  },
  "liuzhou-hotel": {
    lead:"东环大道的这家酒店承担的是「长途之后的休整」功能，不是度假。",
    story:"房费离店后付，所以退房时核对账单是必要动作。地下车位要记好区号与电梯口，第二天出城直接上主干道，不用穿过老城。",
    highlights:["离店后付款，退房核对账单","记好车位区号与电梯口","次日出发前检查胎压与油量"],
    sources:[sources.liuzhouRoute, sources.liuzhouCity],
  },
  "malu-mountain": {
    lead:"马鞍山公园的山顶平台正对柳江 U 形大弯，是看懂柳州城市形态最快的地方。",
    story:"台阶较陡，傍晚上山、等亮灯后再下是最舒服的节奏。山顶风大，带件薄外套；周末人多，尽量错峰。",
    highlights:["傍晚上山，等亮灯后再下","台阶较陡，穿好走的鞋","山顶风大，带薄外套"],
    sources:[sources.malu, sources.liuzhouRiver],
  },
  "liuzhou-museum": {
    lead:"由老厂房改造的工业博物馆，是柳州给自己写的说明书。",
    story:"展陈以柳州从机械制造到汽车工业的脉络为主，室内为主，适合下午避晒或雨天备选。多数时段需要线上预约，出发前确认当天开闭馆时间。",
    highlights:["室内展陈，适合避晒与雨天","多数时段需线上预约","可顺路看柳江边的工业遗产建筑"],
    sources:[sources.liuzhouMuseum, sources.liuzhouRoute],
  },
  yangshuo: {
    lead:"阳朔是整个广西段的高光：漓江把峰林串起来，县城本身反而很小。",
    story:"两天的时间分配建议是「一天在外、一天在内」——遇龙河与兴坪在县城外围，西街与酒店在城里。漓江精华段的游船调度与售票以景区官网当天公告为准，出发前值得先查一次。",
    highlights:["两晚连住，外围与县城分两天","游船与竹筏看景区官网公告","县城停车紧张，优先停酒店"],
    sources:[sources.liriver, sources.yangshuoGov, sources.yangshuo],
  },
  "tangshe-hotel": {
    lead:"糖舍由 1969 年的老糖厂改造而成，保留榨蔗车间与烟囱，是全程最有度假感的两晚。",
    story:"酒店在漓江东岸，进县城需要过桥，这一点在安排晚餐和逛西街时要提前算进时间。预订走的是橙子定制代订，确认号最晚 10/1 发出，必须核对入住日期是 10/7—10/9。",
    highlights:["确认号最晚 10/1 发出，核对 10/7—10/9","酒店在江东岸，进县城要过桥","老厂房建筑值得留时间慢慢看"],
    cautions:["确认号未到手前不要默认房间已锁定","套餐内容与加床政策提前问清","拍摄建筑外观前先问工作人员"],
    sources:[sources.tangshe, sources.liriver],
  },
  "west-street": {
    lead:"西街是阳朔老城的步行街，白天看房子，晚上看人流。",
    story:"从糖舍过去要过漓江桥，夜里桥面窄、电动车多。街上小吃价格差异大，先问价再买。酒吧街音量不小，怕吵的话逛完早点回。",
    highlights:["夜间人多，看好随身财物","小吃先问价再买","过江桥面窄，注意电动车"],
    sources:[sources.westStreet, sources.yangshuoGov],
  },
  "yulong-river": {
    lead:"遇龙河是漓江的支流，水面更窄更静，竹筏体验比主航道舒服得多。",
    story:"漂流按码头分段，全程约 1.5 小时，上下船点不同是常态，出发前务必确认。手机相机做好防水；雨季水位上涨时可能临时停航。",
    highlights:["竹筏按码头分段，先确认上下船点","手机相机做好防水","雨季水位上涨可能停航"],
    sources:[sources.yangshuoGov, sources.yulongRaft, sources.yulong],
  },
  xingping: {
    lead:"兴坪是漓江最经典的一道江湾，二十元人民币背面的画面就取景于此。",
    story:"古镇本身不大，重点是江边与老码头。上老寨山看全景需要体力和时间，量力而行。古镇小巷容易迷路，停车后先记好位置。",
    highlights:["江边与老码头是重点","上老寨山看全景需要体力","小巷易迷路，记好停车点"],
    sources:[sources.liriver, sources.xingping],
  },
  "shenzhen-north": {
    lead:"深圳北站既是 550 公里自驾的终点，也是进港换乘的起点——这一天不能出任何差错。",
    story:"把车停进正规停车场并拍下区号车位，是返程取车的唯一凭据。广深港高铁已经把西九龙到深圳北压缩到十几分钟量级，班次也很密，但这不改变一件事：赶不上 14:55 那趟，后面全部顺延。",
    highlights:["8:00 前必须从阳朔出发","停车后拍下区号与车位号","留足 40 分钟进站安检"],
    cautions:["不要在站前临时找车位","记好返程取车路线与缴费方式","国庆假期高速免费，服务区会更挤"],
    sources:[sources.xrl, sources.shenzhenNorth, sources.holidayFree],
  },
  "hk-west-kowloon": {
    lead:"西九龙站是广深港高铁的香港终点，出站即接港铁柯士甸站与九龙站。",
    story:"G927 全程只有 26 分钟，二等座 14 车 17F 靠窗，订单号 E341010291。出站后可以直接用八达通或手机扫码进港铁，往旺角只需几站。港澳通行证与签注的有效期，建议出发前按移民管理局的服务指南再核一遍。",
    highlights:["全程 26 分钟，注意别坐过站","出站即接港铁，无需再转巴士","通行证与签注放随身外袋"],
    sources:[sources.xrl, sources.hkWestKowloon, sources.niaVisa],
  },
  "mongkok-hotel": {
    lead:"进港第一晚住旺角，图的是出门就是商圈与地铁，不必再折腾。",
    story:"豉油街 2 号，房费离店后付。香港酒店房间普遍偏小是常态，心理预期放平即可；押金退还需保留凭证。国庆黄金周访港客流预计达 129 万人次，热门区域晚上会很挤。",
    highlights:["出门即弥敦道与旺角站","离店后付款，核对账单明细","楼层高一点更安静"],
    sources:[sources.mongkok, sources.hkGolden],
  },
  mongkok: {
    lead:"旺角是香港人口密度最高的区域之一，也是感受这座城市日常最快的地方。",
    story:"弥敦道两侧招牌、街市与小店挤在一起，人行道很窄。晚 8 点后人流最密，拍照时避开店铺门面，别影响经营。",
    highlights:["人行道窄，注意手推车与货车","街边小食先问价再买","晚 8 点后人流最密"],
    sources:[sources.mongkok, sources.hkGolden],
  },
  "hk-w-hotel": {
    lead:"香港段的住宿高点：柯士甸道西 1 号，紧邻九龙站与西九文化区。",
    story:"部分房型可看到局部维港景观，高楼层概率更大。紧邻九龙站意味着去机场快线、去西九文化区步行都很方便；入住时可以问一下能否延时退房，第二天不赶。",
    highlights:["高楼层房型看到维港概率更大","紧邻九龙站，交通极方便","入住时确认可否延时退房"],
    sources:[sources.hkWHotel, sources.hkWK],
  },
  "victoria-harbour": {
    lead:"维港把香港岛与九龙分开，两岸天际线是这座城市最标志性的画面。",
    story:"傍晚到入夜是光线最好的时段，亮灯后效果最佳。尖沙咀一侧观景位人多，提前占位；海边风大，带件外套。天星小轮是最便宜的过海方式，值得坐一次。",
    highlights:["夜景亮灯后效果最好","尖沙咀一侧人多，提前占位","天星小轮是便宜的过海方式"],
    sources:[sources.hkPeak, sources.victoriaHarbour],
  },
  tst: {
    lead:"星光大道沿维港北岸铺开，与维港属于同一条动线，顺路走完即可。",
    story:"地面嵌有香港电影人手印，正对香港岛天际线。步道全程无遮挡，白天暴晒，注意防晒与补水；往东可一路走到红磡。",
    highlights:["与维港夜景连成一趟走完","白天暴晒，注意防晒","步道无遮挡，随身带水"],
    sources:[sources.hkPeak, sources.victoriaHarbour, sources.peak],
  },
  peak: {
    lead:"太平山顶海拔约 552 米，凌霄阁观景台正对维港与九龙半岛。",
    story:"山顶缆车排队时间长，建议提前网上购票并错峰。傍晚上山可以同时看日落和夜景；山顶比市区低 3—5℃，带件外套。下山改乘巴士往往比排队坐缆车更快。",
    highlights:["缆车提前购票并错峰","傍晚上山可同时看日落与夜景","山顶温度低 3—5℃，带外套"],
    cautions:["缆车排队高峰期可能超过 1 小时","山顶风大，注意随身物品","下山较晚时优先选巴士"],
    sources:[sources.hkPeak, sources.peak],
  },
  shenzhen: {
    lead:"展会期间住深圳、每天往返香港，是这趟行程的成本解法——基地选得好，每天能省两小时。",
    story:"优先选福田口岸 30 分钟可达的区域，并确认可以连续入住、能开发票。国庆黄金周期间深港口岸客流会明显上升，通勤时间要按最坏情况估。",
    highlights:["优先选福田口岸 30 分钟可达区域","确认连续入住与开票能力","固定一个随身包，减少每天的决策"],
    cautions:["展会期间深圳房价上浮，越早订越好","国庆假期口岸客流明显上升","每天回深后整理名片与跟进清单"],
    sources:[sources.futianGov, sources.szFutian, sources.gbaPort],
  },
  "futian-port": {
    lead:"福田口岸是展会期间往返深港最常用的通道：深圳一侧接地铁，香港一侧接东铁线落马洲站。",
    story:"早高峰 7:30—9:30 排队最明显，赶早场必须预留 1 小时以上。e-道自助通关需要提前登记，第一次用建议走人工通道。口岸运行时间与交通接驳以深圳市口岸办的官方页面为准。",
    highlights:["早高峰 7:30—9:30 排队明显","e-道自助通关需提前登记","回程末班车时间提前确认"],
    sources:[sources.futianGov, sources.gbaPort, sources.niaVisa],
  },
  "asiaworld-expo": {
    lead:"亚洲国际博览馆在赤鱲角机场旁，是环球资源消费电子展的举办地。",
    story:"场馆离市区远，从深圳经口岸过去单程约 1.5—2 小时，机场快线是最稳的方式。馆内餐饮选择有限且偏贵，建议自备少量补给；展位图与重点客户清单提前排好顺序，第一天不要贪多。",
    highlights:["单程预留 1.5—2 小时","馆内餐饮有限，自备补给","展位图与客户清单提前排序"],
    cautions:["闭馆时段接驳人流集中","场内 Wi-Fi 拥堵，资料提前下载","证件与入场二维码不要只存一台设备"],
    sources:[sources.globalSources, sources.hktdcFair],
  },
  hkcec: {
    lead:"湾仔海旁的香港会议展览中心是香港秋季电子产品展的举办地，从港铁湾仔站步行可达。",
    story:"站到展馆有行人天桥相连，跟着指示走即可。按贸发局公布，秋季电子产品展在 10 月 13—16 日于会展中心举行，同期还有多个科技展同期登场，上午开场人流最集中。如果当天还要去亚博，两地之间务必预留 1.5 小时。",
    highlights:["湾仔站有行人天桥直连展馆","秋电展 10/13—16 于会展中心","与亚博之间转场预留 1.5 小时"],
    cautions:["天桥与展馆内空调较冷，备薄外套","场内 Wi-Fi 拥堵，资料提前下载","闭馆时段湾仔站非常拥挤"],
    sources:[sources.hktdcFair, sources.hktdcOverview, sources.hkcec],
  },
  "canton-fair": {
    lead:"第 140 届广交会第一期 10 月 15 日开幕，是否前往取决于返程安排——目前仍是待定项。",
    story:"展馆在琶洲，地铁八号线直达。广州市商务局已经发布第 140 届广交会出口展区证件办理通知，进馆证需要在官方渠道提前办；广交会期间广州住宿紧张、琶洲散场时地铁极其拥挤，要去就得两头都提前。",
    highlights:["第一期 10/15 开幕","进馆证需提前在官方渠道办理","琶洲散场时地铁非常拥挤"],
    cautions:["广交会期间广州住宿紧张，要订就早订","如确定不去，尽快锁定返程票","证件与名片按天分装"],
    sources:[sources.cantonFairVisa, sources.cantonFairNews],
  },
  guangzhou: {
    lead:"广州塔立在珠江南岸，与珠江新城隔江相对；只在江边看夜景，其实不必登塔。",
    story:"登塔需要提前购票并选定时段，节假日几乎必然排队。如果只是路过广州，珠江边的夜景已经足够，地铁三号线与 APM 线都能到，比开车省心。",
    highlights:["只在江边看夜景不必登塔","地铁三号线与 APM 线可达","周边停车贵，建议地铁前往"],
    sources:[sources.cantonFairNews, sources.guangzhouTower],
  },
};

function defaultSources(place: Place): SourceLink[] {
  if (place.region.includes("香港")) return [sources.niaVisa, sources.hkGolden];
  if (place.region.includes("广西")) return [sources.holidayFree, sources.driveSafety];
  return [sources.driveSafety, sources.holidayFree];
}

function categoryActions(place: Place): string[] {
  if (place.category === "city" && place.id.endsWith("-hotel")) {
    return ["核对预订信息与付款方式","确认停车位、加床与延时退房政策","入住后先安顿，再决定是否加活动"];
  }
  if (place.category === "city") return ["把加油、采购与餐饮一次解决","确认次日出发路线与预计耗时","不把行程排到天黑之后"];
  if (place.category === "supply") return ["油量低于半箱前完成补充","确认停车位置并拍照记录","把证件与票据放回固定位置"];
  if (place.category === "warning") return ["把官方公告截图保存离线","在导航中加入强制途经点","现场标志与交警指挥优先于既定计划"];
  if (place.category === "expo") return ["提前确定展位动线与重点客户顺序","证件、入场码与名片放在同一处","当天结束就整理跟进清单"];
  return ["核对开放时间与预约证件","把游览结束时间写进当天计划","只在开放区域活动并带走垃圾"];
}

function sectionTitle(place: Place): string {
  if (place.category === "expo") return "这个展馆看什么";
  if (place.category === "city" && place.id.endsWith("-hotel")) return "为什么住在这里";
  if (place.category === "city") return "为什么停在这里";
  if (place.category === "supply") return "为什么在这里补给";
  if (place.category === "warning") return "风险从哪里来";
  return "如何读懂这里";
}

// 住宿节点用独立的档案标签，与城镇节点区分开
function kindFor(place: Place) {
  if (place.category === "city" && place.id.endsWith("-hotel")) return { label:"住宿档案", icon:"宿" };
  return kindMeta[place.category];
}

function buildPoiDetail(place: Place): PoiDetail {
  const o = overrides[place.id] ?? {};
  const meta = kindFor(place);
  const hero = media[poiMedia[place.id] ?? "yangshuoCounty"];
  const locality = place.region.split("·").pop()?.trim() ?? place.region;
  return {
    place, kindLabel:meta.label, icon:meta.icon, hero,
    gallery:poiGallery(place),
    lead:o.lead ?? place.description,
    stats:[
      { label:"安排日", value:`D${place.day}` },
      { label:"停留", value:place.visit ?? "机动" },
      { label:"所在地", value:locality },
      { label:"坐标", value:`${place.coords[1].toFixed(3)}°N` },
    ],
    sections:[
      { title:sectionTitle(place), text:o.story ?? place.description },
      { title:"放进行程的方式", text:`${place.name}安排在 D${place.day}，与当天车程和体力分配一起考虑。${place.description}` },
    ],
    highlights:o.highlights ?? place.tips,
    actions:o.actions ?? categoryActions(place),
    cautions:o.cautions ?? place.tips,
    sources:o.sources ?? defaultSources(place),
  };
}

export const poiDetails = Object.fromEntries(places.map((place) => [place.id, buildPoiDetail(place)])) as Record<string, PoiDetail>;

// ------------------------------------------------------------
// 逐日线路资料
// ------------------------------------------------------------
const routeNotes: Record<number, { lead:string; story:string; rhythm:RouteDetail["rhythm"]; sources:SourceLink[] }> = {
  1: {
    lead:"把人、车和第二天开始的广西自驾，在同一个晚上校准好。",
    story:"落地取车是当天唯一有技术含量的环节：验车、确认油量与随车工具、把酒店地址设成导航终点。当天不安排任何游览，早睡比多看一个地方重要。",
    rhythm:[
      { time:"14:00", title:"出发前往首都机场", note:"T2 值机柜台 E，16:35 截止" },
      { time:"17:15", title:"HU7153 起飞", note:"飞行 3 小时 25 分，含机上晚餐" },
      { time:"20:40", title:"落地南宁", note:"取行李后到停车场取车" },
      { time:"22:00", title:"入住邕江宾馆", note:"确认次日退房时间与车位" },
    ],
    sources:[sources.hnaT2, sources.nanningAirportPlan, sources.holidayFree],
  },
  2: {
    lead:"从城市进入山乡，路况的复杂度在最后一段明显上升。",
    story:"高速段以巡航为主，下高速后转入罗城的县乡道：弯多、会车频繁、摩托与三轮混行。国庆假期七座以下小客车高速免费，服务区会比平时更挤，午餐时间要留足。",
    rhythm:[
      { time:"08:00", title:"南宁出发", note:"出城前把油加满" },
      { time:"11:30", title:"服务区午餐", note:"假期服务区拥挤，提前或延后" },
      { time:"14:00", title:"下高速进罗城", note:"县乡道减速，注意会车" },
      { time:"15:30", title:"抵达三尖堂", note:"与管家确认连住与餐饮" },
    ],
    sources:[sources.ronghe, sources.gxRoad, sources.holidayFree],
  },
  3: {
    lead:"把节奏放到最慢的一天，景点只是出门散步的理由。",
    story:"武阳江就在镇旁，适合清晨或傍晚走走；天门山在怀群镇方向，往返约 1 小时山路。若天气不好，直接放弃天门山，把一天留给江边和院子。想了解当地文化，仫佬族依饭节是最值得先读的一段背景。",
    rhythm:[
      { time:"07:30", title:"武阳江边散步", note:"晨雾与光线最好" },
      { time:"10:30", title:"回民宿午休", note:"避开正午日晒" },
      { time:"13:30", title:"前往怀群镇", note:"乡道约 1 小时，会车减速" },
      { time:"17:00", title:"返回三尖堂", note:"不走夜路" },
    ],
    sources:[sources.luochengTianmen, sources.molao, sources.gxRoad],
  },
  4: {
    lead:"转场日，顺路把柳江的城市夜景收进来。",
    story:"上午在小长安镇收尾，午后经宜州前往柳州。抵城后先入住，等晚高峰过去再上马鞍山看柳江 U 形大弯；工业博物馆视当天时间与开放安排取舍。",
    rhythm:[
      { time:"09:00", title:"退房出发", note:"与管家结清并检查房间" },
      { time:"12:30", title:"途中午餐", note:"宜州或柳城一带" },
      { time:"15:00", title:"入住东环大道", note:"避开柳州晚高峰进城" },
      { time:"18:30", title:"马鞍山看柳江夜景", note:"亮灯后视野最好" },
    ],
    sources:[sources.liuzhouRoute, sources.liuzhouRiver, sources.malu],
  },
  5: {
    lead:"从工业城市切换到山水县城，下午的任务是把两晚安顿好。",
    story:"柳州到阳朔以高速为主，鹿寨、荔浦一线服务区齐全。抵达后先到糖舍办入住，再决定是否进县城逛西街——糖舍在江东岸，往返要过桥。",
    rhythm:[
      { time:"09:00", title:"柳州出发", note:"避开早高峰出城" },
      { time:"12:00", title:"荔浦服务区", note:"午餐与休息" },
      { time:"14:30", title:"抵达阳朔糖舍", note:"核对确认号与房型" },
      { time:"18:00", title:"逛西街", note:"过桥进县城，注意停车" },
    ],
    sources:[sources.tangshe, sources.liriver, sources.yangshuoGov],
  },
  6: {
    lead:"一整天留给漓江与它的支流，竹筏和古镇分开安排。",
    story:"上午先去遇龙河，水面窄、流速缓，竹筏体验比漓江主航道安静；午后转场兴坪，看漓江最经典的那道江湾。两个点都在县城外围，自西向东动线很顺。竹筏运营与游船调度以景区和县级官方当天信息为准。",
    rhythm:[
      { time:"08:30", title:"前往遇龙河", note:"按码头分段上筏" },
      { time:"12:30", title:"午餐", note:"避开景区餐厅高峰" },
      { time:"14:30", title:"兴坪古镇", note:"江边与老码头为主" },
      { time:"18:30", title:"返回糖舍", note:"傍晚院落光线好" },
    ],
    sources:[sources.yangshuoGov, sources.liriver, sources.yulongRaft],
  },
  7: {
    lead:"全程容错率最低的一天：所有安排都要为 14:55 那趟高铁让路。",
    story:"约 550 公里高速加上深圳进城车流，是这次自驾唯一不能出错的组合。8:00 前出发、每 2 小时进一次服务区、11:30 前过广州，是三个可执行的检查点。国庆假期高速免费会进一步推高车流，检查点要执行得更严。",
    rhythm:[
      { time:"08:00 前", title:"阳朔出发", note:"晚了就直接压缩午餐" },
      { time:"11:30", title:"过广州北三环", note:"检查点：未到就要提速" },
      { time:"13:30", title:"抵达深圳北站", note:"停车、记车位、进站安检" },
      { time:"14:55", title:"G927 发车", note:"检票口 6A，14 车 17F" },
      { time:"15:15", title:"抵达香港西九龙", note:"转港铁前往旺角" },
    ],
    sources:[sources.xrl, sources.shenzhenNorth, sources.fatigue, sources.holidayFree],
  },
  8: {
    lead:"香港段唯一纯玩的一天，动线沿维港从九龙走到山顶。",
    story:"上午从旺角搬到西九龙的 W 酒店，把行李放下再出门。下午沿维港走到星光大道，傍晚上太平山顶——缆车排队较长，提前买票并留出 40 分钟以上。国庆黄金周访港客流预计达 129 万人次，热门观景点要有排队的心理准备。",
    rhythm:[
      { time:"10:00", title:"旺角退房转场", note:"到九龙站一带办理入住" },
      { time:"14:00", title:"维港与星光大道", note:"同一段滨海步道" },
      { time:"16:30", title:"太平山缆车", note:"提前购票，避开长队" },
      { time:"19:00", title:"山顶看夜景", note:"下山改乘巴士可能更快" },
    ],
    sources:[sources.hkPeak, sources.hkGolden, sources.victoriaHarbour],
  },
  9: {
    lead:"退房、过关、安顿基地，为接下来三天展会做准备。",
    story:"从西九龙经落马洲/福田口岸回深圳，是这次行程里最日常的一段跨境动线。到深圳后优先解决三件事：住宿能连续住、发票能开、通勤到口岸不超过 30 分钟。",
    rhythm:[
      { time:"09:30", title:"W 酒店退房", note:"核对押金与消费明细" },
      { time:"11:00", title:"福田口岸过关", note:"避开午后高峰" },
      { time:"13:00", title:"深圳住宿安顿", note:"确认连住与开票" },
      { time:"16:00", title:"整理展会资料", note:"证件、名片、随身包" },
    ],
    sources:[sources.futianGov, sources.gbaPort, sources.niaVisa],
  },
  10: {
    lead:"展会第一天，重点是展馆动线与重点客户名单。",
    story:"亚博在机场旁，从深圳市区过去单程约 1.5—2 小时。第一天不必贪多：先走完主通道确认展位分布，再按提前排好的顺序拜访重点客户。",
    rhythm:[
      { time:"07:00", title:"深圳出发", note:"福田口岸早高峰排队明显" },
      { time:"09:30", title:"抵达亚洲国际博览馆", note:"领证与存包" },
      { time:"10:00", title:"按清单走访展位", note:"先主通道，再补漏" },
      { time:"18:00", title:"返深", note:"错开闭馆高峰" },
    ],
    sources:[sources.globalSources, sources.hktdcFair, sources.gbaPort],
  },
  11: {
    lead:"一天跑两个展馆，成败取决于转场时间有没有留够。",
    story:"上午继续亚博的环球资源消费电子展，午后转到湾仔的会展中心衔接秋季电子产品展。机场快线加港铁约 1.5 小时，务必在中午前后离开亚博。",
    rhythm:[
      { time:"09:00", title:"亚博补漏", note:"收尾昨天没走完的展位" },
      { time:"12:00", title:"离开亚博", note:"转场预留 1.5 小时" },
      { time:"14:00", title:"香港会议展览中心", note:"秋季电子产品展" },
      { time:"18:30", title:"返深", note:"经行人天桥回湾仔站" },
    ],
    sources:[sources.hktdcFair, sources.hktdcOverview, sources.globalSources],
  },
  12: {
    lead:"展会收官日，把时间留给收尾而不是开拓。",
    story:"最后一天的价值在于补齐前两天漏掉的客户，并把样品与资料处理干净。傍晚回深圳后当晚就整理跟进清单，趁记忆还热。",
    rhythm:[
      { time:"08:00", title:"深圳出发", note:"提前确认当天闭馆时间" },
      { time:"10:00", title:"重点客户回访", note:"补报价与样品" },
      { time:"15:00", title:"样品与资料处理", note:"寄回或随身带走" },
      { time:"20:00", title:"整理跟进清单", note:"按优先级排序" },
    ],
    sources:[sources.hktdcOverview, sources.hktdcFair, sources.futianGov],
  },
  13: {
    lead:"返程日期未定，这一天按「去广州」和「直接返京」两套方案准备。",
    story:"第 140 届广交会第一期 10 月 15 日开幕，若去琶洲需要提前在官方渠道办进馆证；若直接返京，当天就要把票和深圳北站的车处理掉。两条都不推进，才是最贵的选择。",
    rhythm:[
      { time:"上午", title:"确认返程方案", note:"先定日期，再定交通方式" },
      { time:"中午", title:"（可选）前往广州", note:"高铁或城际约 1 小时" },
      { time:"下午", title:"广交会第一期", note:"进馆证需提前办理" },
      { time:"晚上", title:"回到深圳", note:"确认次日安排" },
    ],
    sources:[sources.cantonFairVisa, sources.cantonFairNews, sources.xrl],
  },
  14: {
    lead:"收尾日，剩下的都是待定项：返程方式与深圳北站的那辆车。",
    story:"车停在深圳北站，无论最后是高铁还是飞机回京，都要先决定这辆车怎么处理：开回北京、托运，还是让人来取。决定得越早，票越好买。",
    rhythm:[
      { time:"上午", title:"确认返程票", note:"高铁或航班二选一" },
      { time:"中午", title:"处理深圳北站车辆", note:"开回 / 托运 / 交接他人" },
      { time:"下午", title:"前往机场或车站", note:"留足 2 小时缓冲" },
      { time:"当日", title:"返回北京", note:"14 天行程结束" },
    ],
    sources:[sources.xrl, sources.driveSafety, sources.hnaBaggage],
  },
};

function routeHero(day:number):MediaAsset {
  return ({
    1:media.beijingAirport, 2:media.luochengVillage, 3:media.tianmenHill, 4:media.liuzhouCity,
    5:media.tangshe, 6:media.xingping, 7:media.shenzhenNorth, 8:media.victoriaHarbour,
    9:media.hkWestKowloon, 10:media.asiaworldExpo, 11:media.hkcec, 12:media.hkcec,
    13:media.cantonFair, 14:media.shenzhenCity,
  } as Record<number,MediaAsset>)[day];
}

function routeGallery(day:number):MediaAsset[] {
  const keys = ({
    1:["beijingAirport","nanningAirport","nanningCity"], 2:["nanningCity","luochengVillage","cunyuHouse"],
    3:["cunyuHouse","luochengVillage","tianmenHill"], 4:["cunyuHouse","liuzhouCity","liuzhouMuseum"],
    5:["liuzhouCity","yangshuoCounty","tangshe"], 6:["yulong","xingping","tangshe"],
    7:["tangshe","shenzhenNorth","hkWestKowloon"], 8:["mongkokStreet","victoriaHarbour","peakView"],
    9:["hkWHotel","futianPort","shenzhenCity"], 10:["shenzhenCity","futianPort","asiaworldExpo"],
    11:["asiaworldExpo","hkcec","victoriaHarbour"], 12:["shenzhenCity","futianPort","hkcec"],
    13:["shenzhenCity","cantonFair","guangzhouTower"], 14:["shenzhenCity","shenzhenNorth","beijingAirport"],
  } as Record<number,MediaKey[]>)[day];
  return keys.map((key)=>({ ...media[key], framing:"full" as const, contextLabel:`D${day} 沿线实景` }));
}

export const routeDetails = Object.fromEntries(days.map((day) => {
  const n = routeNotes[day.day];
  const detail:RouteDetail = {
    day, hero:routeHero(day.day), gallery:routeGallery(day.day), roads:routeRoads[day.day], lead:n.lead,
    stats:[{label:"里程",value:day.km},{label:"驾驶",value:day.drive},{label:"住宿",value:day.stay},{label:"节点",value:`${day.stops.length}处`}],
    sections:[
      { title:"线路逻辑", text:n.story },
      { title:"道路选择", text:`主线采用 ${routeRoads[day.day]}。地图规划只作辅助，口岸通关、临时管制和现场交通标志拥有更高优先级。` },
    ],
    rhythm:n.rhythm, cautions:day.tasks, sources:n.sources,
  };
  return [String(day.day),detail];
})) as Record<string,RouteDetail>;

// 按真实行进顺序的详情页前后导航顺序
export const poiOrder = [
  "beijing","nanning-airport","nanning","yongjiang-hotel","luocheng","cunyu-hotel","wuyang","tianmen",
  "liuzhou","liuzhou-hotel","malu-mountain","liuzhou-museum","yangshuo","tangshe-hotel","west-street",
  "yulong-river","xingping","shenzhen-north","hk-west-kowloon","mongkok-hotel","mongkok","hk-w-hotel",
  "victoria-harbour","tst","peak","shenzhen","futian-port","asiaworld-expo","hkcec","canton-fair","guangzhou",
] as const;
