"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ScrollManager } from "@/components/animations/ScrollManager";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function LenisScrollTriggerBridge() {
  const lenis = useLenis(() => ScrollTrigger.update());

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(frame);
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const motionAllowed = useMediaQuery("(prefers-reduced-motion: no-preference)");
  // Admin / login use ONE native scroll container. Lenis calls preventDefault()
  // on wheel and caches the scroll limit at mount, which broke scrolling when
  // admin panels grew after a tab switch.
  const isPlainScroll = pathname.startsWith("/admin") || pathname.startsWith("/login");
  const enabled = !isPlainScroll && isDesktop && motionAllowed && !prefersReducedMotion;

  // Admin keeps its own scroll container; never touch the document scroll there.
  if (isPlainScroll) return <>{children}</>;

  // Mobile / reduced motion: no Lenis, but navigation scrolling must still be
  // deterministic, so ScrollManager falls back to native window scrolling.
  if (!enabled) {
    return (
      <>
        <ScrollManager />
        {children}
      </>
    );
  }

  // ScrollManager lives INSIDE ReactLenis so it can drive the Lenis instance.
  // Mounting it outside would leave Lenis free to restore the stale scroll
  // offset on its next animation frame.
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.16,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
        autoRaf: true,
      }}
    >
      <LenisScrollTriggerBridge />
      <ScrollManager />
      {children}
    </ReactLenis>
  );
}