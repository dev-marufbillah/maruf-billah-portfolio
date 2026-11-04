"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowUpRight } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const STORAGE_KEY = "mb-intro-complete";

/** Lightweight, dependency-free syntax highlighting for the typed terminal. */
function highlight(line: string): ReactNode[] {
  if (line.trim() === "") return [" "];
  if (line.startsWith("$")) {
    return [
      <span key="prompt" className="code-token-keyword">$</span>,
      <span key="command" className="text-foreground/80">{line.slice(1)}</span>,
    ];
  }
  if (line.trim().startsWith("//")) {
    return [<span key="comment" className="code-token-comment">{line}</span>];
  }

  const parts = line.split(/("[^"]*"|\b(?:const|export|default|function|return|import|from|let|type|interface|async|await)\b|\b\d+\b|=>)/g);
  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith('"')) return <span key={index} className="code-token-string">{part}</span>;
    if (/^(const|export|default|function|return|import|from|let|type|interface|async|await)$/.test(part)) {
      return <span key={index} className="code-token-keyword">{part}</span>;
    }
    if (part === "=>" || /^\d+$/.test(part)) return <span key={index} className="code-token-number">{part}</span>;
    return <span key={index}>{part}</span>;
  });
}

export function Preloader() {
  const pathname = usePathname();
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();
  const { content } = useContent();
  const [visible, setVisible] = useState(true);
  const [typedCount, setTypedCount] = useState(0);
  const [phase, setPhase] = useState<"code" | "welcome" | "leave">("code");

  const { intro } = content.homepage;
  const codeText = useMemo(
    () =>
      intro.commands
        .join("\n")
        .replaceAll("{name}", content.personal.name)
        .replaceAll("{role}", content.personal.designation),
    [intro.commands, content.personal.name, content.personal.designation],
  );

  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const root = document.documentElement;
    if (root.classList.contains("intro-complete")) {
      const frame = window.requestAnimationFrame(() => setVisible(false));
      return () => window.cancelAnimationFrame(frame);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();

    const finish = () => {
      root.classList.add("intro-complete");
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Private browsing may block storage; the class still prevents a repeat in this session.
      }
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      setVisible(false);
    };

    if (prefersReducedMotion) {
      const frame = window.requestAnimationFrame(() => {
        setTypedCount(codeText.length);
        setPhase("welcome");
      });
      const hide = window.setTimeout(finish, 900);
      return () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(hide);
        document.body.style.overflow = previousOverflow;
        lenis?.start();
      };
    }

    const typingDuration = Math.min(2300, Math.max(1500, codeText.length * 10));
    const startedAt = performance.now();
    const ticker = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - startedAt) / typingDuration);
      setTypedCount(Math.round(codeText.length * progress));
      if (progress >= 1) window.clearInterval(ticker);
    }, 24);

    const welcome = window.setTimeout(() => setPhase("welcome"), typingDuration + 120);
    const leaving = window.setTimeout(() => setPhase("leave"), 3550);
    const hide = window.setTimeout(finish, 4350);

    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(welcome);
      window.clearTimeout(leaving);
      window.clearTimeout(hide);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [isHome, prefersReducedMotion, codeText, lenis]);

  const skip = () => {
    const root = document.documentElement;
    root.classList.add("intro-complete");
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage restrictions.
    }
    document.body.style.overflow = "";
    lenis?.start();
    setVisible(false);
  };

  if (!isHome || pathname.startsWith("/admin")) return null;

  const lines = codeText.slice(0, typedCount).split("\n");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="cinematic-intro fixed inset-0 z-[120] flex-col items-center justify-center overflow-hidden px-5 py-12 sm:px-8"
          role="status"
          aria-label="Welcome introduction: a short typed developer profile followed by a welcome message"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -18, transition: { duration: prefersReducedMotion ? 0.12 : 0.72, ease: [0.22, 1, 0.36, 1] } }}
        >
          {/* Warm ivory stage with editorial hairlines */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#f7f6f2]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(rgba(23,23,23,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,23,0.03) 1px, transparent 1px)", backgroundSize: "88px 88px", maskImage: "linear-gradient(to bottom, black, transparent 88%)" }} />
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(177,138,80,0.13), transparent 68%)" }} />
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full" style={{ background: "radial-gradient(circle, rgba(177,138,80,0.1), transparent 70%)" }} />

          <div className="relative z-10 flex w-full max-w-[1240px] items-center justify-between gap-3 px-5 sm:gap-4 sm:px-8" style={{ position: "absolute", top: "2rem", left: "50%", transform: "translateX(-50%)" }}>
            <span className="intro-label text-[#8d7c5e]">MARUF.B / PORTFOLIO</span>
            <button
              type="button"
              onClick={skip}
              className="editorial-link intro-skip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]"
            >
              {intro.skipLabel}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative z-10 flex w-full max-w-[820px] flex-col items-center">
            <motion.div
              className="terminal-window w-full overflow-hidden rounded-[3px]"
              animate={phase === "code" ? { y: 0, opacity: 1, scale: 1 } : { y: -14, opacity: phase === "leave" ? 0 : 0.42, scale: 0.985 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-[#e5e2da] bg-[#f4f1e9] px-4 py-3">
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-[#c9bca5]" />
                  <span className="h-2 w-2 rounded-full bg-[#d6c9ae]" />
                  <span className="h-2 w-2 rounded-full bg-[#b7a888]" />
                </div>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#8a8478]">{intro.codeTitle}</span>
                <span className="hidden font-mono text-[0.6rem] tracking-[0.12em] text-[#a9a295] sm:block">01 / 01</span>
              </div>

              <div className="min-h-[200px] px-3 py-4 font-mono text-[0.62rem] leading-[1.9] sm:min-h-[244px] sm:px-5 sm:py-5 sm:text-[0.78rem] sm:leading-[1.95]" aria-hidden="true">
                {lines.map((line, index) => (
                  <div key={index} className="gap-3 sm:gap-6 flex">
                    <span className="w-4 shrink-0 select-none text-right text-[#c2bba9] sm:w-5">{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 whitespace-pre-wrap break-words text-[#171717]">
                      {highlight(line)}
                      {index === lines.length - 1 && phase === "code" && <span className="typed-cursor" />}
                    </span>
                  </div>
                ))}
              </div>

              <div className="relative flex items-center justify-between border-t border-[#e5e2da] bg-[#faf8f3] px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#8a8478]">
                <span>{intro.footerLabel}</span>
                <span>MARUF.B</span>
                <motion.span
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[#b18a50]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0.1 : 3.7, ease: "linear" }}
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {phase !== "code" && (
                <motion.div
                  className="mt-10 text-center sm:mt-12"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
                  animate={{ opacity: phase === "leave" ? 0 : 1, y: phase === "leave" ? -18 : 0 }}
                  transition={{ duration: prefersReducedMotion ? 0.12 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.p
                    className="font-accent text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-[#a17b42]"
                    initial={prefersReducedMotion ? false : { opacity: 0, letterSpacing: "0.5em" }}
                    animate={{ opacity: 1, letterSpacing: "0.34em" }}
                    transition={{ duration: 0.8 }}
                  >
                    {intro.hello}
                  </motion.p>
                  <h2 className="mt-5 font-display text-[clamp(2.15rem,9vw,5.4rem)] font-medium leading-[1.05] tracking-[-0.05em] text-[#171717] sm:text-[clamp(2.6rem,7vw,5.4rem)] sm:leading-[1.02]">
                    {intro.welcome}
                  </h2>
                  <p className="mt-4 font-luxury text-[clamp(1.2rem,5.6vw,2.1rem)] italic text-[#a17b42] sm:text-[clamp(1.3rem,3vw,2.1rem)]">{intro.tagline}</p>
                  <motion.div
                    className="mx-auto mt-8 h-px w-40 bg-[#b18a50]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.9, delay: 0.15 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 font-accent text-[0.58rem] uppercase tracking-[0.32em] text-[#a9a295]">
            Creativity ↔ Code
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
