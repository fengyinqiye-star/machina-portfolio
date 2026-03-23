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
    url: "https://ai-company-2026-03-23t00-00-02-real-estate-7wzm7ktif.vercel.app",
  },
  {
    id: "2026-03-23T00-00-03-dental-clinic",
    title: "なかむら歯科クリニック ホームページ",
    description:
      "開業5年・スタッフ10名の地域密着型歯科医院の公式サイト。一般歯科・小児歯科・矯正・ホワイトニングの診療案内から、スマホ対応WEB予約フォーム・FAQアコーディオン・Googleマップ連携まで完備。白×ミントグリーンの清潔感あるデザインとFremer Motionアニメーションで患者のエンゲージメントを高める。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Resend", "React Hook Form", "Zod"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第9号 — 歯科クリニック公式サイト（WEB予約対応）",
    url: "https://ai-company-2026-03-23t00-00-03-kvbpp6sgn.vercel.app",
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
  {
    id: "2026-03-23T00-00-01-law-office",
    title: "山田・鈴木法律事務所 コーポレートサイト",
    description:
      "労働問題・離婚・相続・企業法務に強い弁護士2名の法律事務所コーポレートサイト。初回無料相談フォーム・ブログ/コラム・解決事例・FAQ・料金案内を完備。ネイビー×ホワイトの信頼感あるデザインと高カバレッジテスト（Stmts 94.79%）で品質を担保。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Resend", "MDX", "Zod"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第10号 — 法律事務所コーポレートサイト（SEO・無料相談フォーム対応）",
    url: "https://ai-company-2026-03-23t00-00-01-law-office-1qfsgb0m7.vercel.app",
  },
  {
    id: "2026-03-23T00-00-05-tax-accountant",
    title: "佐藤会計事務所 コーポレートサイト",
    description:
      "創業30年・顧問先200社以上の税理士・会計事務所のコーポレートサイト。freee・マネーフォワード・弥生のクラウド会計対応実績を前面に打ち出し、料金プラン比較テーブル・対応業種別ページ・FAQアコーディオン・無料相談申込フォームを完備。ネイビー×グレーの信頼感あるデザインとJSON-LD構造化データによるSEO対策。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Resend", "React Hook Form", "Zod"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第11号 — 会計事務所コーポレートサイト（クラウド会計・SEO特化）",
    url: "https://ai-company-2026-03-23t00-00-05-tax-accountant-l3m7l25v0.vercel.app",
  },
  {
    id: "2026-03-23T00-00-06-it-consulting",
    title: "株式会社DigitalShift ITコンサルティングLP",
    description:
      "製造業・物流・医療に特化したDXコンサルティング会社のランディングページ。業界特化・現場定着化支援を強調した濃紺×シアンのテック感あるデザインに、カウントアップアニメーション・FAQアコーディオン・無料DX診断申込フォームを完備。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Resend", "Zod"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第12号 — ITコンサルティング会社ランディングページ（DX特化）",
    url: "https://ai-company-2026-03-23t00-00-06-1y3hhvteu.vercel.app",
  },
];
