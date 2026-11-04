"use client";

import type Lenis from "lenis";

/**
 * Matches `--nav-height` (84px) + `scroll-padding-top` (20px) in globals.css.
 * Every programmatic scroll uses this offset so section titles are never
 * hidden behind the fixed navbar.
 */
export const SCROLL_OFFSET = 104;

export type ScrollMode = "instant" | "smooth";

type MaybeLenis = Lenis | null | undefined;

/** Returns the absolute document Y for a section id, or null if it is not in the DOM yet. */
export function targetTop(id: string): number | null {
  const key = id.trim();
  if (!key || key === "home" || key === "top") return 0;

  const element = document.getElementById(key);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const current = window.scrollY || document.documentElement.scrollTop || 0;
  return Math.max(0, Math.round(rect.top + current - SCROLL_OFFSET));
}

/**
 * Lenis keeps its own `animatedScroll` / `targetScroll`. Calling only
 * `window.scrollTo()` is overwritten on Lenis' next animation frame, which is
 * why a route change used to reopen the new page at the OLD scroll position.
 * Always drive Lenis when it exists, and use native scrolling otherwise.
 */
export function applyScroll(top: number, lenis: MaybeLenis, mode: ScrollMode) {
  if (lenis) {
    lenis.resize();
    if (mode === "instant") {
      lenis.scrollTo(top, { immediate: true, force: true });
    } else {
      lenis.scrollTo(top, { duration: 0.9, force: true });
    }
    return;
  }

  window.scrollTo({ top, left: 0, behavior: mode === "instant" ? "instant" : "smooth" });
  if (mode === "instant") {
    document.documentElement.scrollTop = top;
    document.body.scrollTop = top;
  }
}

export function jumpToTop(lenis: MaybeLenis) {
  applyScroll(0, lenis, "instant");
}

/** Returns false when the target element has not mounted yet (caller retries). */
export function scrollToId(id: string, lenis: MaybeLenis, mode: ScrollMode = "instant"): boolean {
  const top = targetTop(id);
  if (top === null) return false;
  applyScroll(top, lenis, mode);
  return true;
}