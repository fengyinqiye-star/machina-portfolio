import { redirect } from "next/navigation";

// 紹介コード付きリンク: /r/{code} → トップページに ref クエリ付きでリダイレクト
// クッキーやLocalStorageへの保存はクライアントサイドで行う
export default async function ReferralRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  // シンプルな英数字のみ許可
  const safe = /^[a-zA-Z0-9_-]{3,32}$/.test(code) ? code : "";
  if (!safe) redirect("/");
  redirect(`/?ref=${encodeURIComponent(safe)}`);
}
