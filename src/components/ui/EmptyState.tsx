import type { ReactNode } from "react";
import { FilePlus2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  editPath?: string;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon = FilePlus2,
  title,
  description,
  editPath,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn("dashed-placeholder rounded-[3px] p-6 sm:p-8", className)}>
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] text-[#a17b42]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-medium text-[#171717]">{title}</h3>
            <span className="rounded-full border border-[#d8c9a9] bg-[rgba(177,138,80,0.08)] px-2.5 py-1 font-accent text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#8a6a3b]">
              Editable placeholder
            </span>
          </div>
          <p className="max-w-2xl font-body text-sm leading-7 text-[#77756f]">{description}</p>
          {editPath && (
            <p className="mt-3 break-all font-mono text-[0.66rem] leading-5 text-[#9b968b]">
              EDIT: {editPath}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
