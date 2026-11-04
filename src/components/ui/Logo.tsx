"use client";

import { useContent } from "@/components/providers/ContentProvider";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showMark?: boolean;
}

const sizeClasses = {
  sm: { text: "text-lg", mark: "h-7 w-7 text-[0.7rem]" },
  md: { text: "text-[1.35rem]", mark: "h-9 w-9 text-[0.85rem]" },
  lg: { text: "text-3xl", mark: "h-12 w-12 text-lg" },
};

export function Logo({ className, size = "md", showMark = true }: LogoProps) {
  const { content } = useContent();
  const { logoPrimary, logoAccent, logoStyle } = content.appearance;
  const sizes = sizeClasses[size];
  const monogram = (logoPrimary.trim()[0] || "M").toUpperCase();

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {showMark && logoStyle !== "minimal" && (
        <span
          className={cn(
            "logo-mark shrink-0 rounded-[2px] font-display font-semibold leading-none tracking-[-0.06em]",
            sizes.mark,
            logoStyle === "serif" && "font-luxury italic",
          )}
          aria-hidden="true"
        >
          {monogram}
        </span>
      )}
      <span
        className={cn(
          "font-display font-semibold leading-none tracking-[-0.055em] text-[#171717]",
          sizes.text,
          logoStyle === "serif" && "font-luxury italic font-normal",
        )}
      >
        {logoPrimary}
        <span className="text-[#a17b42]">{logoAccent}</span>
      </span>
      <span className="sr-only">— Web Developer portfolio</span>
    </span>
  );
}
