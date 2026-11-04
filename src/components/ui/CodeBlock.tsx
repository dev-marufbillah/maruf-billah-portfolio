import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small, dependency-free syntax highlighter for the light code editor. */
export function highlightLine(line: string): ReactNode[] {
  if (line.trim() === "") return [" "];
  if (line.trim().startsWith("//")) return [<span key="c" className="code-token-comment">{line}</span>];

  const parts = line.split(/("[^"]*"|'[^']*'|\b(?:const|export|default|function|return|import|from|let|type|interface|async|await|new)\b|\b\d+\b|=>)/g);
  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith('"') || part.startsWith("'")) return <span key={index} className="code-token-string">{part}</span>;
    if (/^(const|export|default|function|return|import|from|let|type|interface|async|await|new)$/.test(part)) {
      return <span key={index} className="code-token-keyword">{part}</span>;
    }
    if (part === "=>" || /^\d+$/.test(part)) return <span key={index} className="code-token-number">{part}</span>;
    if (/^[A-Za-z_$][\w$]*(?=\()/.test(part)) return <span key={index} className="code-token-function">{part}</span>;
    return <span key={index}>{part}</span>;
  });
}

interface CodeBlockProps {
  code: string;
  className?: string;
  minHeight?: string;
}

export function CodeBlock({ code, className, minHeight = "min-h-[300px]" }: CodeBlockProps) {
  const lines = code.split("\n");
  return (
    <div className={cn("overflow-x-auto px-3 py-4 font-mono text-[0.62rem] leading-[1.9] text-[#171717] sm:px-5 sm:py-5 sm:text-[0.78rem] sm:leading-[2]", minHeight, className)}>
      {lines.map((line, index) => (
        <div key={index} className="flex gap-3 sm:gap-6">
          <span className="w-4 shrink-0 select-none text-right text-[#c2bba9] sm:w-5">{String(index + 1).padStart(2, "0")}</span>
          <span className="min-w-0 whitespace-pre-wrap break-words text-[#3d3a34] sm:whitespace-pre">{highlightLine(line)}</span>
        </div>
      ))}
    </div>
  );
}
