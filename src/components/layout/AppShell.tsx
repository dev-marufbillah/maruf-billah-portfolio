"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStandalone = pathname.startsWith("/admin") || pathname.startsWith("/login");

  return (
    <>
      <div className="site-backdrop" aria-hidden="true" />
      {!isStandalone && (
        <a href="#main-content" className="sr-only fixed left-4 top-4 z-[110] rounded-[2px] bg-[#171717] px-4 py-2 text-sm font-semibold text-[#ffffff] focus:not-sr-only">
          Skip to content
        </a>
      )}
      <div className="relative z-10 flex min-h-screen flex-col">
        {!isStandalone && <Navbar />}
        <main id="main-content" className="flex-1">
          {children}
        </main>
        {!isStandalone && <Footer />}
      </div>
    </>
  );
}
