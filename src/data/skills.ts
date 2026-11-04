import type { SkillCategory } from "@/types";

/**
 * EDIT HERE — Add/remove skills and set verified proficiency values.
 * `proficiency: null` means no percentage is displayed. No levels are invented.
 * Categories follow the brief: Frontend, Backend, Database, Development Tools.
 */
export const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    label: "FRONTEND",
    description: "Interface, interaction, and application layer",
    skills: [
      { name: "HTML5", icon: "SiHtml5", proficiency: null, editPath: "src/data/skills.ts → frontend" },
      { name: "CSS3", icon: "SiCss", proficiency: null, editPath: "src/data/skills.ts → frontend" },
      { name: "JavaScript", icon: "SiJavascript", proficiency: null, editPath: "src/data/skills.ts → frontend" },
      { name: "TypeScript", icon: "SiTypescript", proficiency: null, editPath: "src/data/skills.ts → frontend" },
      { name: "React.js", icon: "SiReact", proficiency: null, editPath: "src/data/skills.ts → frontend" },
      { name: "Next.js", icon: "SiNextdotjs", proficiency: null, editPath: "src/data/skills.ts → frontend" },
      { name: "Tailwind CSS", icon: "SiTailwindcss", proficiency: null, editPath: "src/data/skills.ts → frontend" },
    ],
  },
  {
    id: "backend",
    label: "BACKEND",
    description: "Server-side logic, data, and APIs",
    skills: [
      { name: "Node.js", icon: "SiNodedotjs", proficiency: null, editPath: "src/data/skills.ts → backend" },
      { name: "Express.js", icon: "SiExpress", proficiency: null, editPath: "src/data/skills.ts → backend" },
      { name: "REST API", icon: "Waypoints", proficiency: null, editPath: "src/data/skills.ts → backend" },
    ],
  },
  {
    id: "database",
    label: "DATABASE",
    description: "Data storage and persistence",
    skills: [
      { name: "MongoDB", icon: "SiMongodb", proficiency: null, editPath: "src/data/skills.ts → database" },
    ],
  },
  {
    id: "tools",
    label: "DEVELOPMENT TOOLS",
    description: "Workflow, design, and development tools",
    skills: [
      { name: "Git", icon: "SiGit", proficiency: null, editPath: "src/data/skills.ts → tools" },
      { name: "GitHub", icon: "SiGithub", proficiency: null, editPath: "src/data/skills.ts → tools" },
      { name: "VS Code", icon: "Code2", proficiency: null, editPath: "src/data/skills.ts → tools" },
      { name: "Figma", icon: "SiFigma", proficiency: null, editPath: "src/data/skills.ts → tools" },
      { name: "Cursor", icon: "SiCursor", proficiency: null, editPath: "src/data/skills.ts → tools" },
      { name: "AI Coding Tools", icon: "Sparkles", proficiency: null, editPath: "src/data/skills.ts → tools" },
    ],
  },
];
