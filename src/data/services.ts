import type { Service } from "@/types";

/**
 * EDIT HERE — Confirm, remove, or rewrite these proposed service areas before publishing.
 * Descriptions define scope; they do not claim professional experience or years of expertise.
 */
export const services: Service[] = [
  {
    id: "frontend",
    title: "Frontend Web Development",
    description: "Implementation of accessible, responsive interfaces from a supplied design or component specification.",
    icon: "LayoutTemplate",
    isProposed: true,
    editPath: "src/data/services.ts → services[0]",
  },
  {
    id: "responsive",
    title: "Responsive Website Development",
    description: "Layouts adapted for small screens, tablets, laptops, and large desktop displays.",
    icon: "Smartphone",
    isProposed: true,
    editPath: "src/data/services.ts → services[1]",
  },
  {
    id: "fullstack",
    title: "Full-Stack Web Application Development",
    description: "Interface, server-side logic, data handling, and deployment-oriented application structure.",
    icon: "Layers3",
    isProposed: true,
    editPath: "src/data/services.ts → services[2]",
  },
  {
    id: "ecommerce",
    title: "E-commerce Website Development",
    description: "Storefront structure, product browsing, cart flows, and order-oriented interface work.",
    icon: "ShoppingBag",
    isProposed: true,
    editPath: "src/data/services.ts → services[3]",
  },
  {
    id: "ui-implementation",
    title: "Website UI Implementation",
    description: "Conversion of an approved visual design into semantic, maintainable, responsive components.",
    icon: "PenTool",
    isProposed: true,
    editPath: "src/data/services.ts → services[4]",
  },
  {
    id: "api-integration",
    title: "API Integration",
    description: "Connection of frontend experiences to documented third-party or application APIs.",
    icon: "Waypoints",
    isProposed: true,
    editPath: "src/data/services.ts → services[5]",
  },
  {
    id: "optimization",
    title: "Website Optimization",
    description: "Review of loading behavior, responsive layout, accessible markup, and Core Web Vitals considerations.",
    icon: "Gauge",
    isProposed: true,
    editPath: "src/data/services.ts → services[6]",
  },
];

export const servicesSection = {
  heading: "What I Can Do.",
  subheading: "Proposed service areas — confirm before publishing.",
  notice: "These are editable service definitions, not claims of completed client work.",
};
