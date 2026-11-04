import type { CSSProperties, ReactNode } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { cn } from "@/lib/utils";
import type { TextRevealVariant } from "@/components/animations/TextReveal";

interface SectionHeadingProps {
  kicker: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
  /** Kept for compatibility with older section markup; headings now use word masks. */
  titleVariant?: TextRevealVariant;
  /** Set false when the caller already provides the section number. */
  showNumber?: boolean;
}

/**
 * Editorial section heading. Wrap words in *asterisks* to render them in
 * expressive italic serif. Word masks reveal with a staggered clip animation.
 */
export function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  className,
  children,
  showNumber = true,
}: SectionHeadingProps) {
  const number = kicker.match(/^(\d+)/)?.[1] ?? "01";
  const plain = title.replaceAll("*", "");
  const segments = title.split(/(\*[^*]+\*)/g).filter(Boolean);
  let wordIndex = 0;

  return (
    <div className={cn("relative", align === "center" && "text-center", className)}>
      {showNumber && (
        <span aria-hidden="true" className="ghost-number pointer-events-none absolute -top-16 right-0 hidden text-[10rem] lg:block">
          {number}
        </span>
      )}

      <ScrollReveal variant="right">
        <div className={cn("mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4", align === "center" && "justify-center")}>
          <span className="h-px w-8 bg-[#b18a50] sm:w-10" aria-hidden="true" />
          <p className="eyebrow">{kicker}</p>
          <span className="hidden h-px w-20 bg-[#ded8c9] sm:block" aria-hidden="true" />
        </div>
      </ScrollReveal>

      <h2
        aria-label={plain}
        className="max-w-5xl font-display text-[clamp(2.05rem,8.2vw,5.6rem)] font-medium leading-[1.05] tracking-[-0.05em] text-[#171717] sm:text-[clamp(2.6rem,6.4vw,5.6rem)] sm:leading-[1.02] sm:tracking-[-0.055em]"
      >
        <span aria-hidden="true">
          {segments.map((segment, segmentIndex) => {
            const isItalic = segment.startsWith("*") && segment.endsWith("*");
            const text = isItalic ? segment.slice(1, -1) : segment;
            return text.split(" ").filter(Boolean).map((word) => {
              const index = wordIndex++;
              return (
                <span
                  key={`${segmentIndex}-${index}`}
                  className={cn(
                    "js-reveal reveal--clip mr-[0.22em] inline-block",
                    isItalic && "font-luxury italic font-normal text-[#a17b42]",
                  )}
                  style={{ "--reveal-delay": `${Math.min(0.55, index * 0.055)}s` } as CSSProperties}
                >
                  {word}
                </span>
              );
            });
          })}
        </span>
      </h2>

      {description && (
        <ScrollReveal variant="up" delay={0.16}>
          <p className={cn("mt-5 max-w-2xl font-body text-sm leading-7 text-[#77756f] sm:mt-7 sm:text-base sm:leading-8", align === "center" && "mx-auto")}>
            {description}
          </p>
        </ScrollReveal>
      )}
      {children}
    </div>
  );
}
