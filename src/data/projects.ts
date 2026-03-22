import type { Project } from "@/types";

/**
 * 納品済み案件一覧
 * delivererエージェントが納品時に自動追記する
 */
export const PROJECTS: Project[] = [
  {
    id: "001-portfolio-site",
    title: "Machina ポートフォリオサイト",
    description:
      "受注フォーム・実績一覧・料金案内・進捗確認ページを備えたサービスサイト。このサイト自体が自動開発の実例です。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Vercel"],
    duration: "自動開発",
    status: "completed",
    highlight: "Webサービス",
  },
  {
    id: "002-todo-app",
    title: "タスク管理アプリ",
    description:
      "ドラッグ＆ドロップで並び替え、クリックでインライン編集できるタスク管理アプリ。ダークモード・滑らかなアニメーション対応のモダンなUI。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion"],
    duration: "自動開発",
    status: "completed",
    highlight: "Webアプリ",
    url: "https://ai-company-002-todo-4agoj6fue-sakinos-projects-c7083b33.vercel.app",
  },
  {
    id: "2026-03-21-clock-timer-app",
    title: "時計＆タイマーアプリ",
    description:
      "アナログ＋デジタル時計・ストップウォッチ・カウントダウンタイマーが一体のブラウザアプリ。音声アラート付き、スマホでも快適に使えるレスポンシブ対応。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Web Audio API"],
    duration: "自動開発",
    status: "completed",
    highlight: "Webアプリ",
    url: "https://ai-company-2026-03-21-clock-timer-pupncsn3l.vercel.app",
  },
  {
    id: "000-cafe-website",
    title: "Cafe Lumiere — カフェ公式サイト",
    description:
      "カフェのブランドサイト。メニュー・店舗情報・お問い合わせフォームを備え、SEO・アニメーションも完備。実店舗への集客を想定したデザイン。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Resend"],
    duration: "自動開発",
    status: "completed",
    highlight: "ブランドサイト",
    url: "https://ai-company-000-cafe-website-6p9co2h0i-sakinos-projects-c7083b33.vercel.app",
  },
  {
    id: "2026-03-22T11-27-00-tourism-recommend",
    title: "観光スポット レコメンドアプリ",
    description:
      "エリア名を入力するだけでおすすめ観光スポットが一覧表示され、地図上でルートを確認できるWebアプリ。外部API不要・無料で運用可能。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Leaflet", "OpenStreetMap"],
    duration: "自動開発",
    status: "completed",
    highlight: "Webアプリ",
    url: "https://ai-company-2026-03-22t11-27-00-mhj6jyhdr.vercel.app",
  },
  {
    id: "2026-03-22T13-48-34-e2eexgpvvlp",
    title: "シンプル ランディングページ",
    description:
      "問い合わせフォーム付きのスタイリッシュなランディングページ。サービス紹介・特徴訴求・CTA導線をシンプルにまとめたミニマルデザイン。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion"],
    duration: "自動開発",
    status: "completed",
    highlight: "LP",
    url: "https://ai-company-2026-03-22t13-48-34-e2eexgpvvlp-a4w4x68hn.vercel.app",
  },
  {
    id: "2026-03-23T00-00-02-real-estate",
    title: "株式会社タカハシ不動産 コーポレートサイト",
    description:
      "東京・神奈川エリアの地域密着型不動産会社のコーポレートサイト。物件一覧・詳細・フィルター検索・スタッフ紹介・お問い合わせフォームを完備。モバイルファーストで物件閲覧に最適化。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Resend", "React Hook Form", "Zod"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第7号 — 地域密着型不動産コーポレートサイト",
    url: "",
  },
  {
    id: "2026-03-23T00-00-07-fitness-gym",
    title: "IRON GATE FITNESS コーポレートサイト",
    description:
      "都内3店舗展開のプレミアムパーソナルトレーニングジムのコーポレートサイト。ダークトーン×ゴールドのラグジュアリーデザインにFremer Motionの強力なスクロールアニメーションを組み合わせ。体験申込フォーム・トレーナー紹介・ビフォーアフター事例掲載。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Resend", "React Hook Form", "Zod"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第8号 — プレミアムフィットネスジム コーポレートサイト",
    url: "https://ai-company-2026-03-23t00-00-07-fitne-j3gxy9p5x.vercel.app",
  },
];
