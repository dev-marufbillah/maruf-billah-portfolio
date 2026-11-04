"use client";

import { Quote } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useContent } from "@/components/providers/ContentProvider";
import { cn } from "@/lib/utils";

export function About() {
  const { content } = useContent();
  const { about } = content.personal;

  return (
    <section id="about" className="relative py-16 sm:py-32">
      <div className="editorial-shell">
        <SectionHeading kicker="03 / ABOUT ME" title={about.heading} description={about.subheading} />

        <div className="mt-11 grid gap-8 sm:mt-16 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 xl:gap-28">
          {/* Editorial statement */}
          <div className="min-w-0">
            <ScrollReveal variant="right">
              <div className="relative border-t border-[#e5e2da] pt-8">
                <Quote className="h-7 w-7 text-[#b18a50]" aria-hidden="true" />
                <p className="mt-6 font-display text-[clamp(1.55rem,2.8vw,2.5rem)] font-medium leading-[1.32] tracking-[-0.035em] text-[#171717]">
                  {about.verifiedIntro}
                </p>
                <span className="mt-7 block h-px w-24 bg-[#b18a50]" aria-hidden="true" />
              </div>
            </ScrollReveal>

            <ScrollReveal variant="up" delay={0.1}>
              <div className="mt-8 sm:mt-10">
                <p className="eyebrow eyebrow--dark mb-5">Verified at a glance</p>
                <dl className="divide-y divide-[#e5e2da] border-y border-[#e5e2da]">
                  {about.verifiedFacts.map((fact, index) => (
                    <div key={`${fact.label}-${index}`} className="flex items-baseline justify-between gap-6 py-4">
                      <dt className="font-accent text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#8b8579]">{fact.label}</dt>
                      <dd className="text-right font-display text-lg font-medium text-[#171717]">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 font-body text-xs leading-6 text-[#9b968b]">
                  Only provided information is shown. Everything below is an editable placeholder for your own words.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Personal detail placeholders */}
          <div className="min-w-0">
            <ScrollReveal variant="left" delay={0.08}>
              <div className="mb-6 flex items-end justify-between gap-4">
                <h3 className="font-luxury text-[clamp(1.6rem,3vw,2.4rem)] italic leading-tight text-[#a17b42]">The person behind the work</h3>
                <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#b0aa9c] sm:block">08 FIELDS · EDITABLE</span>
              </div>
            </ScrollReveal>

            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              {about.fields.map((field, index) => (
                <ScrollReveal key={field.id} variant={index % 3 === 0 ? "up" : index % 3 === 1 ? "clip" : "right"} delay={0.04 * index}>
                  <article
                    className={cn(
                      "group h-full min-h-[132px] border p-4 transition-colors duration-300 hover:border-[#b18a50] sm:min-h-[168px] sm:p-5",
                      field.isPlaceholder ? "dashed-placeholder rounded-[2px]" : "rounded-[2px] border-[#e5e2da] bg-[#fffefb]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-mono text-[0.62rem] tracking-[0.12em] text-[#b18a50]">{String(index + 1).padStart(2, "0")}</span>
                      {field.isPlaceholder && (
                        <span className="font-accent text-[0.54rem] font-semibold uppercase tracking-[0.12em] text-[#9b968b]">Add your words</span>
                      )}
                    </div>
                    <h4 className="mt-3 font-display text-lg font-medium leading-snug text-[#171717] sm:mt-4">{field.question}</h4>
                    <p className={cn("mt-1.5 font-body text-[0.78rem] leading-6 sm:mt-2", field.isPlaceholder ? "text-[#8b8579]" : "text-[#6f6a60]")}>{field.answer}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
