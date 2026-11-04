"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const spring = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.001,
  });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-[#b18a50] via-[#d3b986] to-[#8a6a3b]"
      style={{ scaleX: prefersReducedMotion ? scrollYProgress : spring }}
    />
  );
}
