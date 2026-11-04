import type { ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<ProjectStatus, string> = {
  Planning: "border-[#d8c9a9] text-[#8a6a3b]",
  "In Development": "border-[#c9b79a] text-[#8a6a3b]",
  Completed: "border-[#b9c9b3] text-[#4f6b52]",
  Live: "border-[#a9c2ab] text-[#3f6b4a]",
};

const dotStyles: Record<ProjectStatus, string> = {
  Planning: "bg-[#b18a50]",
  "In Development": "bg-[#a17b42]",
  Completed: "bg-[#5f7a5f]",
  Live: "bg-[#4a7a52]",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-[#fffefb] px-3 py-1.5 font-accent text-[0.6rem] font-semibold uppercase tracking-[0.18em]",
        statusStyles[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[status])} aria-hidden="true" />
      {status}
    </span>
  );
}
