import dynamic from "next/dynamic";
import { NavBar } from "@/components/molecules/NavBar";
import { HeroSection } from "@/components/organisms/HeroSection";
import { ServicesSection } from "@/components/organisms/ServicesSection";
import { AgentsSection } from "@/components/organisms/AgentsSection";
import { ProjectsSection } from "@/components/organisms/ProjectsSection";

// zod + react-hook-form (~250KB) を初期バンドルから切り離す
const ContactForm = dynamic(
  () => import("@/components/organisms/ContactForm").then((m) => ({ default: m.ContactForm }))
);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Machina",
  url: "https://ai-company.dev",
  description: "複数のAIサブエージェントが協調し、受注から納品まで全自動でソフトウェア開発を行う会社。",
  serviceType: "ソフトウェア開発",
  areaServed: "JP",
  availableLanguage: "Japanese",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavBar />
      <main>
        <HeroSection />
        <ServicesSection />
        <AgentsSection />
        <ProjectsSection />
        <section id="contact" className="py-32 px-6 bg-[var(--bg-2)]">
          <div className="max-w-2xl mx-auto">
            <div className="mb-12">
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
                Contact
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
                まず依頼してみる
              </h2>
              <p className="text-[var(--muted)] leading-relaxed">
                見積もり・相談は無料です。フォームを送信するだけで、
                AIエージェントが自動で分析・開発・納品まで進めます。
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <footer className="py-10 text-center text-xs text-[var(--muted)] border-t border-[var(--border)]">
        <p>© 2026 Machina. All rights reserved.</p>
        <p className="mt-1">このサイトはAIエージェントによって自動開発されました。</p>
        <p className="mt-3 flex justify-center gap-4">
          <a href="/legal" className="hover:text-[var(--text)] transition-colors">特定商取引法に基づく表記</a>
          <a href="/terms" className="hover:text-[var(--text)] transition-colors">利用規約・プライバシーポリシー</a>
        </p>
      </footer>
    </>
  );
}
