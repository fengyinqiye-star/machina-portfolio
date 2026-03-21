import type { Project } from "@/types";

/**
 * 納品済み案件一覧
 * delivererエージェントが納品時に自動追記する
 */
export const PROJECTS: Project[] = [
  {
    id: "001-portfolio-site",
    title: "AIカンパニー ポートフォリオサイト",
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
  },
];
