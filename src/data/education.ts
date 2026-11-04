import type { EducationEntry } from "@/types";

/**
 * EDIT HERE — Add verified education entries only.
 * This array is intentionally empty until real information is provided.
 */
export const educationEntries: EducationEntry[] = [];

export const educationPlaceholder: EducationEntry = {
  id: "education-placeholder",
  institution: null,
  degree: null,
  department: null,
  startYear: null,
  endYear: null,
  result: null,
  description: null,
  isPlaceholder: true,
  editPath: "src/data/education.ts → educationEntries",
};

export const educationSection = {
  heading: "Education & Learning.",
  subheading: "Verified academic details, added by you.",
  emptyTitle: "Education details to be added",
  emptyDescription:
    "Add institution, qualification, department, dates, result, and a short description. No academic qualification or result is assumed here.",
};
