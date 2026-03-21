"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { orderSchema, type OrderInput } from "@/lib/validators/order";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";

export function ContactForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: { honeypot: "" },
  });

  const onSubmit = async (data: OrderInput) => {
    setServerError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/thanks");
    } else {
      const json = await res.json();
      setServerError(json.error ?? "送信に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Honeypot（ボット対策） */}
      <input
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none"
        {...register("honeypot")}
      />

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 border border-red-500/30 bg-red-500/5 text-sm text-red-500"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {serverError}
        </div>
      )}

      <FormField label="案件名" htmlFor="projectName" error={errors.projectName?.message} required>
        <Input
          id="projectName"
          placeholder="例: ECサイトのバックエンドAPI開発"
          error={errors.projectName?.message}
          {...register("projectName")}
        />
      </FormField>

      <FormField label="案件概要" htmlFor="overview" error={errors.overview?.message} required>
        <Textarea
          id="overview"
          rows={5}
          placeholder="どのようなものを作りたいか、目的・機能・規模感などをご記入ください"
          error={errors.overview?.message}
          {...register("overview")}
        />
      </FormField>

      <FormField label="技術要望" htmlFor="techRequirements" error={errors.techRequirements?.message}>
        <Textarea
          id="techRequirements"
          rows={3}
          placeholder="使いたい技術スタック、制約条件など（任意）"
          error={errors.techRequirements?.message}
          {...register("techRequirements")}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField label="お名前" htmlFor="contactName" error={errors.contactName?.message} required>
          <Input
            id="contactName"
            placeholder="山田 太郎"
            error={errors.contactName?.message}
            {...register("contactName")}
          />
        </FormField>

        <FormField label="メールアドレス" htmlFor="contactEmail" error={errors.contactEmail?.message} required>
          <Input
            id="contactEmail"
            type="email"
            placeholder="example@company.com"
            error={errors.contactEmail?.message}
            {...register("contactEmail")}
          />
        </FormField>
      </div>

      <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full">
        案件を依頼する →
      </Button>

      <p className="text-xs text-center text-[var(--muted)]">
        送信後、AIオーケストレーターが内容を分析し、ご入力のメールアドレスへご連絡いたします。
      </p>
    </form>
  );
}
