export type ProjectStatus = "Planning" | "In Development" | "Completed" | "Live";

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  url: string;
  locale: string;
  ogImage: string;
  themeColor: string;
}

export interface VerifiedFact {
  label: string;
  value: string;
}

export interface AboutField {
  id: string;
  question: string;
  answer: string;
  isPlaceholder: boolean;
  editPath: string;
}

export interface ContactDetail {
  id: string;
  label: string;
  value: string | null;
  placeholder: string;
  editPath: string;
  kind: "email" | "phone" | "whatsapp";
}

export interface SocialLink {
  id: "github" | "linkedin" | "facebook" | "instagram" | "x";
  label: string;
  url: string | null;
  icon: string;
  editPath: string;
}

export interface ResumeConfig {
  path: string;
  fileName: string;
  downloadLabel: string;
  editPath: string;
  missingMessage: string;
  /** Optional browser-uploaded PDF as a data URL; managed from Content Studio. */
  dataUrl?: string | null;
  /** Explicitly enable the uploaded resume even if no public file exists. */
  enabled?: boolean;
}

export interface Person {
  name: string;
  brand: string;
  designation: string;
  roles: string[];
  location: string;
  heroDescription: string;
  shortTagline: string;
  profileImage: string;
  profileAlt: string;
  resume: ResumeConfig;
  contact: ContactDetail[];
  about: {
    heading: string;
    subheading: string;
    verifiedIntro: string;
    verifiedFacts: VerifiedFact[];
    fields: AboutField[];
  };
}

export type SkillCategoryId = "frontend" | "backend" | "database" | "tools";

export interface Skill {
  name: string;
  icon: string;
  proficiency: number | null;
  editPath: string;
}

export interface SkillCategory {
  id: SkillCategoryId;
  label: string;
  description: string;
  skills: Skill[];
}

export interface EducationEntry {
  id: string;
  institution: string | null;
  degree: string | null;
  department: string | null;
  startYear: string | null;
  endYear: string | null;
  result: string | null;
  description: string | null;
  isPlaceholder: boolean;
  editPath: string;
}

export interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  technologies: string[];
  editPath: string;
}

export interface JourneyPrompt {
  id: string;
  title: string;
  prompt: string;
  editPath: string;
  isPlaceholder: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  image: string | null;
  url: string | null;
  editPath: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  isProposed: boolean;
  editPath: string;
}

export interface ProjectDetailSection {
  id: string;
  title: string;
  items: string[];
  isPlaceholder: boolean;
}

export interface Project {
  slug: string;
  name: string;
  category: string;
  status: ProjectStatus;
  isConcept: boolean;
  description: string;
  coverImage: string;
  coverAlt: string;
  technologies: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  contentNotice: string;
  detailSections: ProjectDetailSection[];
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}
