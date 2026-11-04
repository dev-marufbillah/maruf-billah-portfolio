import type { SocialLink } from "@/types";

/**
 * EDIT HERE — Add real, working profile URLs.
 * Empty/null URLs render as intentionally disabled placeholder icons, never as broken links.
 */
export const socialLinks: SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    url: null,
    icon: "github",
    editPath: "src/data/social.ts → github.url",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    url: null,
    icon: "linkedin",
    editPath: "src/data/social.ts → linkedin.url",
  },
  {
    id: "facebook",
    label: "Facebook",
    url: null,
    icon: "facebook",
    editPath: "src/data/social.ts → facebook.url",
  },
  {
    id: "instagram",
    label: "Instagram",
    url: null,
    icon: "instagram",
    editPath: "src/data/social.ts → instagram.url",
  },
  {
    id: "x",
    label: "X / Twitter",
    url: null,
    icon: "x",
    editPath: "src/data/social.ts → x.url",
  },
];

export const heroSocialIds: SocialLink["id"][] = ["github", "linkedin", "facebook", "instagram"];
export const contactSocialIds: SocialLink["id"][] = ["github", "linkedin", "facebook"];
