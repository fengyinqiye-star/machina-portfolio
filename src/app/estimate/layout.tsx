import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "見積もりシミュレーター",
  description: "作りたいものを選ぶだけで開発費用の概算がわかります。LP・コーポレートサイト・Webアプリ・予約システムなど、プロジェクト種別と機能を選んで即時見積もり。",
  openGraph: {
    title: "見積もりシミュレーター | Machina",
    description: "作りたいものを選ぶだけで開発費用の概算がわかります。LP制作9,800円〜、Webアプリ3.8万円〜。",
    url: "https://ai-company.dev/estimate",
  },
  alternates: { canonical: "https://ai-company.dev/estimate" },
};

export default function EstimateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
