import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const siteUrl = "https://ai-company.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Machina - AIが格安・最短納品でWebアプリを開発",
    template: "%s | Machina",
  },
  description:
    "AIエージェントが受注から納品まで全自動でWebアプリ・LPを開発。制作会社より格安、フリーランスより速い。LP制作9,800円〜、Webアプリ3.8万円〜。フォーム入力だけで即対応。",
  keywords: [
    "AI開発", "格安Web制作", "LP制作 格安", "ホームページ制作 安い",
    "Webアプリ開発 格安", "AIエージェント", "自動開発", "受託開発",
    "Next.js", "ランディングページ 制作", "HP制作 個人事業主",
    "Webサイト制作 格安", "最短納品", "AI 開発 安い",
  ],
  authors: [{ name: "Machina" }],
  creator: "Machina",
  openGraph: {
    title: "Machina - AIが格安・最短納品でWebアプリを開発",
    description: "AIエージェントが受注から納品まで全自動。LP制作9,800円〜・Webアプリ3.8万円〜。フォーム入力だけで即対応。",
    url: siteUrl,
    siteName: "Machina",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Machina - AIが格安・最短納品でWebアプリを開発",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Machina - AIが格安・最短納品でWebアプリを開発",
    description: "AIエージェントが受注から納品まで全自動。LP制作9,800円〜・Webアプリ3.8万円〜。フォーム入力だけで即対応。",
    creator: "@machina_dev",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Machina",
      url: siteUrl,
      description: "AIエージェントによる全自動ソフトウェア開発サービス",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: "Japanese",
        url: siteUrl,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Machina",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "ja",
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#service`,
      name: "AI自動Web開発サービス",
      provider: { "@id": `${siteUrl}/#organization` },
      description: "AIエージェントが受注から納品まで全自動でWebアプリ・ランディングページを開発します",
      offers: [
        {
          "@type": "Offer",
          name: "ランディングページ制作",
          priceRange: "30000-80000",
          priceCurrency: "JPY",
          description: "1ページのLP制作。最短24時間納品。",
        },
        {
          "@type": "Offer",
          name: "Webアプリ開発",
          priceRange: "150000-400000",
          priceCurrency: "JPY",
          description: "カスタムWebアプリケーション開発。",
        },
      ],
      areaServed: "JP",
      availableLanguage: "Japanese",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning className={spaceGrotesk.variable}>
      <head>
        <meta name="google-site-verification" content="CZQQhkOAPCUzWY3r0mj2Bo-920WHldfgXr0yxo0GE54" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
