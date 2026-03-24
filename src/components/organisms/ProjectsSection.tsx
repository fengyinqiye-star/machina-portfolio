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

        <div className="border border-[var(--border)]">
          {PROJECTS.map((project, index) => {
            const inner = (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="text-xs font-mono text-[var(--muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {project.highlight && (
                    <span
                      className="text-xs px-2 py-0.5 border font-mono"
                      style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                    >
                      {project.highlight}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-4">
                  {project.title}
                </h3>

                <p className="text-[var(--muted)] mb-8 max-w-2xl leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-3 py-1 border border-[var(--border)] text-[var(--muted)] font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.url && (
                    <span
                      className="text-sm font-mono flex-shrink-0"
                      style={{ color: "var(--accent)" }}
                    >
                      サイトを見る →
                    </span>
                  )}
                </div>
              </>
            );

            const cls =
              "p-8 md:p-14 border-b border-[var(--border)] last:border-b-0 block transition-colors";

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
