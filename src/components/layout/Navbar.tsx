"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { Menu, Settings2, X } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { Logo } from "@/components/ui/Logo";
import { ResumeActions } from "@/components/ui/ResumeActions";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const lenis = useLenis();
  const { content } = useContent();
  const navigation = content.navigation;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [observedActive, setObservedActive] = useState("home");
  const active = pathname === "/" ? observedActive : "projects";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const sections = navigation
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setObservedActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -58% 0px", threshold: [0, 0.15, 0.45, 0.8] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname, navigation]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMobileOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, lenis]);

  const hrefFor = (href: string) => (pathname === "/" ? href : `/${href}`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[var(--nav-height)] border-b transition-all duration-500",
        scrolled || mobileOpen
          ? "border-[#e5e2da] bg-[rgba(247,246,242,0.92)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <nav className="editorial-shell flex h-full items-center justify-between gap-4" aria-label="Primary navigation">
        <Link href={pathname === "/" ? "#home" : "/"} className="group inline-flex min-h-[44px] shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]" aria-label="Back to home">
          <Logo size="md" />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => {
            const isActive = pathname === "/" && active === item.id;
            return (
              <Link
                key={item.id}
                href={hrefFor(item.href)}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "relative inline-flex min-h-[42px] items-center px-3.5 py-2 font-accent text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]",
                  isActive ? "text-[#171717]" : "text-[#8b8579] hover:text-[#171717]",
                )}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="desktop-nav-indicator"
                    className="absolute inset-x-3 -bottom-[3px] h-[2px] bg-[#b18a50]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block"><ResumeActions variant="nav" /></div>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] text-[#171717] transition-colors hover:border-[#b18a50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50] lg:hidden"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation-drawer"
            className="fixed inset-x-0 top-[var(--nav-height)] z-40 min-h-[calc(100vh-var(--nav-height))] border-b border-[#e5e2da] bg-[#f7f6f2] lg:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="editorial-shell max-h-[calc(100vh-var(--nav-height))] overflow-y-auto py-7 pb-12">
              <p className="eyebrow mb-5">Navigation</p>
              <div className="divide-y divide-[#e5e2da] border-y border-[#e5e2da]">
                {navigation.map((item, index) => {
                  const isActive = pathname === "/" && active === item.id;
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * index, duration: 0.3 }}>
                      <Link
                        href={hrefFor(item.href)}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex h-[3.4rem] items-center justify-between gap-4 font-display text-[1.7rem] leading-none transition-colors",
                          isActive ? "text-[#a17b42]" : "text-[#171717]",
                        )}
                      >
                        <span>{item.label}</span>
                        <span className="font-mono text-[0.65rem] tracking-[0.2em] text-[#a9a295]">0{index + 1}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <span className="eyebrow">Resume</span>
                  <ResumeActions variant="drawer" />
                </div>
                <div className="flex flex-col gap-3">
                  <span className="eyebrow">Connect</span>
                  <SocialLinks ids={content.heroSocialIds} compact />
                </div>
              </div>

              <Link href="/admin" onClick={() => setMobileOpen(false)} className="editorial-link mt-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]">
                <Settings2 className="h-3.5 w-3.5 text-[#a17b42]" aria-hidden="true" />
                Content Studio
              </Link>
              <p className="mt-6 text-[0.66rem] leading-5 text-[#9b968b]">Empty social icons are editable placeholders, not broken links.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
