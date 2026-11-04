"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Code2, MapPin, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { Button } from "@/components/ui/Button";
import { CodeCard } from "@/components/ui/CodeCard";
import { ResumeActions } from "@/components/ui/ResumeActions";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { useContent } from "@/components/providers/ContentProvider";
import { useReducedMotion } from "@/lib/use-reduced-motion";

function EditorialHeadline({ text }: { text: string }) {
  const segments = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  let index = 0;
  return (
    <span aria-hidden="true">
      {segments.map((segment, segmentIndex) => {
        const italic = segment.startsWith("*") && segment.endsWith("*");
        const value = italic ? segment.slice(1, -1) : segment;
        return value.split(" ").filter(Boolean).map((word) => {
          const current = index++;
          return (
            <span
              key={`${segmentIndex}-${current}`}
              className={`js-reveal reveal--clip mr-[0.2em] inline-block ${italic ? "font-luxury italic font-normal text-[#a17b42]" : ""}`}
              style={{ "--reveal-delay": `${Math.min(0.9, 0.42 + current * 0.06)}s` } as CSSProperties}
            >
              {word}
            </span>
          );
        });
      })}
    </span>
  );
}

export function Hero() {
  const { content } = useContent();
  const { personal, heroSocialIds, appearance, homepage } = content;
  const [roleIndex, setRoleIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const firstName = personal.name.split(" ")[0]?.toUpperCase() ?? "MARUF";
  const lastName = personal.name.split(" ").slice(1).join(" ").toUpperCase() || "BILLAH";

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = window.setInterval(() => setRoleIndex((index) => (index + 1) % personal.roles.length), 2800);
    return () => window.clearInterval(interval);
  }, [prefersReducedMotion, personal.roles.length]);

  return (
    <section id="home" className="relative overflow-hidden pb-14 pt-[calc(var(--nav-height)+1.5rem)] sm:pb-20 lg:min-h-[100svh] lg:pt-[calc(var(--nav-height)+2.8rem)]">
      {/* Editorial masthead */}
      <div className="editorial-shell relative z-10 mb-7 flex items-center justify-between gap-3 border-b border-[#e5e2da] pb-3 sm:mb-10 sm:gap-4 sm:pb-4">
        <span className="font-accent text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#8b8579]">Portfolio / 2026</span>
        <span className="hidden font-accent text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#8b8579] sm:block">Creative Developer · Editorial Edition</span>
        <span className="font-accent text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#a17b42]">{personal.location}</span>
      </div>

      <span aria-hidden="true" className="pointer-events-none absolute -right-10 bottom-6 hidden font-luxury text-[16rem] italic leading-none tracking-[-0.1em] text-[rgba(177,138,80,0.055)] xl:block">MB</span>

      <div className="editorial-shell grid items-start gap-8 sm:gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 xl:gap-24">
        {/* Mobile order: 1) name, 2) portrait, 3) copy — desktop: two columns. */}
        <div className="contents lg:relative lg:z-10 lg:block lg:max-w-3xl">
          <div className="order-1 lg:order-none">
          <ScrollReveal variant="right" delay={0.05}>
            <div className="mb-5 flex items-center gap-3">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#b18a50]" aria-hidden="true" />
              <span className="eyebrow">{homepage.hero.eyebrow}</span>
              <span className="h-px w-14 bg-[#d8d2c4]" aria-hidden="true" />
            </div>
          </ScrollReveal>

          <h1
            aria-label={personal.name.toUpperCase()}
            className="font-display text-[clamp(2.55rem,10vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.075em] text-[#171717] sm:text-[clamp(2.9rem,7.1vw,6.5rem)] sm:leading-[0.88]"
          >
            <span className="block"><TextReveal text={firstName} mode="chars" variant="chars" stagger={0.055} delay={0.08} /></span>
            <span className="block"><TextReveal text={lastName} mode="chars" variant="wave" childClassName="text-[#a17b42]" stagger={0.055} delay={0.24} /></span>
          </h1>

          <ScrollReveal variant="right" delay={0.4}>
            <div className="mt-5 flex items-center gap-4 sm:mt-6">
              <span className="h-px w-10 bg-[#b18a50] sm:w-12" aria-hidden="true" />
              <span className="font-accent text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#8b8579]">01 / Introduction</span>
            </div>
          </ScrollReveal>
          </div>

          <div className="order-3 lg:order-none">
          <h2
            aria-label={homepage.hero.headline.replaceAll("*", "")}
            className="mt-5 max-w-2xl font-display text-[clamp(1.65rem,3.05vw,2.85rem)] font-medium leading-[1.16] tracking-[-0.045em] text-[#171717]"
          >
            <EditorialHeadline text={homepage.hero.headline} />
          </h2>

          <ScrollReveal variant="up" delay={0.72}>
            <p className="mt-5 max-w-xl font-body text-sm leading-7 text-[#6f6a60] sm:text-[0.95rem]">{personal.heroDescription}</p>
          </ScrollReveal>

          <ScrollReveal variant="left" delay={0.78}>
            <div className="mt-5 flex h-9 items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b18a50]" aria-hidden="true" />
              <div className="relative flex h-9 min-w-0 items-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={personal.roles[roleIndex]}
                    initial={prefersReducedMotion ? false : { y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { y: -16, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="whitespace-nowrap font-accent text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#a17b42] sm:text-sm"
                  >
                    {personal.roles[roleIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="scale" delay={0.86}>
            <div className="mt-7 flex flex-col items-stretch gap-5 sm:items-start">
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <Button href="#projects" size="lg" showArrow className="w-full sm:w-auto">Explore My Work</Button>
                <ResumeActions variant="hero" />
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <SocialLinks ids={heroSocialIds} />
                <span className="hidden font-accent text-[0.6rem] uppercase tracking-[0.16em] text-[#9b968b] sm:inline">Manage links in Content Studio</span>
              </div>
            </div>
          </ScrollReveal>
          </div>
        </div>

        {/* Right: asymmetric portrait composition — second on mobile */}
        <div className="relative order-2 mx-auto w-full max-w-[500px] lg:order-none lg:max-w-none lg:pt-0">
          <div data-gsap-parallax aria-hidden="true" className="absolute -left-10 top-10 hidden h-40 w-40 border border-[rgba(177,138,80,0.35)] sm:block" />
          <div data-gsap-parallax aria-hidden="true" className="absolute -bottom-10 -right-6 hidden h-52 w-40 border border-[#ded8c9] sm:block" />

          <span className="absolute -left-8 top-1/2 hidden -translate-y-1/2 -rotate-90 font-accent text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-[#a9a295] xl:block">
            {homepage.hero.portraitLabel}
          </span>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.03, clipPath: "inset(8% 6% 8% 6%)" }}
            animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.1, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="portrait-mat relative mx-auto aspect-[4/5] w-[88%] max-w-[340px] sm:w-[80%] sm:max-w-[420px] lg:w-full"
          >
            <div className="relative h-full w-full overflow-hidden bg-[#efeee8]">
              {appearance.showProfilePhoto ? (
                <Image
                  src={personal.profileImage}
                  alt={personal.profileAlt}
                  fill
                  priority
                  quality={90}
                  unoptimized={personal.profileImage.startsWith("data:")}
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 80vw, 440px"
                  className="object-cover object-[center_22%]"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6"><CodeCard className="w-full" /></div>
              )}
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-3 border border-[#e5e2da] bg-[#fffefb]/95 px-3 py-2.5 sm:inset-x-3 sm:bottom-3 sm:px-4 sm:py-3">
                <span className="inline-flex items-center gap-2 font-accent text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#171717]">
                  <MapPin className="h-3 w-3 text-[#a17b42]" aria-hidden="true" />
                  {personal.location}
                </span>
                <span className="hidden font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[#8b8579] sm:inline">{homepage.hero.portraitCaption}</span>
              </div>
            </div>
          </motion.div>

          <div className="mx-auto mt-4 flex w-[88%] max-w-[340px] items-center justify-between gap-3 border-y border-[#e5e2da] py-3 sm:hidden">
            <span className="whitespace-nowrap font-accent text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#a17b42] sm:text-[0.66rem] sm:tracking-[0.2em]">{homepage.hero.portraitLabel}</span>
            <span className="text-right font-accent text-[0.56rem] uppercase leading-4 tracking-[0.08em] text-[#8b8579] sm:text-[0.6rem] sm:tracking-[0.12em]">
              <span className="sm:hidden">{personal.designation}</span>
              <span className="hidden sm:inline">{homepage.hero.portraitCaption}</span>
            </span>
          </div>

          {appearance.showCodeMotifs && (
            <>
              <motion.div
                className="float-soft absolute -left-6 top-[18%] hidden items-center gap-2 border border-[#e5e2da] bg-[#fffefb] px-4 py-2.5 font-accent text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#6f6a60] shadow-[0_20px_50px_-35px_rgba(23,23,23,0.5)] sm:flex"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <Code2 className="h-3.5 w-3.5 text-[#a17b42]" aria-hidden="true" /> Clean interfaces
              </motion.div>
              <motion.div
                className="float-soft absolute -right-4 top-[46%] hidden items-center gap-2 border border-[#e5e2da] bg-[#fffefb] px-4 py-2.5 font-accent text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#6f6a60] shadow-[0_20px_50px_-35px_rgba(23,23,23,0.5)] sm:flex"
                initial={prefersReducedMotion ? false : { opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.14, duration: 0.6 }}
                style={{ animationDelay: "1.2s" }}
              >
                <Sparkles className="h-3.5 w-3.5 text-[#a17b42]" aria-hidden="true" /> Interactive details
              </motion.div>
              <CodeCard compact className="ml-auto mr-1 mt-9 hidden w-[260px] shadow-2xl sm:block" />
            </>
          )}
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-6 left-6 hidden flex-col items-center gap-3 font-accent text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[#8b8579] transition-colors hover:text-[#a17b42] lg:flex xl:left-10"
        aria-label="Scroll to about section"
      >
        {homepage.hero.scrollLabel}
        <span className="relative flex h-12 w-5 items-start justify-center rounded-full border border-[#d8d2c4] pt-2">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-[#b18a50]"
            animate={prefersReducedMotion ? undefined : { y: [0, 12, 0], opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        <ArrowDown className="sr-only" aria-hidden="true" />
      </a>
    </section>
  );
}
