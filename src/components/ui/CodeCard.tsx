"use client";

import { Braces, Terminal } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { cn } from "@/lib/utils";

/** A small, light-themed code window used as a decorative developer motif. */
export function CodeCard({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { content } = useContent();
  if (!content.appearance.showCodeMotifs) return null;

  return (
    <div className={cn("code-window code-motif overflow-hidden rounded-[3px]", className)}>
      <div className="flex items-center justify-between border-b border-[#e5e2da] bg-[#f4f1e9] px-4 py-2.5">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-[#c9bca5]" />
          <span className="h-2 w-2 rounded-full bg-[#d6c9ae]" />
          <span className="h-2 w-2 rounded-full bg-[#b7a888]" />
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#8a8478]">
          <Terminal className="h-3 w-3" aria-hidden="true" />
          developer.ts
        </span>
      </div>
      <div className={cn("space-y-1 p-4 font-mono text-[0.68rem] leading-6 text-[#171717] sm:text-xs", compact && "p-3 text-[0.62rem] leading-5")}>
        <p><span className="code-token-keyword">const</span> developer = {"{"}</p>
        <p className="pl-3">name: <span className="code-token-string">&quot;{content.personal.name}&quot;</span>,</p>
        <p className="pl-3">focus: [<span className="code-token-string">&quot;interfaces&quot;</span>, <span className="code-token-string">&quot;motion&quot;</span>],</p>
        <p className="pl-3">location: <span className="code-token-string">&quot;{content.personal.location}&quot;</span>,</p>
        <p className="pl-3">build: <span className="code-token-number">() =&gt;</span> <span className="code-token-string">&quot;experiences&quot;</span></p>
        <p>{"}"};</p>
      </div>
      <div className="flex items-center justify-between border-t border-[#e5e2da] bg-[#faf8f3] px-4 py-2 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#8a8478]">
        <span className="inline-flex items-center gap-1.5"><Braces className="h-3 w-3" aria-hidden="true" /> TypeScript</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
