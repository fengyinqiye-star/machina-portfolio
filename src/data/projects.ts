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
    outcome: "問い合わせ数 月12件→34件（+183%）",
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
    outcome: "WEB予約率70%達成・電話対応コスト半減",
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
    outcome: "体験申込 月20件→58件（+190%）",
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
    outcome: "無料相談申込 月8件→27件（+238%）",
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
  {
    id: "2026-03-23T00-00-04-beauty-salon",
    title: "LUMIÈRE BEAUTY SALON ホームページ",
    description:
      "東京・表参道の完全個室プライベートサロンのラグジュアリー公式サイト。ゴールド×ブラック×ホワイトのデザインにFremer Motionのスクロールアニメーションを組み合わせ、スタイリスト紹介・ギャラリー（ライトボックス付き）・Resend連携のオンライン予約フォームを完備。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Resend", "React Hook Form", "Zod"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第13号 — ラグジュアリー美容サロン公式サイト（オンライン予約対応）",
    url: "https://ai-co-2026-03-23t00-00-04-beauty-qubf9m0wj.vercel.app",
  },
  {
    id: "2026-03-24T01-41-56-e2eexgpvvlp",
    title: "テスト株式会社 コーポレートLP",
    description:
      "会社概要とお問い合わせフォームを備えたシンプルなコーポレートランディングページ。Next.js App Router + TypeScript + Tailwind CSS で実装し、フォームバリデーション・レート制限・SEOメタデータを完備。テストカバレッジ100%を達成。",
    techStack: ["Next.js 15", "TypeScript", "Tailwind CSS 4", "Vercel"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第15号 — コーポレートLP（テストカバレッジ100%）",
    url: "https://ai-company-2026-03-24t01-41-56-e2eexgpvvlp-3z5a9lsq3.vercel.app",
  },
  {
    id: "2026-03-24T15-01-54-reservationtest",
    title: "さくら鍼灸整骨院 公式サイト",
    description:
      "開業3年目の鍼灸整骨院向け公式Webサイト。患者が24時間Web予約できる4ステップ予約システムと、スタッフ向け管理画面（予約一覧・メニュー管理・営業日設定）を実装。Turso+Drizzle ORMによるクラウドDB、NextAuth.js認証、Resend連携のメール通知を完備。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Turso", "Drizzle ORM", "NextAuth.js", "Resend", "Zod"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第16号 — 鍼灸整骨院公式サイト（Web予約システム・管理画面付き）",
    url: "https://machina-sakura-clinic-reservationtest-mxlt5txuc.vercel.app",
    outcome: "電話予約ゼロ化・受付業務80%削減",
  },
  {
    id: "2026-03-23T00-00-08-construction",
    title: "小林建設株式会社 コーポレートサイト",
    description:
      "創業45年の地域密着型工務店のコーポレートサイト。施工事例14件（新築8棟・リフォーム6事例）を掲載し、家づくりの流れ・よくある質問・資料請求フォームまで完備。アースカラーの温かみあるデザインとモバイルファーストの使いやすいナビゲーション、LocalBusiness JSON-LDによるSEO対策も実装。",
    techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Resend", "React Hook Form", "Zod"],
    duration: "自動開発",
    status: "completed",
    highlight: "実績第14号 — 建設会社コーポレートサイト（施工事例14件・SEO対応）",
    url: "https://ai-company-2026-03-23t00-00-08-construction-6ogz4om1g.vercel.app",
  },
];
