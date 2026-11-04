"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Terminal } from "lucide-react";
import { FaGithub as Github } from "react-icons/fa6";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { TechIcon } from "@/components/ui/TechIcon";
import { useContent } from "@/components/providers/ContentProvider";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn, isSafeHttpUrl } from "@/lib/utils";

export function DeveloperIdentity() {
  const { content } = useContent();
  const { identity } = content.homepage;
  const { skillCategories, socialLinks } = content;
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(identity.files[0]?.id ?? "profile");
  const [copied, setCopied] = useState(false);

  const files = identity.files.length ? identity.files : [];
  const activeFile = files.find((file) => file.id === activeId) ?? files[0];
  const github = socialLinks.find((link) => link.id === "github");
  const githubUrl = github && isSafeHttpUrl(github.url) ? (github.url as string) : null;

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyCode = () => {
    if (!activeFile || !navigator.clipboard) return;
    void navigator.clipboard.writeText(activeFile.code).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  return (
    <section id="identity" className="section--sand relative border-y border-[#e5e2da] py-16 sm:py-32">
      <div className="editorial-shell">
        <SectionHeading kicker={identity.kicker} title={identity.heading} description={identity.lead} />

        <div className="mt-11 grid items-start sm:mt-16 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 xl:gap-24">
          {/* Interactive light code editor */}
          <ScrollReveal variant="right" className="min-w-0">
            <div className="code-window overflow-hidden rounded-[3px]">
              <div className="flex items-center justify-between border-b border-[#e5e2da] bg-[#f4f1e9] px-3 py-2.5 sm:px-4">
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-[#c9bca5]" />
                  <span className="h-2 w-2 rounded-full bg-[#d6c9ae]" />
                  <span className="h-2 w-2 rounded-full bg-[#b7a888]" />
                </div>
                <span className="hidden items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#8a8478] sm:inline-flex">
                  <Terminal className="h-3 w-3" aria-hidden="true" /> workspace
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex h-9 items-center gap-1.5 rounded-[2px] sm:h-7 border border-[#d8d2c4] bg-[#fffefb] px-2.5 font-accent text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#6f6a60] transition-colors hover:border-[#b18a50] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]"
                  aria-label={copied ? "Code copied" : "Copy code to clipboard"}
                >
                  {copied ? <Check className="h-3 w-3 text-[#5f7a5f]" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* File tabs */}
              <div role="tablist" aria-label={identity.filesTitle} className="flex flex-wrap gap-0 border-b border-[#e5e2da] bg-[#faf8f3]">
                {files.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    role="tab"
                    aria-selected={file.id === activeFile?.id}
                    aria-controls="identity-code-panel"
                    onClick={() => setActiveId(file.id)}
                    className={cn(
                      "relative border-r border-[#e5e2da] px-4 py-3 font-mono text-[0.65rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#b18a50] sm:px-5",
                      file.id === activeFile?.id ? "bg-[#ffffff] text-[#171717]" : "text-[#9b968b] hover:text-[#171717]",
                    )}
                  >
                    {file.label}
                    {file.id === activeFile?.id && <span className="absolute inset-x-0 top-0 h-[2px] bg-[#b18a50]" />}
                  </button>
                ))}
              </div>

              <div id="identity-code-panel" role="tabpanel" className="min-w-0 bg-[#ffffff]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFile?.id ?? "empty"}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {activeFile ? (
                      <CodeBlock code={activeFile.code} minHeight="min-h-[240px] sm:min-h-[286px]" />
                    ) : (
                      <div className="flex min-h-[240px] items-center justify-center p-6 sm:min-h-[286px] sm:p-8 text-sm text-[#9b968b]">Add a code file in Content Studio → Homepage &amp; Intro.</div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between border-t border-[#e5e2da] bg-[#faf8f3] px-4 py-2.5 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#8a8478]">
                <span>{activeFile?.fileName ?? "workspace"}</span>
                <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#b18a50]" /> TypeScript · UTF-8</span>
              </div>
            </div>

            <p className="mt-4 font-body text-xs leading-6 text-[#9b968b]">
              Real, readable snippets. Switch files or copy the code — this is a working editor visual, not a screenshot.
            </p>
          </ScrollReveal>

          {/* Philosophy + stack */}
          <div className="min-w-0">
            <ScrollReveal variant="left" delay={0.08}>
              <div className="border-l-2 border-[#b18a50] pl-6">
                <p className="eyebrow">{identity.philosophyTitle}</p>
                <p className="mt-5 font-display text-[clamp(1.3rem,5.4vw,1.95rem)] sm:text-[clamp(1.4rem,2.2vw,1.95rem)] font-medium leading-[1.42] tracking-[-0.03em] text-[#171717]">
                  {identity.philosophyBody}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="up" delay={0.16}>
              <div className="mt-10">
                <p className="eyebrow eyebrow--dark mb-5">Technology stack</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-7">
                  {skillCategories.slice(0, 4).map((category) => (
                    <div key={category.id} className="min-w-0">
                      <div className="flex items-baseline justify-between gap-3 border-b border-[#e5e2da] pb-2">
                        <h3 className="font-accent text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#a17b42]">{category.label}</h3>
                        <span className="font-mono text-[0.6rem] text-[#b0aa9c]">{String(category.skills.length).padStart(2, "0")}</span>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {category.skills.slice(0, 4).map((skill) => (
                          <li key={skill.name} className="flex items-center gap-2.5 font-body text-[0.82rem] text-[#6f6a60]">
                            <TechIcon name={skill.icon} size={14} className="shrink-0 text-[#a17b42]" />
                            {skill.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="up" delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[#e5e2da] pt-6 sm:mt-10 sm:pt-7">
                {githubUrl ? (
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="editorial-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]">
                    <Github className="h-4 w-4 text-[#a17b42]" aria-hidden="true" />
                    {identity.githubLabel}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 font-accent text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9b968b]" title={identity.githubPlaceholder}>
                    <Github className="h-4 w-4" aria-hidden="true" />
                    {identity.githubPlaceholder}
                  </span>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
