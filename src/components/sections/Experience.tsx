"use client";

import { BriefcaseBusiness, Compass, FlaskConical, Route } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { useContent } from "@/components/providers/ContentProvider";

const journeyIcons = [FlaskConical, Compass, Route];

export function Experience() {
  const { content } = useContent();
  const { experienceEntries, developmentJourney } = content;
  const hasExperience = experienceEntries.length > 0;

  return (
    <section id="experience" className="section--sand relative border-y border-[#e5e2da] py-16 sm:py-32">
      <div className="editorial-shell">
        <SectionHeading
          kicker="06 / EXPERIENCE"
          title={hasExperience ? "Professional Experience." : developmentJourney.heading}
          description={hasExperience ? "Verified professional experience." : developmentJourney.subheading}
        />

        <div className="relative mt-10 pl-9 sm:mt-14 sm:pl-16">
          <div aria-hidden="true" className="absolute left-[9px] top-2 h-[calc(100%-1rem)] w-px bg-[#ded8c9] sm:left-[15px]" />
          <div aria-hidden="true" data-timeline-progress className="timeline-progress absolute left-[9px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-[#b18a50] sm:left-[15px]" />

          {hasExperience ? (
            <div className="space-y-4 sm:space-y-6">
              {experienceEntries.map((entry, index) => (
                <ScrollReveal key={entry.id} variant="up" delay={index * 0.08}>
                  <div className="relative">
                    <span className="absolute -left-[35px] top-7 flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c9a9] bg-[#f7f6f2] text-[#a17b42] sm:-left-[51px]" aria-hidden="true">
                      <BriefcaseBusiness className="h-4 w-4" />
                    </span>
                    <article className="premium-card grid gap-5 rounded-[3px] p-5 sm:grid-cols-[0.32fr_0.68fr] sm:gap-6 sm:p-8">
                      <div>
                        <p className="font-display text-[clamp(1.5rem,2.6vw,2.2rem)] font-medium leading-tight tracking-[-0.04em] text-[#a17b42]">{entry.startDate} — {entry.endDate}</p>
                        <p className="mt-3 font-accent text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#9b968b]">{entry.employmentType}</p>
                      </div>
                      <div className="min-w-0 sm:border-l sm:border-[#e5e2da] sm:pl-7">
                        <h3 className="font-display text-2xl font-medium text-[#171717]">{entry.jobTitle}</h3>
                        <p className="mt-2 font-body text-sm text-[#a17b42]">{entry.company} · {entry.location}</p>
                        {entry.responsibilities.length > 0 && (
                          <ul className="mt-5 space-y-2 font-body text-sm leading-6 text-[#6f6a60]">
                            {entry.responsibilities.map((item) => <li key={item}>— {item}</li>)}
                          </ul>
                        )}
                        {entry.technologies.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {entry.technologies.map((item) => (
                              <span key={item} className="rounded-full border border-[#e5e2da] bg-[#fffefb] px-3 py-1 font-accent text-[0.6rem] uppercase tracking-[0.12em] text-[#6f6a60]">{item}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <>
              <ScrollReveal variant="right">
                <div className="relative">
                  <span className="absolute -left-[35px] top-7 flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c9a9] bg-[#f7f6f2] text-[#a17b42] sm:-left-[51px]" aria-hidden="true">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </span>
                  <div className="premium-card rounded-[3px] p-5 sm:p-8">
                    <EmptyState
                      icon={BriefcaseBusiness}
                      title={developmentJourney.emptyTitle}
                      description={developmentJourney.emptyDescription}
                      editPath="Content Studio → Experience & Journey"
                      className="border-0 bg-transparent p-0"
                    />
                  </div>
                </div>
              </ScrollReveal>

              <div className="mt-6 space-y-4">
                {developmentJourney.prompts.map((prompt, index) => {
                  const Icon = journeyIcons[index % journeyIcons.length];
                  return (
                    <ScrollReveal variant="clip" key={prompt.id} delay={0.06 * index}>
                      <div className="relative">
                        <span className="absolute -left-[35px] top-6 flex h-8 w-8 items-center justify-center rounded-full border border-[#ded8c9] bg-[#f7f6f2] text-[#8b8579] sm:-left-[51px]" aria-hidden="true">
                          <Icon className="h-4 w-4" />
                        </span>
                        <article className="dashed-placeholder flex flex-wrap items-start justify-between gap-4 rounded-[2px] p-5 sm:p-6">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display text-xl font-medium text-[#171717]">
                              <span className="mr-3 font-mono text-xs text-[#a17b42]">0{index + 1}</span>
                              {prompt.title}
                            </h3>
                            <p className="mt-3 font-body text-sm leading-7 text-[#6f6a60]">{prompt.prompt}</p>
                            <p className="mt-3 break-all font-mono text-[0.6rem] text-[#a9a295]">{prompt.editPath}</p>
                          </div>
                          <span className="rounded-full border border-[#d8c9a9] px-2.5 py-1 font-accent text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-[#8a6a3b]">Add details</span>
                        </article>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
