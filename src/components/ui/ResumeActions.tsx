"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { Download, Eye, FileText, X } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useSite } from "@/components/providers/SiteProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type ResumeVariant = "hero" | "nav" | "drawer";

export function ResumeActions({ variant = "hero" }: { variant?: ResumeVariant }) {
  const { resumeAvailable } = useSite();
  const { content } = useContent();
  const { personal } = content;
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  const uploadedResume = personal.resume.enabled && personal.resume.dataUrl ? personal.resume.dataUrl : null;
  const resumeSource = uploadedResume || (resumeAvailable ? personal.resume.path : null);
  const hasResume = Boolean(resumeSource);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, lenis]);

  const downloadButton = hasResume ? (
    <Button
      href={resumeSource as string}
      download={personal.resume.fileName}
      variant="outline"
      size={variant === "hero" ? "lg" : "sm"}
      className={variant === "hero" ? "w-full sm:w-auto" : undefined}
      icon={<Download className="h-4 w-4" aria-hidden="true" />}
      title="Download resume PDF"
    >
      {personal.resume.downloadLabel}
    </Button>
  ) : (
    <Button
      disabled
      variant="outline"
      size={variant === "hero" ? "lg" : "sm"}
      className={variant === "hero" ? "w-full sm:w-auto" : undefined}
      icon={<Download className="h-4 w-4" aria-hidden="true" />}
      title="Add a resume in Content Studio"
    >
      <span className="flex items-center gap-2">
        {personal.resume.downloadLabel}
        <span className="rounded-full border border-[#d8c9a9] bg-[rgba(177,138,80,0.1)] px-2 py-0.5 font-accent text-[0.55rem] font-semibold uppercase tracking-wider text-[#8a6a3b]">
          PDF pending
        </span>
      </span>
    </Button>
  );

  const previewButton = (
    <Button
      variant="ghost"
      size={variant === "hero" ? "lg" : "sm"}
      className={variant === "hero" ? "w-full sm:w-auto" : undefined}
      onClick={() => setOpen(true)}
      icon={<Eye className="h-4 w-4" aria-hidden="true" />}
      title="Preview resume"
    >
      Preview
    </Button>
  );

  const trigger =
    variant === "hero" ? (
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        {downloadButton}
        {previewButton}
      </div>
    ) : (
      <Button
        variant={variant === "drawer" ? "outline" : "ghost"}
        size="md"
        className={variant === "drawer" ? "w-full" : undefined}
        magnetic={variant !== "drawer"}
        onClick={() => setOpen(true)}
        icon={<FileText className="h-4 w-4" aria-hidden="true" />}
        title="Preview resume"
      >
        <span className="flex items-center gap-2">
          Resume
          {!hasResume && <span className="h-1.5 w-1.5 rounded-full bg-[#b18a50]" aria-hidden="true" />}
        </span>
      </Button>
    );

  return (
    <>
      {trigger}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <button type="button" className="absolute inset-0 h-full w-full cursor-default bg-[#171717]/55 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Close resume preview" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="resume-dialog-title"
              className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[3px] border border-[#e5e2da] bg-[#fffefb] shadow-[0_40px_120px_-40px_rgba(23,23,23,0.55)]"
              initial={{ opacity: 0, y: 24, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.99 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between gap-4 border-b border-[#e5e2da] px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <p className="eyebrow">Resume preview</p>
                  <h2 id="resume-dialog-title" className="truncate font-display text-lg font-medium text-[#171717]">
                    {personal.name} — {personal.designation}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {hasResume && (
                    <Button href={resumeSource as string} download={personal.resume.fileName} variant="outline" size="sm" magnetic={false} icon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}>
                      <span className="hidden sm:inline">Download</span>
                      <span className="sm:hidden">PDF</span>
                    </Button>
                  )}
                  <button type="button" autoFocus onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[#d8d2c4] text-[#77756f] transition-colors hover:border-[#b18a50] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]" aria-label="Close resume preview">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 bg-[#efeee8] p-3 sm:p-5">
                {hasResume ? (
                  <iframe src={resumeSource as string} title={`${personal.name} resume PDF preview`} className="h-[65vh] min-h-[360px] w-full rounded-[2px] border border-[#e5e2da] bg-[#ffffff]" loading="lazy" />
                ) : (
                  <EmptyState
                    className="h-[65vh] min-h-[360px] content-center"
                    icon={FileText}
                    title="No resume PDF added yet"
                    description="Upload a real PDF from Content Studio → Resume, or place it at public/resume.pdf. The download and preview will activate automatically."
                    editPath="Content Studio → Resume"
                  />
                )}
              </div>
              <p className="border-t border-[#e5e2da] px-4 py-3 text-[0.7rem] leading-5 text-[#77756f] sm:px-6">
                {hasResume
                  ? "This preview loads your uploaded or local PDF. Replace it anytime from Content Studio."
                  : "The download button stays disabled until a real PDF exists, so the interface never points to a broken file."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
