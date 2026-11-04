"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One global observer for CSS-based reveals.
 * - JS adds `js-anim` before paint; without JS all content stays visible.
 * - A safety timer guarantees no element can remain hidden forever.
 * - Reduced motion / animation=off immediately marks everything visible.
 */
export function RevealManager() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealAll = () => {
      document.querySelectorAll<HTMLElement>(".js-reveal").forEach((element) => {
        element.classList.add("is-visible");
      });
    };

    if (reduced || root.dataset.animation === "off") {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    const observe = () => {
      document.querySelectorAll<HTMLElement>(".js-reveal:not(.is-visible)").forEach((element) => {
        observer.observe(element);
      });
    };

    observe();
    const mutation = new MutationObserver(observe);
    mutation.observe(document.body, { childList: true, subtree: true });
    const safety = window.setTimeout(revealAll, 4500);

    return () => {
      observer.disconnect();
      mutation.disconnect();
      window.clearTimeout(safety);
    };
  }, [pathname]);

  return null;
}
