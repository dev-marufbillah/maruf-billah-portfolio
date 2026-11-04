"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { TextReveal } from "@/components/animations/TextReveal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn, isSafeHttpUrl } from "@/lib/utils";
import type { Project } from "@/types";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const liveUrl = isSafeHttpUrl(project.liveUrl) ? (project.liveUrl as string) : null;
  const reverse = index % 2 === 1;

  const imageBlock = (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 250, damping: 24 }}
      className={cn("relative min-w-0", reverse && "lg:order-2")}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="showcase-media group/media relative block aspect-[16/11] w-full sm:aspect-[4/3] rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]"
        aria-label={`View details for ${project.name}`}
      >
        <Image
          src={project.coverImage}
          alt={project.coverAlt}
          fill
          quality={88}
          unoptimized={project.coverImage.startsWith("data:")}
          sizes="(max-width: 1024px) 100vw, 52vw"
          className="object-cover"
        />
        <span aria-hidden="true" className="absolute left-5 top-4 font-display text-[clamp(3rem,7vw,6rem)] font-medium italic leading-none tracking-[-0.08em] text-[#171717]/30 sm:text-[#171717]/20">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute bottom-4 left-4"><StatusBadge status={project.status} /></span>
        <span className="absolute bottom-4 right-4 hidden border border-[#e5e2da] bg-[#fffefb]/95 px-3 py-1.5 font-accent text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-[#6f6a60] sm:block">
          Concept preview
        </span>
      </Link>
      <span aria-hidden="true" className="absolute -bottom-3 -left-3 hidden h-16 w-16 border-b border-l border-[#b18a50] lg:block" />
    </motion.div>
  );

  const textBlock = (
    <div className={cn("min-w-0", reverse && "lg:order-1")}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#a17b42]">PROJECT {String(index + 1).padStart(2, "0")}</span>
        <span className="h-px w-8 bg-[#d8d2c4]" aria-hidden="true" />
        <span className="font-accent text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#8b8579]">{project.category}</span>
      </div>

      <h3 className="mt-5 font-display text-[clamp(2.2rem,4.4vw,4rem)] font-medium leading-[1.02] tracking-[-0.055em] text-[#171717]">
        <TextReveal text={project.name} variant="words" stagger={0.06} />
      </h3>

      <p className="mt-5 max-w-xl font-body text-sm leading-8 text-[#6f6a60] sm:text-[0.95rem]">{project.description}</p>

      <div className="mt-5 flex flex-wrap gap-2 sm:mt-7">
        {project.technologies.map((technology) => (
          <span key={technology} className="rounded-full border border-[#d8d2c4] bg-[#fffefb] px-3 py-1.5 font-accent text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#6f6a60]">
            {technology}
          </span>
        ))}
      </div>

      <p className="mt-6 border-l border-[#d8c9a9] pl-4 font-body text-xs leading-6 text-[#8b8579]">{project.contentNotice}</p>

      <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
        <Button href={`/projects/${project.slug}`} variant="solid" size="md" showArrow className="w-full sm:w-auto">View Details</Button>
        {liveUrl && (
          <Button href={liveUrl} target="_blank" variant="outline" size="md" className="w-full sm:w-auto" icon={<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}>
            Live Demo
          </Button>
        )}
        <ArrowUpRight className="ml-auto hidden h-5 w-5 text-[#c2bba9] transition-colors group-hover:text-[#a17b42] lg:block" aria-hidden="true" />
      </div>
    </div>
  );

  return (
    <article className="group grid items-center gap-6 sm:gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 xl:gap-20">
      {imageBlock}
      {textBlock}
    </article>
  );
}
