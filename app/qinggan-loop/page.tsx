import type { Metadata } from "next";
import QingganMap from "../components/qinggan-map";

export const metadata: Metadata = {
  title: "青甘大环线｜12日自驾地图｜KE Journey",
  description: "青甘环线完整自驾路书、景点、住宿、补给和道路风险地图。",
};

export default function Page() {
  return <QingganMap />;
}
