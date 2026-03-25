import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "受付完了",
  robots: { index: false, follow: false },
};

export default function ThanksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
