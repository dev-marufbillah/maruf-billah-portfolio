"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { applyScroll, jumpToTop, scrollToId } from "@/lib/scroll";

/**
 * One place that owns ALL navigation-related scrolling.
 *
 *  - Every forward route change (View Details, next/previous project, nav
 *    from a detail page) opens the new page at the very top, even when Lenis
 *    is running and the previous page was scrolled to the bottom.
 *  - Every hash link (/#about, #projects, the in-page TOC on a detail page,
 *    clicking the SAME nav item twice) lands on the exact target section.
 *  - Browser back restores the position you came from; forward always starts
 *    at the top. A pasted /#contact URL, reduced motion and mobile (Lenis
 *    disabled) all behave identically.
 */

/** The new route's DOM can mount (and reveal animations settle) over a few frames. */
const HASH_RETRY_DELAYS = [0, 60, 160, 320, 600];
/** Re-assert a reset in case Lenis restores a stale offset on its next RAF. */
const TOP_RETRY_DELAYS = [0, 60, 200];
/** Back restores a saved offset; give layout one extra pass to settle. */
const RESTORE_RETRY_DELAYS = [0, 60, 200, 600];
/** Ignore scroll events caused by our own programmatic jumps. */
const MEMORY_FREEZE_MS = 900;

function currentHash() {
  const raw = window.location.hash.replace(/^#/, "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function ScrollManager() {
  const pathname = usePathname();
  const lenis = useLenis();

  // `useLenis()` can be undefined on the first render (Lenis is created in an
  // effect) or when smooth scrolling is disabled. A ref keeps every handler
  // stable instead of re-running the effects whenever the instance appears.
  const lenisRef = useRef(lenis);
  const lastPath = useRef<string | null>(null);
  const lastHash = useRef<string | null>(null);
  const activePath = useRef(pathname);
  const userMoved = useRef(false);
  const popNavigation = useRef(false);
  const scrollMemory = useRef<Map<string, number>>(new Map());
  const freezeUntil = useRef(0);
  const popResetTimer = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const clearScheduled = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    if (frame.current !== null) {
      window.cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  const schedule = useCallback(
    (task: () => void, delays: number[]) => {
      clearScheduled();
      for (const delay of delays) {
        if (delay === 0) {
          frame.current = window.requestAnimationFrame(() => {
            frame.current = null;
            task();
          });
        } else {
          timers.current.push(window.setTimeout(task, delay));
        }
      }
    },
    [clearScheduled],
  );

  // ScrollTrigger and Lenis both cache the document height; a synthetic
  // resize makes them recompute it after a route swap.
  const settle = useCallback(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const mark = () => {
      userMoved.current = true;
    };
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("touchstart", mark, { passive: true });
    window.addEventListener("keydown", mark);
    return () => {
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchstart", mark);
      window.removeEventListener("keydown", mark);
    };
  }, []);

  // Remember where the user was on each page so Back can restore it.
  useEffect(() => {
    let raf: number | null = null;
    const onScroll = () => {
      if (raf !== null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        if (Date.now() < freezeUntil.current) return;
        scrollMemory.current.set(activePath.current, window.scrollY || 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Route changes + hash URLs (including a pasted /#contact link).
  useEffect(() => {
    const hash = currentHash();
    const pathChanged = lastPath.current !== pathname;
    const hashChanged = lastHash.current !== hash;
    lastPath.current = pathname;
    lastHash.current = hash;
    activePath.current = pathname;

    if (!pathChanged && !hashChanged) return;

    userMoved.current = false;
    if (pathChanged) freezeUntil.current = Date.now() + MEMORY_FREEZE_MS;

    if (!hash) {
      if (!pathChanged) return;

      if (popNavigation.current) {
        popNavigation.current = false;
        const saved = scrollMemory.current.get(pathname) ?? 0;
        const restore = () => {
          applyScroll(saved, lenisRef.current, "instant");
          settle();
        };
        schedule(restore, RESTORE_RETRY_DELAYS);
        return clearScheduled;
      }

      // Intentionally unconditional for the first 200ms: wheel momentum from
      // the previous page must not be allowed to win and leave the new page
      // at the old scroll position.
      const reset = () => {
        jumpToTop(lenisRef.current);
        settle();
      };
      schedule(reset, TOP_RETRY_DELAYS);
      return clearScheduled;
    }

    // Re-assert on every retry: reveal transforms / late layout can shift the
    // target by a few pixels after the first measurement.
    const toHash = () => {
      if (userMoved.current) return;
      if (scrollToId(hash, lenisRef.current, "instant")) settle();
    };
    schedule(toHash, HASH_RETRY_DELAYS);
    return clearScheduled;
  }, [pathname, schedule, clearScheduled, settle]);

  // Browser back / forward and any external hash change.
  useEffect(() => {
    const sync = () => {
      const hash = currentHash();
      lastHash.current = hash;
      userMoved.current = false;

      if (hash) {
        const task = () => {
          if (userMoved.current) return;
          if (scrollToId(hash, lenisRef.current, "instant")) settle();
        };
        schedule(task, HASH_RETRY_DELAYS);
        return;
      }

      const saved = scrollMemory.current.get(window.location.pathname) ?? 0;
      const restore = () => {
        applyScroll(saved, lenisRef.current, "instant");
        settle();
      };
      schedule(restore, RESTORE_RETRY_DELAYS);
    };

    const onPop = () => {
      popNavigation.current = true;
      sync();
      // A hash-only pop does not change usePathname; clear the flag so the
      // next forward navigation still starts at the top.
      if (popResetTimer.current !== null) window.clearTimeout(popResetTimer.current);
      popResetTimer.current = window.setTimeout(() => {
        popNavigation.current = false;
        popResetTimer.current = null;
      }, 600);
    };

    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", onPop);
      if (popResetTimer.current !== null) window.clearTimeout(popResetTimer.current);
      clearScheduled();
    };
  }, [schedule, clearScheduled, settle]);

  // Delegated same-page hash clicks. Capture phase runs before Next's <Link>
  // handler; preventDefault() makes Next skip the navigation while keeping
  // our own smooth scroll. Cross-page hash links (/projects/x -> /#about)
  // are intentionally NOT intercepted: Next navigates and the pathname effect
  // above lands on the right section.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const samePage = url.pathname === window.location.pathname && url.search === window.location.search;

      if (!samePage) {
        // Save BEFORE Next.js' router scrolls to top on push, otherwise the
        // memory for this page would be overwritten with 0 and Back could not
        // restore the position the user actually came from.
        scrollMemory.current.set(window.location.pathname, window.scrollY || 0);
        freezeUntil.current = Date.now() + MEMORY_FREEZE_MS;
        return; // cross-page link: Next navigates, pathname effect lands on top/hash
      }

      if (!url.hash) return;
      // Keep the skip link's native focus behaviour untouched.
      if (url.hash === "#main-content") return;

      event.preventDefault();

      const id = decodeURIComponent(url.hash.slice(1));
      const next = `${url.pathname}${url.search}${url.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next !== current) {
        // Next.js App Router syncs native pushState with usePathname /
        // useSearchParams, so the URL stays shareable without a re-render.
        window.history.pushState(null, "", next);
      }

      lastHash.current = id;
      userMoved.current = false;
      scrollToId(id, lenisRef.current, "smooth");
      // After the 0.9s animation and any reveal transform, correct the final
      // position once (a 20-30px layout shift is otherwise visible).
      schedule(() => {
        if (userMoved.current) return;
        scrollToId(id, lenisRef.current, "instant");
      }, [1000]);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [schedule]);

  return null;
}