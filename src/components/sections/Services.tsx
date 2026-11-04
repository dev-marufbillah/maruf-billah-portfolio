"use client";

import { motion } from "framer-motion";
import {
  Gauge,
  Layers3,
  LayoutTemplate,
  PenTool,
  ShoppingBag,
  Smartphone,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useContent } from "@/components/providers/ContentProvider";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const iconMap: Record<string, LucideIcon> = {
  LayoutTemplate,
  Smartphone,
  Layers3,
  ShoppingBag,
  PenTool,
  Waypoints,
  Gauge,
};

export function Services() {
  const { content } = useContent();
  const { services, servicesSection } = content;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="services" className="section--sand relative border-y border-[#e5e2da] py-16 sm:py-32">
      <div className="editorial-shell">
        <SectionHeading kicker="09 / SERVICES" title={servicesSection.heading} description={servicesSection.subheading}>
          <ScrollReveal variant="up" delay={0.18}>
            <p className="mt-7 font-body text-xs leading-6 text-[#8b8579]">{servicesSection.notice}</p>
          </ScrollReveal>
        </SectionHeading>

        <div className="mt-10 grid gap-x-16 sm:mt-14 gap-y-0 border-t border-[#ded8c9] lg:grid-cols-2">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] ?? LayoutTemplate;
            return (
              <ScrollReveal key={service.id} variant={index % 2 === 0 ? "up" : "clip"} delay={0.04 * index}>
                <motion.article
                  whileHover={prefersReducedMotion ? undefined : { x: 6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className="group flex gap-4 border-b border-[#ded8c9] py-5 sm:gap-7 sm:py-8"
                >
                  <span className="mt-1 font-mono text-[0.64rem] tracking-[0.12em] text-[#b18a50]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] text-[#a17b42] transition-colors duration-300 group-hover:border-[#b18a50]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-medium leading-snug tracking-[-0.025em] text-[#171717] sm:text-[1.45rem]">{service.title}</h3>
                    <p className="mt-2 font-body text-[0.82rem] leading-6 text-[#6f6a60] sm:leading-7">{service.description}</p>
                    {service.isProposed && (
                      <span className="mt-3 inline-flex items-center gap-2 font-accent text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[#9b968b]">
                        <span className="h-1 w-1 rounded-full bg-[#b18a50]" aria-hidden="true" /> Proposed offering
                      </span>
                    )}
                  </div>
                </motion.article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
