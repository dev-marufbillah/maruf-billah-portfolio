"use client";

import type { CSSProperties, ReactNode } from "react";

export type RevealVariant = "up" | "left" | "right" | "clip" | "scale" | "blur" | "flip";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  /** Kept for compatibility with existing section markup. */
  y?: number;
  amount?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: ScrollRevealProps) {
  const style = {
    "--reveal-delay": `${delay}s`,
  } as CSSProperties;

  return (
    <div className={`js-reveal reveal--${variant} ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}
