import type { SiteConfig } from "@/types";

const normalizedUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const siteConfig: SiteConfig = {
  name: "Maruf Billah",
  title: "Maruf Billah — Web Developer",
  description:
    "The personal portfolio of Maruf Billah, a web developer in Bangladesh focused on modern, responsive, and interactive digital experiences.",
  url: normalizedUrl,
  locale: "en_US",
  ogImage: "/og-image.png",
  themeColor: "#F7F6F2",
};

export const absoluteUrl = (path: string) => new URL(path, siteConfig.url).toString();
