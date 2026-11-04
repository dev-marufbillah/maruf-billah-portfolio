"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowUp, Settings2 } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { Logo } from "@/components/ui/Logo";
import { SocialLinks } from "@/components/ui/SocialLinks";

export function Footer() {
  const pathname = usePathname();
  const lenis = useLenis();
  const { content } = useContent();
  const year = new Date().getFullYear();
  const { navigation, personal, homepage } = content;
  const hrefFor = (href: string) => (pathname === "/" ? href : `/${href}`);

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.1 });
      return;
    }
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <footer className="relative border-t border-[#e5e2da] bg-[#efeee8]">
      <div className="editorial-shell pt-12 sm:pt-20">
        <div className="grid gap-9 sm:gap-12 lg:grid-cols-[1.35fr_0.85fr_0.8fr] lg:gap-16">
          <div>
            <Logo size="md" />
            <p className="mt-7 max-w-md font-display text-[clamp(1.7rem,3vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.04em] text-[#171717]">
              Building <span className="font-luxury italic text-[#a17b42]">digital experiences</span> with code &amp; creativity.
            </p>
            <p className="mt-5 max-w-sm font-body text-sm leading-7 text-[#77756f]">{personal.shortTagline}</p>
          </div>

          <div>
            <p className="eyebrow mb-6">Navigate</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              {navigation.map((item) => (
                <li key={item.id}>
                  <Link href={hrefFor(item.href)} className="font-accent text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#6f6a60] transition-colors hover:text-[#a17b42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin" className="inline-flex items-center gap-1.5 font-accent text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#a17b42] transition-colors hover:text-[#171717]">
                  <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Studio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-6">Connect</p>
            <SocialLinks compact />
            <p className="mt-5 font-body text-xs leading-6 text-[#77756f]">{personal.location}</p>
            <p className="mt-1 font-body text-xs leading-6 text-[#9b968b]">Add or change links from Content Studio.</p>
            <motion.button
              type="button"
              onClick={scrollToTop}
              className="mt-7 inline-flex h-11 items-center gap-2 rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] px-4 font-accent text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#171717] transition-colors hover:border-[#b18a50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              Back to top
            </motion.button>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:mt-14 border-t border-[#ded8c9] py-6 font-accent text-[0.62rem] uppercase tracking-[0.16em] text-[#8b8579] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {personal.name}. All rights reserved.</p>
          <p>{homepage.footer.note}</p>
          <p>MARUF.B</p>
        </div>
      </div>
    </footer>
  );
}
