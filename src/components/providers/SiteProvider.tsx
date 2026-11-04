"use client";

import { createContext, useContext, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { GsapScrollScenes } from "@/components/animations/GsapScrollScenes";
import { RevealManager } from "@/components/animations/RevealManager";
import { Preloader } from "@/components/animations/Preloader";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { SmoothScroll } from "@/components/animations/SmoothScroll";

interface SiteContextValue {
  resumeAvailable: boolean;
  emailConfigured: boolean;
}

const defaultContext: SiteContextValue = {
  resumeAvailable: false,
  emailConfigured: false,
};

const SiteContext = createContext<SiteContextValue>(defaultContext);

export function useSite() {
  return useContext(SiteContext);
}

interface SiteProviderProps extends SiteContextValue {
  children: ReactNode;
}

export function SiteProvider({ children, resumeAvailable, emailConfigured }: SiteProviderProps) {
  return (
    <SiteContext.Provider value={{ resumeAvailable, emailConfigured }}>
      <MotionConfig reducedMotion="user">
        <SmoothScroll>{children}</SmoothScroll>
        <Preloader />
        <ScrollProgress />
        <RevealManager />
        <GsapScrollScenes />
      </MotionConfig>
    </SiteContext.Provider>
  );
}
