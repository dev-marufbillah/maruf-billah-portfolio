"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** A small, GPU-friendly GSAP layer for parallax and timeline drawing. */
export function GsapScrollScenes() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (reduceMotion || isMobile) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-gsap-parallax]").forEach((element) => {
        const trigger = element.closest("section") || element;
        gsap.fromTo(
          element,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-timeline-progress]").forEach((element) => {
        const trigger = element.parentElement || element;
        gsap.fromTo(
          element,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger,
              start: "top 75%",
              end: "bottom 60%",
              scrub: 0.6,
            },
          },
        );
      });
    });

    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(frame);
      context.revert();
    };
  }, [pathname]);

  return null;
}
