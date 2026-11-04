"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Info, Layers3, Link2Off } from "lucide-react";
import { FaGithub as Github } from "react-icons/fa6";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useContent } from "@/components/providers/ContentProvider";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn, isSafeHttpUrl } from "@/lib/utils";
import type { Project, ProjectDetailSection } from "@/types";

export function ProjectDetails({ slug }: { slug: string }) {
  const { content } = useContent();
  const prefersReducedMotion = useReducedMotion();
  const projects = content.projects;
  const index = projects.findIndex((item) => item.slug === slug);
  const project = index >= 0 ? projects[index] : null;

  if (!project) {
    return (
      <section className="editorial-shell flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow">Project not found</p>
        <h1 className="mt-5 font-display text-4xl font-medium text-[#171717]">This project does not exist yet.</h1>
        <p className="mt-4 max-w-lg font-body text-sm leading-7 text-[#77756f]">Add it from Content Studio → Projects, or return to the featured project list.</p>
        <div className="mt-8"><Button href="/#projects" icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>Back to projects</Button></div>
      </section>
    );
  }

  const previous: Project | null = index > 0 ? projects[index - 1] : null;
  const next: Project | null = index < projects.length - 1 ? projects[index + 1] : null;
  const liveUrl = isSafeHttpUrl(project.liveUrl) ? project.liveUrl : null;
  const repoUrl = isSafeHttpUrl(project.repoUrl) ? project.repoUrl : null;

  const findSection = (id: string) =>
    project.detailSections.find((section) => section.id === id) ??
    ({ id, title: id, items: ["EDIT: Add verified project information."], isPlaceholder: true } satisfies ProjectDetailSection);

  const sections: ProjectDetailSection[] = [
    findSection("overview"),
    findSection("objectives"),
    { id: "technology-stack", title: "Main technology stack", items: project.technologies, isPlaceholder: false },
    findSection("features"),
    findSection("process"),
    findSection("challenges"),
    findSection("solutions"),
    findSection("improvements"),
  ];

  return (
    <article className="pb-24 pt-[calc(var(--nav-height)+3rem)] sm:pt-[calc(var(--nav-height)+5rem)]">
      <div className="editorial-shell">
        <ScrollReveal variant="right">
          <Button href="/#projects" variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />} magnetic={false}>Back to projects</Button>
        </ScrollReveal>

        <header className="mt-10 grid gap-8 border-b border-[#e5e2da] pb-12 lg:grid-cols-[1fr_0.66fr] lg:items-end">
          <div>
            <ScrollReveal variant="up">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <p className="eyebrow">{project.category}</p>
                <StatusBadge status={project.status} />
              </div>
            </ScrollReveal>
            <h1 className="font-display text-[clamp(2.8rem,6.8vw,6.4rem)] font-medium leading-[0.94] tracking-[-0.065em] text-[#171717]">
              <TextReveal text={project.name} variant="words" stagger={0.06} />
            </h1>
          </div>
          <ScrollReveal variant="left" delay={0.12}>
            <p className="font-body text-sm leading-8 text-[#6f6a60] sm:text-base">{project.description}</p>
          </ScrollReveal>
        </header>

        <ScrollReveal variant="clip" delay={0.12}>
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, clipPath: "inset(6% 4% 6% 4%)" }}
            whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="showcase-media mt-12 rounded-[3px]"
          >
            <div className="relative aspect-[16/10]">
              <Image src={project.coverImage} alt={project.coverAlt} fill priority quality={88} unoptimized={project.coverImage.startsWith("data:")} sizes="(max-width: 1240px) 100vw, 1200px" className="object-cover" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e2da] bg-[#fffefb] px-4 py-3 sm:px-6">
              <p className="font-body text-xs text-[#77756f]">{project.contentNotice}</p>
              <span className="rounded-full border border-[#d8d2c4] px-3 py-1 font-accent text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-[#8b8579]">Replaceable asset</span>
            </div>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal variant="up">
          <div className="mt-6 flex items-start gap-3 rounded-[2px] border border-[#e2d5b8] bg-[rgba(177,138,80,0.06)] p-4 font-body text-xs leading-6 text-[#7a5f34]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{project.contentNotice}</p>
          </div>
        </ScrollReveal>

        {(liveUrl || repoUrl) && (
          <ScrollReveal variant="scale">
            <div className="mt-6 flex flex-wrap gap-3">
              {liveUrl && <Button href={liveUrl} target="_blank" variant="solid" showArrow>Live Website</Button>}
              {repoUrl && <Button href={repoUrl} target="_blank" variant="outline" icon={<Github className="h-4 w-4" aria-hidden="true" />}>GitHub Repository</Button>}
            </div>
          </ScrollReveal>
        )}
        {!liveUrl && !repoUrl && (
          <ScrollReveal variant="right">
            <div className="mt-6 flex items-center gap-3 rounded-[2px] border border-[#e5e2da] bg-[#fffefb] px-4 py-3 font-body text-xs text-[#8b8579]">
              <Link2Off className="h-4 w-4" aria-hidden="true" />No working live website or repository URL has been added, so both external buttons are hidden.
            </div>
          </ScrollReveal>
        )}

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.3fr_0.7fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="premium-card rounded-[3px] p-6">
              <p className="eyebrow">Project dossier</p>
              <nav aria-label="Project detail sections" className="mt-5 space-y-0.5">
                {sections.map((section, sectionIndex) => (
                  <a key={section.id} href={`#${section.id}`} className="flex items-center justify-between border-b border-[#eeeae0] py-2.5 font-body text-[0.82rem] text-[#6f6a60] transition-colors hover:text-[#a17b42]">
                    <span>{section.title}</span>
                    <span className="font-mono text-[0.6rem] text-[#b0aa9c]">0{sectionIndex + 1}</span>
                  </a>
                ))}
              </nav>
              <div className="mt-6 border-t border-[#e5e2da] pt-5">
                <p className="eyebrow">Project status</p>
                <div className="mt-3"><StatusBadge status={project.status} /></div>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <ScrollReveal key={section.id} variant={sectionIndex % 3 === 0 ? "up" : sectionIndex % 3 === 1 ? "clip" : "right"} delay={sectionIndex * 0.03}>
                <section id={section.id} className={cn("scroll-mt-28 rounded-[3px] p-5 sm:p-7", section.isPlaceholder ? "dashed-placeholder" : "border border-[#e5e2da] bg-[#fffefb]")}>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-[#171717]">{section.title}</h2>
                    <span className="font-mono text-xs text-[#a17b42]">0{sectionIndex + 1}</span>
                  </div>
                  {section.id === "technology-stack" ? (
                    <div className="flex flex-wrap gap-2">
                      {section.items.map((item) => (
                        <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[#d8c9a9] bg-[rgba(177,138,80,0.06)] px-3 py-2 font-accent text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#8a6a3b]">
                          <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />{item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={`${section.id}-${itemIndex}`} className="flex gap-3 font-body text-sm leading-7 text-[#6f6a60]">
                          <span className={cn("mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full", section.isPlaceholder ? "bg-[#b18a50]" : "bg-[#a17b42]")} aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.isPlaceholder && <p className="mt-5 border-t border-[#ded8c9] pt-4 font-accent text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#8a6a3b]">Editable in Content Studio → Projects</p>}
                </section>
              </ScrollReveal>
            ))}

            <ScrollReveal variant="scale">
              <div className="rounded-[3px] border border-[#e5e2da] bg-[#fffefb] p-5 sm:p-7">
                <div className="mb-4 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-[#a17b42]" aria-hidden="true" />
                  <h2 className="font-display text-xl font-medium text-[#171717]">Project links</h2>
                </div>
                {liveUrl || repoUrl ? (
                  <div className="flex flex-wrap gap-3">
                    {liveUrl && <Button href={liveUrl} target="_blank" variant="outline" size="sm" showArrow>Live Website</Button>}
                    {repoUrl && <Button href={repoUrl} target="_blank" variant="outline" size="sm" icon={<Github className="h-3.5 w-3.5" aria-hidden="true" />}>GitHub Repository</Button>}
                  </div>
                ) : (
                  <p className="font-body text-sm leading-7 text-[#77756f]">Only real, working URLs are displayed. Add <span className="font-mono">liveUrl</span> or <span className="font-mono">repoUrl</span> in Content Studio → Projects.</p>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {previous ? (
            <Link href={`/projects/${previous.slug}`} className="premium-card group rounded-[3px] p-6 transition-colors hover:border-[#b18a50]">
              <span className="eyebrow flex items-center gap-2"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Previous project</span>
              <span className="mt-3 block font-display text-2xl font-medium text-[#171717] group-hover:text-[#a17b42]">{previous.name}</span>
            </Link>
          ) : (
            <div className="dashed-placeholder rounded-[3px] p-6"><span className="eyebrow">Previous project</span><p className="mt-3 font-body text-sm text-[#9b968b]">This is the first project.</p></div>
          )}
          {next ? (
            <Link href={`/projects/${next.slug}`} className="premium-card group rounded-[3px] p-6 text-right transition-colors hover:border-[#b18a50]">
              <span className="eyebrow flex items-center justify-end gap-2">Next project <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
              <span className="mt-3 block font-display text-2xl font-medium text-[#171717] group-hover:text-[#a17b42]">{next.name}</span>
            </Link>
          ) : (
            <div className="dashed-placeholder rounded-[3px] p-6 text-right"><span className="eyebrow">Next project</span><p className="mt-3 font-body text-sm text-[#9b968b]">This is the latest project.</p></div>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <Button href="/#projects" variant="outline" icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />} magnetic={false}>Back to all projects</Button>
        </div>
      </div>
    </article>
  );
}
