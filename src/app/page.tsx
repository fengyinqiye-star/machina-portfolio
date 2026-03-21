import { NavBar } from "@/components/molecules/NavBar";
import { HeroSection } from "@/components/organisms/HeroSection";
import { ServicesSection } from "@/components/organisms/ServicesSection";
import { ProjectsSection } from "@/components/organisms/ProjectsSection";
import { ContactForm } from "@/components/organisms/ContactForm";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <ServicesSection />
        <ProjectsSection />
        <section id="contact" className="py-32 px-6 bg-[var(--bg-2)]">
          <div className="max-w-2xl mx-auto">
            <div className="mb-12">
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
                Contact
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
                案件のご依頼
              </h2>
              <p className="text-[var(--muted)] leading-relaxed">
                AIカンパニーに開発をお任せください。
                受注後、AIエージェントチームが全工程を自動で進めます。
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <footer className="py-10 text-center text-xs text-[var(--muted)] border-t border-[var(--border)]">
        <p>© 2026 AI Company. All rights reserved.</p>
        <p className="mt-1">このサイトはAIエージェントによって自動開発されました。</p>
      </footer>
    </>
  );
}
