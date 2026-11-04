import { homepage } from "@/data/homepage";
import { personal } from "@/data/personal";
import { socialLinks, heroSocialIds, contactSocialIds } from "@/data/social";
import { navigation } from "@/data/navigation";
import { skillCategories } from "@/data/skills";
import { educationEntries, educationPlaceholder, educationSection } from "@/data/education";
import { experienceEntries, developmentJourney } from "@/data/experience";
import { achievements, achievementsSection } from "@/data/achievements";
import { services, servicesSection } from "@/data/services";
import { projects, projectsSection } from "@/data/projects";
import { siteConfig } from "@/data/site";
import type { PortfolioContent } from "@/types/content";

/**
 * Single source of truth for the no-code Content Studio.
 * Data files remain readable defaults; saved overrides are merged at runtime.
 */
export const defaultContent: PortfolioContent = {
  homepage,
  personal: {
    ...personal,
    resume: {
      ...personal.resume,
      dataUrl: null,
      enabled: false,
    },
  },
  socialLinks,
  heroSocialIds,
  contactSocialIds,
  navigation,
  skillCategories,
  educationEntries,
  educationPlaceholder,
  educationSection,
  experienceEntries,
  developmentJourney,
  achievements,
  achievementsSection,
  services,
  servicesSection,
  projects,
  projectsSection,
  appearance: {
    logoPrimary: "MARUF",
    logoAccent: ".B",
    logoStyle: "monogram",
    fontPreset: "editorial",
    accentColor: "#B18A50",
    accentSecondary: "#8A6A3B",
    backgroundIntensity: 38,
    animationLevel: "full",
    showProfilePhoto: true,
    showCodeMotifs: true,
  },
  seo: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteUrl: siteConfig.url,
  },
};

export const CONTENT_STORAGE_KEY = "maruf-portfolio-content-v1";
