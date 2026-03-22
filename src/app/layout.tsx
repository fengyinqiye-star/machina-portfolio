import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const siteUrl = "https://ai-company-portfolio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Company - AIエージェントによる自動ソフトウェア開発",
    template: "%s | AI Company",
  },
  description:
    "複数のAIサブエージェントが協調し、受注から納品まで全自動でソフトウェア開発を行う会社。Webアプリ・業務システムの開発をAIにお任せください。",
  keywords: ["AIエージェント", "ソフトウェア開発", "自動化", "Webアプリ開発", "AI開発", "Next.js", "受託開発"],
  authors: [{ name: "AI Company" }],
  creator: "AI Company",
  openGraph: {
    title: "AI Company - AIエージェントによる自動ソフトウェア開発",
    description: "複数のAIサブエージェントが協調し、受注から納品まで全自動でソフトウェア開発を行う会社。",
    url: siteUrl,
    siteName: "AI Company",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Company - AIエージェントによる自動ソフトウェア開発",
    description: "複数のAIサブエージェントが協調し、受注から納品まで全自動でソフトウェア開発を行う会社。",
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning className={spaceGrotesk.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
