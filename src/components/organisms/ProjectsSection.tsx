import { PROJECTS } from "@/data/projects";

export function ProjectsSection() {
  return (
    <section id="projects" className="py-32 px-6 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
            Works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)]">実績</h2>
        </div>

        <div className="border border-[var(--border)]">
          {PROJECTS.map((project, index) => {
            const cardContent = (
              <>
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <span className="text-xs font-mono text-[var(--muted)]">
                    {String(index + 1).padStart(3, "0")}
                  </span>
                  {project.highlight && (
                    <span
                      className="text-xs px-2 py-0.5 border font-mono"
                      style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                    >
                      {project.highlight}
                    </span>
                  )}
                  <span
                    className="text-xs px-2 py-0.5 border font-mono ml-auto"
                    style={
                      project.status === "completed"
                        ? { borderColor: "var(--accent)", color: "var(--accent)" }
                        : {}
                    }
                  >
                    {project.status === "completed" ? "納品完了" : "進行中"}
                  </span>
                </div>

                <h3 className="text-2xl md:text-4xl font-bold text-[var(--text)] mb-6">
                  {project.title}
                </h3>

                <p className="text-[var(--muted)] mb-10 max-w-2xl leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-3 py-1 border border-[var(--border)] text-[var(--muted)] font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                  <span className="text-xs text-[var(--muted)] ml-auto font-mono">
                    開発時間: {project.duration}
                  </span>
                </div>
              </>
            );

            const className = "p-8 md:p-14 transition-colors border-b border-[var(--border)] last:border-b-0 block";

            return project.url ? (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={className + " hover:bg-[var(--bg-2)] cursor-pointer"}
              >
                {cardContent}
              </a>
            ) : (
              <div key={project.id} className={className + " hover:bg-[var(--bg-2)]"}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
