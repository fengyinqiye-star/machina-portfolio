import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "案件ダッシュボード",
  description: "ご依頼済みの案件一覧と進捗をメールアドレスで確認できます。",
  openGraph: {
    title: "案件ダッシュボード | Machina",
    description: "ご依頼済みの案件一覧と進捗をメールアドレスで確認できます。",
    url: "https://ai-company.dev/dashboard",
  },
  alternates: { canonical: "https://ai-company.dev/dashboard" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
