"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { useContent } from "@/components/providers/ContentProvider";
import { cn, isSafeHttpUrl } from "@/lib/utils";
import type { SocialLink } from "@/types";

const icons: Record<SocialLink["id"], IconType> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  instagram: FaInstagram,
  x: FaXTwitter,
};

interface SocialLinksProps {
  ids?: SocialLink["id"][];
  showLabels?: boolean;
  className?: string;
  compact?: boolean;
}

export function SocialLinks({ ids, showLabels = false, className, compact = false }: SocialLinksProps) {
  const { content } = useContent();
  const links = ids
    ? ids
        .map((id) => content.socialLinks.find((link) => link.id === id))
        .filter((link): link is SocialLink => Boolean(link))
    : content.socialLinks;

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {links.map((link) => {
        const Icon = icons[link.id];
        const active = isSafeHttpUrl(link.url);
        const sharedClassName = cn(
          "relative inline-flex items-center justify-center rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]",
          compact ? "h-11 w-11 sm:h-9 sm:w-9" : showLabels ? "h-11 gap-3 px-4" : "h-11 w-11",
          active
            ? "border-[#d8d2c4] bg-[#fffefb] text-[#171717] hover:border-[#b18a50] hover:bg-[rgba(177,138,80,0.08)]"
            : "border-dashed border-[#d8d2c4] bg-transparent text-[#b6b0a3]",
        );

        const contentNode = (
          <>
            <Icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} aria-hidden="true" />
            {showLabels && <span className="font-accent text-[0.68rem] font-semibold uppercase tracking-[0.12em]">{active ? link.label : "ADD URL"}</span>}
            {!active && !showLabels && (
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#b18a50]/60" aria-hidden="true" />
            )}
          </>
        );

        return (
          <li key={link.id} className="relative">
            {active ? (
              <motion.a
                href={link.url as string}
                target="_blank"
                rel="noopener noreferrer"
                className={sharedClassName}
                aria-label={`Visit ${link.label} profile`}
                title={link.label}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.94 }}
              >
                {contentNode}
              </motion.a>
            ) : (
              <span
                className={sharedClassName}
                role="link"
                aria-disabled="true"
                aria-label={`${link.label} URL not added yet`}
                title={`Add a real ${link.label} URL in Content Studio`}
                data-placeholder="true"
              >
                {contentNode}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
