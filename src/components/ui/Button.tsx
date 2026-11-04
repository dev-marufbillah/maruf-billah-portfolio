"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/ui/Magnetic";

type ButtonVariant = "solid" | "outline" | "ghost" | "text";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  download?: boolean | string;
  target?: string;
  rel?: string;
  title?: string;
  ariaLabel?: string;
  type?: "button" | "submit" | "reset";
  showArrow?: boolean;
  icon?: ReactNode;
  magnetic?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  solid:
    "border border-[#171717] bg-[#171717] text-[#ffffff] hover:border-[#a17b42] hover:bg-[#a17b42] shadow-[0_18px_40px_-30px_rgba(23,23,23,0.7)]",
  outline:
    "border border-[#d8d2c4] bg-transparent text-[#171717] hover:border-[#b18a50] hover:bg-[rgba(177,138,80,0.07)]",
  ghost: "border border-transparent bg-transparent text-[#77756f] hover:text-[#171717] hover:bg-[rgba(23,23,23,0.04)]",
  text: "border border-transparent bg-transparent text-[#171717] hover:text-[#a17b42]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[0.66rem]",
  md: "h-12 px-5 text-[0.7rem]",
  lg: "h-[3.4rem] px-7 text-[0.72rem]",
};

export function Button({
  children,
  href,
  variant = "solid",
  size = "md",
  className,
  disabled = false,
  onClick,
  download,
  target,
  rel,
  title,
  ariaLabel,
  type = "button",
  showArrow = false,
  icon,
  magnetic = true,
}: ButtonProps) {
  const classes = cn(
    "group inline-flex items-center justify-center gap-2.5 rounded-[2px] font-accent font-semibold uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f2]",
    variants[variant],
    sizes[size],
    disabled && "cursor-not-allowed border-dashed border-[#d8d2c4] bg-transparent text-[#9b968b] opacity-80 hover:border-[#d8d2c4] hover:bg-transparent hover:text-[#9b968b]",
    className,
  );

  const content = (
    <>
      {icon}
      <span>{children}</span>
      {showArrow && (
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      )}
    </>
  );

  let control: ReactNode;

  if (disabled) {
    control = (
      <button type={type} className={classes} disabled aria-disabled="true" aria-label={ariaLabel} title={title}>
        {content}
      </button>
    );
  } else if (href) {
    const isNextLink = href.startsWith("/") && !href.includes(".") && !href.startsWith("//");
    const anchorProps = {
      className: classes,
      "aria-label": ariaLabel,
      title,
      target,
      rel: rel ?? (target === "_blank" ? "noopener noreferrer" : undefined),
      download,
    };

    control = isNextLink ? (
      <Link href={href} {...anchorProps}>
        {content}
      </Link>
    ) : (
      <a href={href} {...anchorProps}>
        {content}
      </a>
    );
  } else {
    control = (
      <button type={type} className={classes} onClick={onClick} aria-label={ariaLabel} title={title}>
        {content}
      </button>
    );
  }

  if (!magnetic) return control;

  return (
    <Magnetic strength={disabled ? 0 : 0.12} className="inline-block">
      {control}
    </Magnetic>
  );
}
