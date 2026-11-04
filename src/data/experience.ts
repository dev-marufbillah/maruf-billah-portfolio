import type { ExperienceEntry, JourneyPrompt } from "@/types";

/**
 * EDIT HERE — Add verified professional experience only.
 * No company, job title, date, or responsibility is invented.
 */
export const experienceEntries: ExperienceEntry[] = [];

export const developmentJourney = {
  heading: "My Development Journey.",
  subheading: "A place for your verified learning story.",
  emptyTitle: "Add your development journey",
  emptyDescription:
    "Because no professional employment history has been provided, this section intentionally shows editable journey fields instead of a fictional career timeline.",
  prompts: [
    {
      id: "learning",
      title: "Self-learning",
      prompt: "EDIT: Add courses, books, documentation, or topics you have actually studied.",
      editPath: "src/data/experience.ts → developmentJourney.prompts[0]",
      isPlaceholder: true,
    },
    {
      id: "practice",
      title: "Practice & independent work",
      prompt: "EDIT: Add real practice work or independent projects you are comfortable publishing.",
      editPath: "src/data/experience.ts → developmentJourney.prompts[1]",
      isPlaceholder: true,
    },
    {
      id: "interests",
      title: "Technical interests",
      prompt: "EDIT: Add the areas of web development you are genuinely exploring.",
      editPath: "src/data/experience.ts → developmentJourney.prompts[2]",
      isPlaceholder: true,
    },
  ] satisfies JourneyPrompt[],
};
