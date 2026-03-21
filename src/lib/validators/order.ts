import { z } from "zod";

export const orderSchema = z.object({
  projectName: z
    .string()
    .min(1, "案件名を入力してください")
    .max(100, "案件名は100文字以内で入力してください"),
  overview: z
    .string()
    .min(10, "概要は10文字以上で入力してください")
    .max(2000, "概要は2000文字以内で入力してください"),
  techRequirements: z
    .string()
    .max(1000, "技術要望は1000文字以内で入力してください")
    .optional(),
  contactEmail: z.string().email("有効なメールアドレスを入力してください"),
  contactName: z
    .string()
    .min(1, "お名前を入力してください")
    .max(50, "お名前は50文字以内で入力してください"),
  honeypot: z
    .string()
    .max(0, "Bot detected")
    .optional()
    .default(""),
});

export type OrderInput = z.infer<typeof orderSchema>;
