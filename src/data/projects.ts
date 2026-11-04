import type { Project, ProjectDetailSection } from "@/types";

const conceptSections = (name: string, summary: string): ProjectDetailSection[] => [
  {
    id: "overview",
    title: "Project overview",
    items: [
      summary,
      `EDIT: Add a verified, first-person overview of ${name} once its scope and implementation are confirmed.`,
    ],
    isPlaceholder: true,
  },
  {
    id: "objectives",
    title: "Project objectives",
    items: [
      "EDIT: Define the core problem and intended users before development begins.",
      "EDIT: Replace this note with measurable, verified objectives after the scope is confirmed.",
    ],
    isPlaceholder: true,
  },
  {
    id: "features",
    title: "Key features",
    items: [
      "EDIT: Add verified feature notes once a working prototype exists.",
      "No feature is presented as completed for this planning-stage concept.",
    ],
    isPlaceholder: true,
  },
  {
    id: "process",
    title: "Development process",
    items: [
      "EDIT: Document the actual design, implementation, and testing process here.",
      "Add real milestones and technical decisions when development starts.",
    ],
    isPlaceholder: true,
  },
  {
    id: "challenges",
    title: "Challenges faced",
    items: [
      "EDIT: Document real challenges encountered during development here.",
      "No challenge is claimed before implementation.",
    ],
    isPlaceholder: true,
  },
  {
    id: "solutions",
    title: "Solutions implemented",
    items: [
      "EDIT: Document verified implementation decisions and outcomes here.",
      "No solution is claimed for a planning-stage concept.",
    ],
    isPlaceholder: true,
  },
  {
    id: "improvements",
    title: "Future improvements",
    items: [
      "EDIT: Add future improvements once the first version and user feedback are available.",
    ],
    isPlaceholder: true,
  },
];

/**
 * EDIT HERE — All project cards and dynamic detail pages are generated from this file.
 * These are initial concepts, not claims of completed, launched, or deployed products.
 * Add liveUrl/repoUrl only when a real, working URL is available.
 */
export const projects: Project[] = [
  {
    slug: "niketan-mart",
    name: "Niketan Mart",
    category: "E-commerce / Food Superstore",
    status: "Planning",
    isConcept: true,
    description:
      "A premium online food superstore concept with grocery shopping and restaurant partner integration.",
    coverImage: "/projects/niketan-mart.webp",
    coverAlt: "Abstract concept preview for the Niketan Mart storefront, explicitly not a product screenshot.",
    technologies: ["Next.js", "TypeScript", "MongoDB"],
    liveUrl: null,
    repoUrl: null,
    contentNotice:
      "Planning-stage concept. The cover is an abstract concept preview, not evidence of a completed or deployed product.",
    detailSections: conceptSections(
      "Niketan Mart",
      "A premium online food superstore concept with grocery shopping and restaurant partner integration.",
    ),
  },
  {
    slug: "ai-omnichannel-inbox",
    name: "AI Omnichannel Inbox",
    category: "AI SaaS",
    status: "Planning",
    isConcept: true,
    description:
      "An AI-powered customer communication and order management platform concept.",
    coverImage: "/projects/ai-omnichannel-inbox.webp",
    coverAlt: "Abstract concept preview for the AI Omnichannel Inbox workspace, explicitly not a product screenshot.",
    technologies: ["Next.js", "Node.js", "AI APIs"],
    liveUrl: null,
    repoUrl: null,
    contentNotice:
      "Planning-stage concept. The cover is an abstract concept preview, not evidence of a completed or deployed product.",
    detailSections: conceptSections(
      "AI Omnichannel Inbox",
      "An AI-powered customer communication and order management platform concept.",
    ),
  },
  {
    slug: "windows-ai-voice-agent",
    name: "Windows AI Voice Agent",
    category: "AI Desktop Application",
    status: "Planning",
    isConcept: true,
    description:
      "An intelligent desktop voice assistant designed to interact with computer applications and workflows.",
    coverImage: "/projects/windows-ai-voice-agent.webp",
    coverAlt: "Abstract concept preview for the Windows AI Voice Agent interface, explicitly not a product screenshot.",
    technologies: ["Python", "Gemini API / OpenAI API"],
    liveUrl: null,
    repoUrl: null,
    contentNotice:
      "Planning-stage concept. The cover is an abstract concept preview, not evidence of a completed or deployed product.",
    detailSections: conceptSections(
      "Windows AI Voice Agent",
      "An intelligent desktop voice assistant designed to interact with computer applications and workflows.",
    ),
  },
];

export const projectsSection = {
  heading: "Selected Works.",
  subheading: "Concepts and works in progress, documented honestly.",
  notice:
    "The subtitle is preserved from the project brief. Until real screenshots and verified build notes are supplied, every entry below is explicitly marked as a planning-stage concept.",
};
