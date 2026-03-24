import { PROJECTS } from "@/data/projects";

export function ProjectsSection() {
  return (
    <section id="projects" className="py-32 px-6 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
            Works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)]">実績</h2>
        </div>

        <p className="text-xs text-[var(--muted)] mb-6 border border-[var(--border)] px-4 py-3">
          ※ 掲載している実績はすべてデモ・サンプル案件です。実際の顧客情報は含まれません。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
          {PROJECTS.map((project) => {
            const inner = (
              <>
                {project.highlight && (
                  <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
                    {project.highlight.replace(/実績第\d+号 — /, "")}
                  </p>
                )}
                <h3 className="text-base font-bold text-[var(--text)] mb-2 leading-snug">
                  {project.title}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {project.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] px-2 py-0.5 border border-[var(--border)] text-[var(--muted)] font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                {project.url && (
                  <p className="text-xs font-mono mt-3" style={{ color: "var(--accent)" }}>
                    サイトを見る →
                  </p>
                )}
              </>
            );

            const cls = "p-6 bg-[var(--bg)] flex flex-col transition-colors min-h-[180px]";

            return project.url ? (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cls + " hover:bg-[var(--bg-2)] cursor-pointer"}
              >
                {inner}
              </a>
            ) : (
              <div key={project.id} className={cls + " hover:bg-[var(--bg-2)]"}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
