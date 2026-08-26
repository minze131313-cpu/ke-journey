import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import TextSizeToggle from './components/text-size-toggle';

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
  openGraph:{ siteName:"KE Journey", locale:"zh_CN", type:"website", images:[{ url:"/og.png", alt:"KE Journey 青甘大环线旅行路书" }] },
};

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
        {children}
        <TextSizeToggle />
      </body>
    </html>
  );
}
