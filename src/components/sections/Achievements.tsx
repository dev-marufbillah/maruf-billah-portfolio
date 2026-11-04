"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, ExternalLink, Medal } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { useContent } from "@/components/providers/ContentProvider";
import { isSafeHttpUrl } from "@/lib/utils";

export function Achievements() {
  const { content } = useContent();
  const { achievements, achievementsSection } = content;

  return (
    <section id="achievements" className="relative border-t border-[#e5e2da] py-16 sm:py-32">
      <div className="editorial-shell">
        <SectionHeading kicker="08 / RECOGNITION" title={achievementsSection.heading} description={achievementsSection.subheading} />

        <div className="mt-10 sm:mt-14">
          {achievements.length === 0 ? (
            <ScrollReveal variant="up">
              <div className="premium-card rounded-[3px] p-5 sm:p-8">
                <EmptyState
                  icon={Award}
                  title={achievementsSection.emptyTitle}
                  description={achievementsSection.emptyDescription}
                  editPath={achievementsSection.editPath}
                  className="border-0 bg-transparent p-0"
                />
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {["Certificate name", "Issuing organization", "Issue date / URL"].map((label) => (
                    <div key={label} className="dashed-placeholder rounded-[2px] px-4 py-5">
                      <p className="font-accent text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#8b8579]">{label}</p>
                      <p className="mt-2 font-body text-sm text-[#a9a295]">ADD VERIFIED DETAIL</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement, index) => {
                const hasUrl = isSafeHttpUrl(achievement.url);
                return (
                  <ScrollReveal variant="right" key={achievement.id} delay={index * 0.06}>
                    <article className="premium-card flex h-full flex-col rounded-[3px] p-6">
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] text-[#a17b42]">
                          <Medal className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="font-mono text-[0.62rem] text-[#b0aa9c]">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      {achievement.image && (achievement.image.startsWith("/") || achievement.image.startsWith("data:")) && (
                        <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-[2px] border border-[#e5e2da]">
                          <Image src={achievement.image} alt={`${achievement.name} certificate`} fill sizes="400px" unoptimized={achievement.image.startsWith("data:")} className="object-cover" />
                        </div>
                      )}
                      <h3 className="mt-5 font-display text-xl font-medium text-[#171717]">{achievement.name}</h3>
                      <p className="mt-2 font-body text-sm text-[#77756f]">{achievement.issuer}</p>
                      <p className="mt-1 font-body text-xs text-[#9b968b]">{achievement.issueDate}</p>
                      {hasUrl && (
                        <Link href={achievement.url as string} target="_blank" rel="noopener noreferrer" className="editorial-link mt-6">
                          Verify certificate <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      )}
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
