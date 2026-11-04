"use client";

import type { CSSProperties } from "react";

export type TextRevealVariant = "words" | "chars" | "clip" | "wave";

interface TextRevealProps {
  text: string;
  className?: string;
  childClassName?: string;
  mode?: "words" | "chars";
  variant?: TextRevealVariant;
  stagger?: number;
  delay?: number;
  once?: boolean;
}

export function TextReveal({
  text,
  className,
  childClassName,
  mode = "words",
  variant,
  stagger = 0.045,
  delay = 0,
}: TextRevealProps) {
  const resolvedVariant = variant ?? (mode === "chars" ? "chars" : "words");
  const pieces = mode === "chars" ? Array.from(text) : text.split(" ");
  const parentStyle = {
    "--text-stagger": `${stagger}s`,
    "--reveal-delay": `${delay}s`,
  } as CSSProperties;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        data-mode={mode}
        className={`js-reveal text-reveal text-reveal--${resolvedVariant} ${className ?? ""}`}
        style={parentStyle}
      >
        {pieces.map((piece, index) => (
          <span
            key={`${piece}-${index}`}
            className={`text-piece ${mode === "words" ? "text-piece--word" : ""}`}
            style={{ "--i": index } as CSSProperties}
          >
            <span className={`text-piece__inner ${childClassName ?? ""}`}>
              {piece === " " ? "\u00A0" : piece}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}
