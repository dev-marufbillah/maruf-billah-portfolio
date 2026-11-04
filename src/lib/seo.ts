import { personal } from "@/data/personal";
import { projects } from "@/data/projects";
import { siteConfig, absoluteUrl } from "@/data/site";
import { socialLinks } from "@/data/social";
import { isSafeHttpUrl } from "@/lib/utils";
import type { Project } from "@/types";

export function personJsonLd() {
  const sameAs = socialLinks
    .filter((link) => isSafeHttpUrl(link.url))
    .map((link) => link.url as string);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: personal.name,
    jobTitle: personal.designation,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    image: absoluteUrl(personal.profileImage),
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.title,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    inLanguage: "en",
  };
}

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.description,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: absoluteUrl(project.coverImage),
    genre: project.category,
    keywords: project.technologies.join(", "),
    creator: {
      "@type": "Person",
      name: personal.name,
    },
  };
}

export function projectBreadcrumbJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Projects", item: absoluteUrl("/#projects") },
      { "@type": "ListItem", position: 3, name: project.name, item: absoluteUrl(`/projects/${project.slug}`) },
    ],
  };
}

export const allProjectSlugs = projects.map((project) => project.slug);
