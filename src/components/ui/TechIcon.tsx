import type { IconType } from "react-icons";
import {
  SiCss,
  SiCursor,
  SiExpress,
  SiFigma,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import { Code2, Sparkles, Waypoints, type LucideIcon } from "lucide-react";

const iconMap: Record<string, IconType | LucideIcon> = {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiGit,
  SiGithub,
  SiFigma,
  SiCursor,
  Code2,
  Sparkles,
  Waypoints,
};

export function TechIcon({ name, className, size = 24 }: { name: string; className?: string; size?: number }) {
  const Icon = iconMap[name] ?? Code2;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
