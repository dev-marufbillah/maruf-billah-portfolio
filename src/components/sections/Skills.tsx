"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechIcon } from "@/components/ui/TechIcon";
import { useContent } from "@/components/providers/ContentProvider";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

export function Skills() {
  const { content } = useContent();
  const { skillCategories } = content;
  const { skills } = content.homepage;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="skills" className="section--pure relative border-y border-[#e5e2da] py-16 sm:py-32">
      <div className="editorial-shell">
        <SectionHeading kicker={skills.kicker} title={skills.heading} description={skills.lead} />

        <div className="mt-11 grid gap-4 sm:mt-16 sm:grid-cols-2 xl:grid-cols-4">
          {skillCategories.map((category, categoryIndex) => (
            <ScrollReveal key={category.id} variant={categoryIndex % 2 === 0 ? "up" : "clip"} delay={0.06 * categoryIndex}>
              <motion.article
                whileHover={prefersReducedMotion ? undefined : { y: -5 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="premium-card group flex h-full min-h-[230px] flex-col rounded-[3px] p-5 sm:min-h-[310px] sm:p-7"
              >
                <span aria-hidden="true" className="ghost-number absolute -top-3 right-4 text-[6rem]">
                  0{categoryIndex + 1}
                </span>
                <div className="relative">
                  <span className="h-px w-10 bg-[#b18a50]" aria-hidden="true" />
                  <h3 className="mt-5 font-accent text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#a17b42]">{category.label}</h3>
                  <p className="mt-2 font-body text-xs leading-6 text-[#9b968b]">{category.description}</p>
                </div>

                <ul className="relative mt-5 flex-1 space-y-1 sm:mt-7">
                  {category.skills.map((skill) => (
                    <li key={skill.name}>
                      <div className="flex items-center gap-3 border-b border-[#eeeae0] py-2 transition-colors sm:py-2.5 duration-300 group-hover:border-[#e2d7bf]">
                        <TechIcon name={skill.icon} size={17} className="shrink-0 text-[#8a8478] transition-colors duration-300 group-hover:text-[#a17b42]" />
                        <span className="font-body text-[0.82rem] font-medium text-[#3d3a34]">{skill.name}</span>
                        {skill.proficiency !== null && (
                          <span className="ml-auto font-mono text-[0.62rem] text-[#a17b42]">{skill.proficiency}%</span>
                        )}
                      </div>
                    </li>
                  ))}
                  {category.skills.length === 0 && (
                    <li className="dashed-placeholder rounded-[2px] px-3 py-4 font-body text-xs leading-6 text-[#8b8579]">
                      EDIT: Add verified technologies for this category in Content Studio.
                    </li>
                  )}
                </ul>

                <div className={cn("relative mt-5 flex items-center justify-between border-t border-[#e5e2da] pt-4 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#b0aa9c]")}>
                  <span>{String(category.skills.length).padStart(2, "0")} tools</span>
                  <span>EDITABLE</span>
                </div>
              </motion.article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="up" delay={0.18}>
          <p className="mt-8 max-w-2xl font-body text-xs leading-6 text-[#8b8579]">
            No proficiency percentages are invented. If you add a verified value in Content Studio, it appears next to the technology.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
