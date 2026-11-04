import type { HomepageCopy } from "@/data/homepage";
import type {
  Achievement,
  EducationEntry,
  ExperienceEntry,
  JourneyPrompt,
  NavItem,
  Person,
  Project,
  ProjectDetailSection,
  Service,
  SkillCategory,
  SocialLink,
} from "@/types";

export type FontPreset = "modern" | "editorial" | "current";
export type AnimationLevel = "full" | "subtle" | "off";
export type LogoStyle = "monogram" | "serif" | "minimal";

export interface AppearanceSettings {
  logoPrimary: string;
  logoAccent: string;
  logoStyle: LogoStyle;
  fontPreset: FontPreset;
  accentColor: string;
  accentSecondary: string;
  backgroundIntensity: number;
  animationLevel: AnimationLevel;
  showProfilePhoto: boolean;
  showCodeMotifs: boolean;
}

export interface EducationSectionCopy {
  heading: string;
  subheading: string;
  emptyTitle: string;
  emptyDescription: string;
}

export interface JourneySectionCopy {
  heading: string;
  subheading: string;
  emptyTitle: string;
  emptyDescription: string;
  prompts: JourneyPrompt[];
}

export interface AchievementsSectionCopy {
  heading: string;
  subheading: string;
  emptyTitle: string;
  emptyDescription: string;
  editPath: string;
}

export interface ServicesSectionCopy {
  heading: string;
  subheading: string;
  notice: string;
}

export interface ProjectsSectionCopy {
  heading: string;
  subheading: string;
  notice: string;
}

export interface SeoSettings {
  title: string;
  description: string;
  siteUrl: string;
}

export interface PortfolioContent {
  homepage: HomepageCopy;
  personal: Person;
  socialLinks: SocialLink[];
  heroSocialIds: SocialLink["id"][];
  contactSocialIds: SocialLink["id"][];
  navigation: NavItem[];
  skillCategories: SkillCategory[];
  educationEntries: EducationEntry[];
  educationPlaceholder: EducationEntry;
  educationSection: EducationSectionCopy;
  experienceEntries: ExperienceEntry[];
  developmentJourney: JourneySectionCopy;
  achievements: Achievement[];
  achievementsSection: AchievementsSectionCopy;
  services: Service[];
  servicesSection: ServicesSectionCopy;
  projects: Project[];
  projectsSection: ProjectsSectionCopy;
  appearance: AppearanceSettings;
  seo: SeoSettings;
}

export interface AdminSessionInfo {
  passwordRequired: boolean;
  passwordConfigured: boolean;
  setupAllowed: boolean;
  authenticated: boolean;
  persistent: boolean;
  localMode: boolean;
  message: string;
}

export interface AdminSaveResult {
  ok: boolean;
  persistent: boolean;
  message: string;
}

export type { ProjectDetailSection };
