"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { Download, ExternalLink, Eye, FileText, Loader2, X } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useSite } from "@/components/providers/SiteProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type ResumeVariant = "hero" | "nav" | "drawer";

/** Old content may still hold an inline data: URL — turn it into a blob URL. */
function dataUrlToObjectUrl(dataUrl: string): string | null {
  try {
    const comma = dataUrl.indexOf(",");
    if (comma < 0) return null;
    const header = dataUrl.slice(0, comma);
    const mime = /:(.*?);/.exec(header)?.[1] || "application/pdf";
    const binary = atob(dataUrl.slice(comma + 1));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  } catch {
    return null;
  }
}

export function ResumeActions({ variant = "hero" }: { variant?: ResumeVariant }) {
  const { resumeAvailable } = useSite();
  const { content } = useContent();
  const { personal } = content;
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [legacyPreview, setLegacyPreview] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const lenis = useLenis();

  const fileName = personal.resume.fileName || "Maruf-Billah-Resume.pdf";
  const uploadedResume = personal.resume.enabled && personal.resume.dataUrl ? personal.resume.dataUrl : null;
  const resumeSource = uploadedResume || (resumeAvailable ? personal.resume.path : null);
  const hasResume = Boolean(resumeSource);
  const isLegacyData = Boolean(resumeSource?.startsWith("data:"));

  /**
   * Cloudinary raw PDFs download instead of rendering. Route them through our
   * same-origin proxy so the iframe gets `application/pdf` + `inline`.
   */
  const { previewSrc, downloadSrc } = useMemo(() => {
    if (!resumeSource) return { previewSrc: null, downloadSrc: null };
    if (resumeSource.startsWith("/")) return { previewSrc: resumeSource, downloadSrc: resumeSource };
    if (isLegacyData) return { previewSrc: legacyPreview, downloadSrc: resumeSource };
    const inline = new URLSearchParams({ src: resumeSource, name: fileName, mode: "inline" });
    const attachment = new URLSearchParams({ src: resumeSource, name: fileName, mode: "download" });
    return { previewSrc: `/api/resume?${inline.toString()}`, downloadSrc: `/api/resume?${attachment.toString()}` };
  }, [resumeSource, fileName, isLegacyData, legacyPreview]);

  // Convert a legacy inline data: PDF into a blob URL (never put data: in an iframe).
  useEffect(() => {
    if (!open || !isLegacyData || !resumeSource) return;
    let objectUrl = "";
    const frame = window.requestAnimationFrame(() => {
      objectUrl = dataUrlToObjectUrl(resumeSource) ?? "";
      setLegacyPreview(objectUrl || null);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, isLegacyData, resumeSource]);

  // Freeze the page behind the popup so it can never scroll "upwards".
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    // focus() with preventScroll — a plain autoFocus can yank the page upward.
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    // Some browsers (mobile Safari / PDF-less webviews) never fire iframe
    // onLoad — never leave the "Loading PDF…" overlay stuck forever.
    const loadFallback = window.setTimeout(() => setLoaded(true), 1400);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.clearTimeout(loadFallback);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, lenis]);

  const openPreview = () => {
    setLoaded(false);
    setOpen(true);
  };

  const downloadButton = hasResume && downloadSrc ? (
    <Button
      href={downloadSrc}
      download={fileName}
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
      onClick={openPreview}
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
        onClick={openPreview}
        icon={<FileText className="h-4 w-4" aria-hidden="true" />}
        title="Preview resume"
      >
        <span className="flex items-center gap-2">
          Resume
          {!hasResume && <span className="h-1.5 w-1.5 rounded-full bg-[#b18a50]" aria-hidden="true" />}
        </span>
      </Button>
    );

  // A portal on document.body guarantees true viewport centering — no
  // transformed/Framer-Motion ancestor can shift or clip this popup.
  const overlay =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="resume-preview"
                className="fixed inset-0 z-[120] grid place-items-center p-3 sm:p-6"
                style={{ minHeight: "100dvh", overscrollBehavior: "contain" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  className="absolute inset-0 h-full w-full cursor-default bg-[#171717]/60 backdrop-blur-sm"
                  onClick={() => setOpen(false)}
                  aria-label="Close resume preview"
                />

                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="resume-dialog-title"
                  className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[4px] border border-[#e5e2da] bg-[#fffefb] shadow-[0_40px_120px_-40px_rgba(23,23,23,0.65)]"
                  style={{ height: "min(88dvh, 880px)", maxHeight: "calc(100dvh - 24px)" }}
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.99 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e5e2da] px-4 py-3 sm:px-6">
                    <div className="min-w-0">
                      <p className="eyebrow">Resume preview</p>
                      <h2 id="resume-dialog-title" className="truncate font-display text-lg font-medium text-[#171717]">
                        {personal.name} — {personal.designation}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasResume && downloadSrc && (
                        <Button href={downloadSrc} download={fileName} variant="outline" size="sm" magnetic={false} icon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}>
                          <span className="hidden sm:inline">Download</span>
                          <span className="sm:hidden">PDF</span>
                        </Button>
                      )}
                      <button
                        type="button"
                        ref={closeRef}
                        onClick={() => setOpen(false)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-[#d8d2c4] text-[#77756f] transition-colors hover:border-[#b18a50] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]"
                        aria-label="Close resume preview"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="relative min-h-0 flex-1 overflow-hidden bg-[#efeee8] p-3 sm:p-5">
                    {hasResume && previewSrc ? (
                      <>
                        {!loaded && (
                          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center gap-2 bg-[#efeee8] font-accent text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#8b8579]">
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading PDF…
                          </div>
                        )}
                        <iframe
                          key={previewSrc}
                          src={previewSrc}
                          title={`${personal.name} resume PDF preview`}
                          onLoad={() => setLoaded(true)}
                          className="h-full min-h-[280px] w-full rounded-[2px] border border-[#e5e2da] bg-[#ffffff]"
                          loading="eager"
                          allow="fullscreen"
                          referrerPolicy="no-referrer"
                        />
                      </>
                    ) : (
                      <EmptyState
                        className="h-full min-h-[280px] content-center"
                        icon={FileText}
                        title="No resume PDF added yet"
                        description="Upload a real PDF from Content Studio → Resume, or place it at public/resume.pdf. The download and preview will activate automatically."
                        editPath="Content Studio → Resume"
                      />
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#e5e2da] px-4 py-2.5 text-[0.7rem] leading-5 text-[#77756f] sm:px-6">
                    <p>
                      {hasResume
                        ? "Preview stays on this page — use Download only when you want the file."
                        : "Download stays disabled until a real PDF exists, so the interface never points to a broken file."}
                    </p>
                    {hasResume && previewSrc && (
                      <a href={previewSrc} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-accent text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8a6a3b] hover:text-[#171717]">
                        <ExternalLink className="h-3 w-3" aria-hidden="true" /> Open in new tab
                      </a>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      {trigger}
      {overlay}
    </>
  );
}