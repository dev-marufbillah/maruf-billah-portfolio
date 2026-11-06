"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSite } from "@/components/providers/SiteProvider";
import { cn } from "@/lib/utils";
import { contactSchema, type ContactInput } from "@/lib/validation";

type Status = "idle" | "loading" | "success" | "error" | "handoff";

const fieldClass =
  "mt-2 w-full min-w-0 rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] px-4 py-3 font-body text-sm text-[#171717] outline-none transition-colors placeholder:text-[#b0aa9c] focus:border-[#b18a50] focus:ring-2 focus:ring-[rgba(177,138,80,0.18)]";

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * ─────────────────────────────────────────────────────────────────────────
 * ZERO-SETUP CONTACT — no API key, no signup, no env variable, no activation.
 * This is the classic plain-HTML `mailto:` form: the visitor's own email app
 * opens with the whole message already written and addressed to you. They
 * press Send there, and the message lands in your inbox (you can reply directly).
 *
 * Change THIS ONE LINE if you want messages at a different inbox.
 * Optional override: NEXT_PUBLIC_CONTACT_TO_EMAIL (not required).
 * ─────────────────────────────────────────────────────────────────────────
 */
const OWNER_EMAIL =
  (process.env.NEXT_PUBLIC_CONTACT_TO_EMAIL || "").trim() ||
  "marufsalauddinofficial@gmail.com";

/** "mailto" = zero-API (default). "server" = Resend / free relay (optional). */
const DELIVERY_MODE: "mailto" | "server" = "mailto";

function buildMailto(values: ContactInput) {
  const safeSubject = values.subject.replace(/[\r\n]+/g, " ").trim();
  const body = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Subject: ${safeSubject}`,
    "",
    values.message,
    "",
    "— Sent from your portfolio contact form.",
  ].join("\n");
  return `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(`[Portfolio] ${safeSubject}`)}&body=${encodeURIComponent(body)}`;
}

function createTimestamp() {
  return Date.now().toString();
}

export function ContactForm() {
  const { emailConfigured: buildTimeConfigured } = useSite();
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [runtimeConfig, setRuntimeConfig] = useState<{ configured: boolean; missing: string[] } | null>(null);
  const [mailtoUrl, setMailtoUrl] = useState("");
  const statusRef = useRef<HTMLDivElement | null>(null);
  const configRequested = useRef(false);
  const startedAtRef = useRef("");

  // The homepage is statically prerendered, so the build-time flag can be stale.
  // GET /api/contact reports the LIVE server environment (names only, no secrets).
  // One idempotent GET per mount; no AbortController so React's effect replay
  // cannot produce a spurious aborted network request.
  useEffect(() => {
    if (DELIVERY_MODE !== "server" || configRequested.current) return;
    configRequested.current = true;
    fetch("/api/contact", { cache: "no-store" })
      .then((response) => response.json().catch(() => ({})))
      .then((data: { configured?: unknown; missing?: unknown }) => {
        if (typeof data?.configured === "boolean") {
          setRuntimeConfig({
            configured: data.configured,
            missing: Array.isArray(data.missing) ? data.missing.filter((item): item is string => typeof item === "string") : [],
          });
        }
      })
      .catch(() => undefined);
  }, []);

  // mailto mode needs no configuration at all, so the badge is always ready.
  const emailConfigured = DELIVERY_MODE === "mailto" ? true : (runtimeConfig?.configured ?? buildTimeConfigured);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      company: "",
      startedAt: "",
    },
  });

  // Root-cause fix: never depend on requestAnimationFrame for the hidden
  // timestamp. A throttled/cancelled rAF left `startedAt` empty (silent Zod
  // failure) and kept the submit button disabled forever.
  useEffect(() => {
    const timestamp = createTimestamp();
    startedAtRef.current = timestamp;
    setValue("startedAt", timestamp);
  }, [setValue]);

  // Keep the timing token fresh when a long-open tab is refocused.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        const timestamp = createTimestamp();
        startedAtRef.current = timestamp;
        setValue("startedAt", timestamp);
      }
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [setValue]);

  // Make success/error feedback visible even when it sits below the button.
  useEffect(() => {
    if (status !== "success" && status !== "error" && status !== "handoff") return;
    const node = statusRef.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [status]);

  const onSubmit = async (values: ContactInput) => {
    setStatus("loading");
    setServerMessage("");

    // ZERO-API path: no fetch, no API key, no env var, no activation.
    if (DELIVERY_MODE === "mailto") {
      const url = buildMailto(values);
      setMailtoUrl(url);
      setStatus("handoff");
      setServerMessage("Your email app is opening with the message already written. Press Send there — it will arrive in my inbox. If nothing opened, use the link below.");
      window.location.href = url;
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        message?: string;
        requiresMailto?: boolean;
        mailtoUrl?: string;
        deliveredBy?: string;
      };

      // No false success: if no relay could deliver, hand the visitor their
      // own mail app with the whole message prefilled.
      if (result.requiresMailto && result.mailtoUrl) {
        setMailtoUrl(result.mailtoUrl);
        setStatus("handoff");
        setServerMessage(result.error || "Your email app is opening with the message — press Send there.");
        window.location.href = result.mailtoUrl;
        return;
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || `Request failed (${response.status}). Please try again.`);
      }

      setStatus("success");
      setServerMessage(result.message || "Your message was sent successfully.");
      const nextTimestamp = createTimestamp();
      reset({
        name: "",
        email: "",
        subject: "",
        message: "",
        company: "",
        startedAt: nextTimestamp,
      });
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === "AbortError";
      setStatus("error");
      setServerMessage(
        timedOut
          ? "The request timed out. Please check your connection and try again."
          : error instanceof Error
            ? error.message
            : "The message could not be sent. Please try again.",
      );
    } finally {
      window.clearTimeout(timeout);
    }
  };

  /**
   * Hidden-field / client validation failures must never fail silently.
   * Chrome/LastPass autofill can populate the off-screen honeypot, and a
   * restored bfcache page can lose the hidden timestamp. Both produce an error
   * with NO visible highlighted field, so we heal them and explain exactly
   * what happened instead of showing a vague message.
   */
  const onInvalid = (invalid: FieldErrors<ContactInput>) => {
    const autoFixed: string[] = [];

    if (invalid.startedAt) {
      const timestamp = startedAtRef.current || createTimestamp();
      startedAtRef.current = timestamp;
      setValue("startedAt", timestamp, { shouldValidate: false });
      autoFixed.push("The form session was refreshed automatically.");
    }
    if (invalid.company) {
      setValue("company", "", { shouldValidate: false });
      autoFixed.push("A browser autofill value in the hidden spam-check field was cleared.");
    }

    const visible = (["name", "email", "subject", "message"] as const)
      .map((key) => invalid[key]?.message)
      .filter((message): message is string => Boolean(message));

    const detail = visible.length
      ? visible.join(" ")
      : autoFixed.length
        ? `${autoFixed.join(" ")} Press Send Message again — your details are unchanged.`
        : "Please check the highlighted fields above and try again.";

    setStatus("error");
    setServerMessage(detail);
  };

  return (
    <div className="premium-card min-w-0 rounded-[3px] p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Send a message</p>
          <h3 className="mt-2 font-display text-2xl font-medium text-[#171717]">Project inquiry</h3>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-accent text-[0.58rem] font-semibold uppercase tracking-[0.14em]",
            emailConfigured
              ? "border-[#b9c9b3] bg-[rgba(95,122,95,0.08)] text-[#4f6b52]"
              : "border-[#d8c9a9] bg-[rgba(177,138,80,0.08)] text-[#8a6a3b]",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", emailConfigured ? "bg-[#5f7a5f]" : "bg-[#b18a50]")} />
          {emailConfigured ? "Email configured" : "Setup required"}
        </span>
      </div>

      {!emailConfigured && (
        <div className="mb-6 flex items-start gap-3 rounded-[2px] border border-[#e2d5b8] bg-[rgba(177,138,80,0.07)] p-4 font-body text-xs leading-6 text-[#7a5f34]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            {runtimeConfig?.missing?.length
              ? `Server variables missing: ${runtimeConfig.missing.join(", ")}. Add them in Vercel (Production) and redeploy — variables only reach a running deployment after a new deploy.`
              : "Resend credentials are not configured. The server will return a real error until the environment variables are added; the form never shows a false success."}
          </p>
        </div>
      )}

      <form
        noValidate
        className="space-y-4 sm:space-y-5"
        onSubmit={(event) => {
          void handleSubmit(onSubmit, onInvalid)(event);
        }}
      >
        <input
          type="text"
          tabIndex={-1}
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          spellCheck={false}
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          {...register("company")}
        />
        <input type="hidden" {...register("startedAt")} />

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          <div>
            <label htmlFor="contact-name" className="font-accent text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#171717]">
              Full Name <span className="text-electric">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              spellCheck={false}
              placeholder="Your full name"
              className={cn(fieldClass, errors.name && "border-[#c98a80] focus:border-[#a33a2f] focus:ring-[rgba(163,58,47,0.15)]")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              {...register("name")}
            />
            {errors.name && (
              <p id="contact-name-error" className="mt-2 text-xs text-[#a33a2f]">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contact-email" className="font-accent text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#171717]">
              Email Address <span className="text-electric">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="you@example.com"
              className={cn(fieldClass, errors.email && "border-[#c98a80] focus:border-[#a33a2f] focus:ring-[rgba(163,58,47,0.15)]")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="contact-email-error" className="mt-2 text-xs text-[#a33a2f]">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="contact-subject" className="font-accent text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#171717]">
            Subject <span className="text-electric">*</span>
          </label>
          <input
            id="contact-subject"
            type="text"
            spellCheck={false}
            placeholder="What would you like to discuss?"
            className={cn(fieldClass, errors.subject && "border-[#c98a80] focus:border-[#a33a2f] focus:ring-[rgba(163,58,47,0.15)]")}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "contact-subject-error" : undefined}
            {...register("subject")}
          />
          {errors.subject && (
            <p id="contact-subject-error" className="mt-2 text-xs text-[#a33a2f]">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-message" className="font-accent text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#171717]">
            Message <span className="text-electric">*</span>
          </label>
          <textarea
            id="contact-message"
            rows={5}
            spellCheck={false}
            placeholder="Tell me a little about your project (at least 20 characters)..."
            className={cn(fieldClass, "resize-y", errors.message && "border-[#c98a80] focus:border-[#a33a2f] focus:ring-[rgba(163,58,47,0.15)]")}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            {...register("message")}
          />
          {errors.message ? (
            <p id="contact-message-error" className="mt-2 text-xs text-[#a33a2f]">
              {errors.message.message}
            </p>
          ) : (
            <p className="mt-2 font-body text-[0.68rem] leading-5 text-[#9b968b]">
              Minimum 20 characters.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={status === "loading"}
            icon={status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            magnetic={false}
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </Button>
          <p className="font-body text-[0.68rem] leading-5 text-[#9b968b]">
            Validated in your browser. Opens your email app — no account or API needed.
          </p>
        </div>

        <div ref={statusRef} aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            {(status === "success" || status === "error" || status === "handoff") && (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role={status === "error" ? "alert" : "status"}
                className={cn(
                  "flex items-start gap-3 rounded-[2px] border p-4 font-body text-sm leading-6",
                  status === "success"
                    ? "border-[#b9c9b3] bg-[rgba(95,122,95,0.08)] text-[#4f6b52]"
                    : status === "handoff"
                      ? "border-[#d8c9a9] bg-[rgba(177,138,80,0.08)] text-[#8a6a3b]"
                      : "border-[#d8a9a3] bg-[rgba(163,58,47,0.07)] text-[#a33a2f]",
                )}
              >
                {status === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <p>{serverMessage}</p>
                  {status === "handoff" && mailtoUrl && (
                    <a href={mailtoUrl} className="mt-2 inline-block font-accent text-[0.62rem] font-semibold uppercase tracking-[0.12em] underline underline-offset-2 hover:opacity-80">
                      Open email app again →
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}