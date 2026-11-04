"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useContent } from "@/components/providers/ContentProvider";

export function Projects() {
  const { content } = useContent();
  const { projects, projectsSection } = content;

  return (
    <section id="projects" className="relative py-16 sm:py-32">
      <div className="editorial-shell">
        <SectionHeading kicker="07 / SELECTED WORK" title={projectsSection.heading} description={projectsSection.subheading}>
          <ScrollReveal variant="up" delay={0.2}>
            <div className="mt-6 flex max-w-3xl sm:mt-8 items-start gap-3 rounded-[2px] border border-[#e2d5b8] bg-[rgba(177,138,80,0.06)] p-4 font-body text-xs leading-6 text-[#7a5f34]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b18a50]" aria-hidden="true" />
              <p>{projectsSection.notice}</p>
            </div>
          </ScrollReveal>
        </SectionHeading>

        <div className="mt-10 space-y-12 sm:mt-16 sm:space-y-28">
          {projects.map((project, index) => (
            <ScrollReveal key={project.slug} variant={index % 2 === 0 ? "right" : "left"} delay={0.06}>
              <ProjectCard project={project} index={index} />
              {index < projects.length - 1 && <div className="hairline mt-12 sm:mt-28" aria-hidden="true" />}
            </ScrollReveal>
          ))}
        </div>

        {projects.length === 0 && (
          <p className="mt-10 font-body text-sm text-[#8b8579] sm:mt-14">Add projects in Content Studio → Projects to populate this showcase.</p>
        )}
      </div>
    </section>
  );
}
