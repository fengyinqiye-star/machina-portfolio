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
      "AIエージェントによる自動開発サービスを紹介するこのサイト自体。受注→要件定義→設計→実装→テスト→レビュー→納品の全工程をAIエージェントが自動実行。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Vercel"],
    duration: "13.2h (エージェント稼働)",
    status: "completed",
    highlight: "実績第1号 — このサイト自体が自動開発",
  },
  {
    id: "002-todo-app",
    title: "シンプルなタスク管理アプリ",
    description:
      "「シンプルかつおしゃれなTodoアプリ」の依頼を受注し、AIエージェントチームが全工程を自動実行。ドラッグ&ドロップ並び替え・インライン編集・ダークモード・アニメーションを備えたモダンSPA。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Radix UI"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第2号 — フォーム受注から全自動納品",
    url: "https://ai-company-002-todo-4agoj6fue-sakinos-projects-c7083b33.vercel.app",
  },
  {
    id: "2026-03-21-clock-timer-app",
    title: "クロック＆タイマー Web アプリ",
    description:
      "アナログ＋デジタル時計・ストップウォッチ・カウントダウンタイマーを統合したミニマルデザインのブラウザアプリ。Atomic Design + カスタムフック設計、22スイート153テスト全PASS、カバレッジ97%超を達成。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Web Audio API", "Jest", "React Testing Library"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第3号 — 時計・ストップウォッチ・タイマー三位一体アプリ",
    url: "https://ai-company-2026-03-21-clock-timer-pupncsn3l.vercel.app",
  },
  {
    id: "000-cafe-website",
    title: "Cafe Lumiere（カフェ ルミエール）公式Webサイト【サンプル】",
    description:
      "【デモ案件】架空のカフェを題材にしたサンプルプロジェクト。SSG・Framer Motionアニメーション・お問い合わせフォーム（Zodバリデーション・Resendメール送信）・JSON-LD/sitemap/robots SEO対応を完備。216テスト全PASS、カバレッジ81.59%達成。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "React Hook Form", "Zod", "Resend"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第4号 — カフェブランドサイト全自動納品",
    url: "https://ai-company-000-cafe-website-6p9co2h0i-sakinos-projects-c7083b33.vercel.app",
  },
  {
    id: "2026-03-22T11-27-00-tourism-recommend",
    title: "おすすめ観光スポット — 観光地レコメンド＆周遊ルートアプリ",
    description:
      "エリア名を入力するとおすすめ観光スポットが一覧表示され、Leaflet地図上でマーカー確認・周遊ルートのポリライン描画ができるWebアプリ。外部API不要・Vercel無料運用。19スイート155テスト全PASS、カバレッジ96.58%達成。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Leaflet", "react-leaflet", "OpenStreetMap", "Jest", "React Testing Library"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第5号 — 観光地レコメンド＆周遊ルート可視化アプリ",
    url: "https://ai-company-2026-03-22t11-27-00-mhj6jyhdr.vercel.app",
  },
];
