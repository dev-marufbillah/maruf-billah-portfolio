/**
 * EDIT HERE — Centralized copy for the luxury editorial homepage and the
 * cinematic intro. Everything in this file is also editable from
 * Content Studio → Homepage & Intro, without touching code.
 */

export interface CodeFile {
  id: string;
  label: string;
  fileName: string;
  code: string;
}

export interface HomepageCopy {
  intro: {
    commands: string[];
    codeTitle: string;
    hello: string;
    welcome: string;
    tagline: string;
    skipLabel: string;
    footerLabel: string;
  };
  hero: {
    eyebrow: string;
    /** Wrap words in *asterisks* to render them in expressive italic serif. */
    headline: string;
    portraitLabel: string;
    portraitCaption: string;
    scrollLabel: string;
  };
  identity: {
    kicker: string;
    heading: string;
    lead: string;
    philosophyTitle: string;
    philosophyBody: string;
    filesTitle: string;
    files: CodeFile[];
    githubLabel: string;
    githubPlaceholder: string;
  };
  skills: {
    kicker: string;
    heading: string;
    lead: string;
  };
  contact: {
    kicker: string;
    heading: string;
    lead: string;
  };
  footer: {
    note: string;
  };
}

export const homepage: HomepageCopy = {
  intro: {
    commands: [
      "$ initializing maruf-portfolio...",
      "$ loading developer-profile...",
      "",
      "const developer = {",
      '  name: "{name}",',
      '  role: "{role}",',
      '  passion: "Building Digital Experiences",',
      '  status: "Available"',
      "};",
    ],
    codeTitle: "welcome.ts",
    hello: "Hello, World!",
    welcome: "Welcome to my world.",
    tagline: "Where creativity meets code.",
    skipLabel: "Skip intro",
    footerLabel: "TypeScript · UTF-8",
  },
  hero: {
    eyebrow: "HELLO, I'M",
    headline: "Building *Digital Experiences* with Code & Creativity.",
    portraitLabel: "01 / PORTRAIT",
    portraitCaption: "WEB DEVELOPER · BANGLADESH",
    scrollLabel: "SCROLL TO EXPLORE",
  },
  identity: {
    kicker: "02 / DEVELOPER IDENTITY",
    heading: "Behind the Code.",
    lead: "A working environment, not a decoration. Structured markup, considered motion, and interfaces that stay readable on every screen.",
    philosophyTitle: "Developer philosophy",
    philosophyBody: "Build the semantic structure first, layer motion with restraint, and never make a visitor wait for content to appear. Every interaction here is designed to be usable with animation turned off.",
    filesTitle: "Open a file",
    files: [
      {
        id: "profile",
        label: "profile.ts",
        fileName: "profile.ts",
        code: [
          "export const developer = {",
          '  name: "Maruf Billah",',
          '  role: "Web Developer",',
          '  location: "Bangladesh",',
          '  focus: ["interfaces", "interaction", "accessibility"],',
          "};",
          "",
          "export default developer;",
        ].join("\n"),
      },
      {
        id: "stack",
        label: "stack.ts",
        fileName: "stack.ts",
        code: [
          "import type { Stack } from './types';",
          "",
          "export const stack: Stack = {",
          '  framework: "Next.js App Router",',
          '  language: "TypeScript",',
          '  interface: ["React", "Tailwind CSS"],',
          '  motion: ["Framer Motion", "GSAP", "Lenis"],',
          "};",
        ].join("\n"),
      },
      {
        id: "experience",
        label: "experience.ts",
        fileName: "experience.ts",
        code: [
          "// Small details make an interface feel considered.",
          "export function buildExperience(content: Content) {",
          "  const markup = renderSemanticMarkup(content);",
          "  const motion = enhanceWithMotion(markup);",
          "  const result = ensureAccessibility(motion);",
          "",
          "  return result;",
          "}",
        ].join("\n"),
      },
    ],
    githubLabel: "View GitHub profile",
    githubPlaceholder: "Add a real GitHub URL in Content Studio",
  },
  skills: {
    kicker: "04 / TECH STACK",
    heading: "Tools of My Craft.",
    lead: "The technologies used across this portfolio and the areas I am actively working in. Add or remove anything from Content Studio.",
  },
  contact: {
    kicker: "10 / CONTACT",
    heading: "Let's Build Something Together.",
    lead: "Have a project in mind, a question, or a collaboration to discuss? Send a message and I'll get back to you.",
  },
  footer: {
    note: "Designed as a single-page editorial developer portfolio.",
  },
};
