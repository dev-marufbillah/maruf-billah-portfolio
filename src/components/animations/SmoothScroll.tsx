"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/lib/use-reduced-motion";
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

  if (!enabled) return <>{children}</>;

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
      {children}
    </ReactLenis>
  );
}
