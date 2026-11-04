import type { Achievement } from "@/types";

/**
 * EDIT HERE — Add verified certificates, awards, competitions, and milestones only.
 */
export const achievements: Achievement[] = [];

export const achievementsSection = {
  heading: "Achievements & Certifications.",
  subheading: "Certificates, milestones and recognition — verified by you.",
  emptyTitle: "No verified achievements yet",
  emptyDescription:
    "Add certificate names, issuing organizations, issue dates, and verifiable URLs or images. This section does not invent certifications or awards.",
  editPath: "src/data/achievements.ts → achievements",
};
