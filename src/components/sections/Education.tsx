"use client";

import { GraduationCap } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { useContent } from "@/components/providers/ContentProvider";

export function Education() {
  const { content } = useContent();
  const { educationEntries, educationPlaceholder, educationSection } = content;

  const placeholderFields = [
    ["Institution", educationPlaceholder.institution],
    ["Degree / Qualification", educationPlaceholder.degree],
    ["Department", educationPlaceholder.department],
    ["Start year", educationPlaceholder.startYear],
    ["Completion year", educationPlaceholder.endYear],
    ["Academic result", educationPlaceholder.result],
    ["Description", educationPlaceholder.description],
  ] as const;

  return (
    <section id="education" className="relative py-16 sm:py-32">
      <div className="editorial-shell">
        <SectionHeading kicker="05 / EDUCATION" title={educationSection.heading} description={educationSection.subheading} />

        <div className="relative mt-10 pl-9 sm:mt-14 sm:pl-16">
          <div aria-hidden="true" className="absolute left-[9px] top-2 h-[calc(100%-1rem)] w-px bg-[#e5e2da] sm:left-[15px]" />
          <div aria-hidden="true" data-timeline-progress className="timeline-progress absolute left-[9px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-[#b18a50] sm:left-[15px]" />

          {educationEntries.length === 0 ? (
            <ScrollReveal variant="clip">
              <div className="relative">
                <span className="absolute -left-[35px] top-7 flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c9a9] bg-[#f7f6f2] text-[#a17b42] sm:-left-[51px]" aria-hidden="true">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <div className="premium-card rounded-[3px] p-5 sm:p-8">
                  <EmptyState
                    icon={GraduationCap}
                    title={educationSection.emptyTitle}
                    description={educationSection.emptyDescription}
                    editPath="Content Studio → Education"
                    className="border-0 bg-transparent p-0"
                  />
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {placeholderFields.map(([label]) => (
                      <div key={label} className="dashed-placeholder rounded-[2px] px-4 py-4">
                        <p className="font-accent text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#8b8579]">{label}</p>
                        <p className="mt-2 font-body text-sm text-[#a9a295]">ADD VERIFIED DETAIL</p>
                      </div>
                    ))}
                    <div className="rounded-[2px] border border-[#e2d5b8] bg-[rgba(177,138,80,0.06)] px-4 py-4 sm:col-span-2">
                      <p className="font-accent text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#a17b42]">Result is optional</p>
                      <p className="mt-2 font-body text-sm text-[#6f6a60]">Leave the result blank if you do not want to publish it.</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {educationEntries.map((entry, index) => (
                <ScrollReveal key={entry.id} variant={index % 2 ? "right" : "left"} delay={index * 0.08}>
                  <div className="relative">
                    <span className="absolute -left-[35px] top-7 flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c9a9] bg-[#f7f6f2] text-[#a17b42] sm:-left-[51px]" aria-hidden="true">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                    <article className="premium-card grid gap-5 rounded-[3px] p-5 sm:grid-cols-[0.32fr_0.68fr] sm:gap-6 sm:p-8">
                      <div>
                        <p className="font-display text-[clamp(1.7rem,3vw,2.6rem)] font-medium leading-none tracking-[-0.05em] text-[#a17b42]">
                          {entry.startYear ?? "—"}<span className="mx-1 text-[#d8d2c4]">/</span>{entry.endYear ?? "—"}
                        </p>
                        <p className="mt-3 font-accent text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#9b968b]">Academic period</p>
                      </div>
                      <div className="min-w-0 sm:border-l sm:border-[#e5e2da] sm:pl-7">
                        <h3 className="font-display text-2xl font-medium leading-snug text-[#171717]">{entry.institution}</h3>
                        <p className="mt-2 font-body text-sm text-[#a17b42]">{entry.degree}</p>
                        {entry.department && <p className="mt-3 font-body text-sm text-[#77756f]">Department: {entry.department}</p>}
                        {entry.description && <p className="mt-3 font-body text-sm leading-7 text-[#6f6a60]">{entry.description}</p>}
                        {entry.result && (
                          <span className="mt-4 inline-flex rounded-full border border-[#d8c9a9] px-3 py-1.5 font-accent text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a6a3b]">{entry.result}</span>
                        )}
                      </div>
                    </article>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
