import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import TextSizeToggle from './components/text-size-toggle';
import ThemeSwitcher from './components/theme-switcher';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ke-journey.bordy.cn"),
  title: { default:"KE Journey｜可以出发的旅行路书", template:"%s｜KE Journey" },
  description:"自驾旅行路线、交互地图、逐日行程、住宿补给与风险提示。",
  manifest:"/manifest.webmanifest",
  openGraph:{ siteName:"KE Journey", locale:"zh_CN", type:"website", images:[{ url:"/og.jpg", alt:"KE Journey 青甘大环线旅行路书" }] },
};

// viewport-fit=cover：让 iOS 刘海屏/Home 指示条下 env(safe-area-inset-*) 真正生效
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// 首帧前恢复主题，避免暗色用户看到白闪（FOUC）
const themeBootScript = `try{var t=localStorage.getItem('ke-journey-theme');if(t==='alpine'||t==='dusk'){document.documentElement.dataset.theme=t;}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {children}
        <ThemeSwitcher />
        <TextSizeToggle />
      </body>
    </html>
  );
}
