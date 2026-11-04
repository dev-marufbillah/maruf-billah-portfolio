/** Pure, dependency-free constants — safe to import from client components. */
export const SECTION_KEYS = [
  "homepage",
  "personal",
  "socialLinks",
  "heroSocialIds",
  "contactSocialIds",
  "navigation",
  "skillCategories",
  "educationEntries",
  "educationPlaceholder",
  "educationSection",
  "experienceEntries",
  "developmentJourney",
  "achievements",
  "achievementsSection",
  "services",
  "servicesSection",
  "projects",
  "projectsSection",
  "appearance",
  "seo",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export function isSectionKey(value: unknown): value is SectionKey {
  return typeof value === "string" && (SECTION_KEYS as readonly string[]).includes(value);
}
