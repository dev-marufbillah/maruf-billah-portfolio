"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { contactSchema, type ContactInput } from "@/lib/validation";

type Status = "idle" | "loading" | "success" | "error" | "handoff";

const fieldClass =
  "mt-2 w-full min-w-0 rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] px-4 py-3 font-body text-sm text-[#171717] outline-none transition-colors placeholder:text-[#b0aa9c] focus:border-[#b18a50] focus:ring-2 focus:ring-[rgba(177,138,80,0.18)]";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * PURE CODE CONTACT — no API, no key, no env var, no signup, no activation,
 * no server call at all. The form builds an email draft in the visitor's own
 * webmail (Gmail / Outlook / Yahoo) with To, Subject and the whole message
 * already written. They press Send there and it arrives in YOUR inbox.
 *
 * Change THIS ONE LINE if you want messages at a different inbox.
 * Optional override: NEXT_PUBLIC_CONTACT_TO_EMAIL (not required).
 * ─────────────────────────────────────────────────────────────────────────
 */
const OWNER_EMAIL =
  (process.env.NEXT_PUBLIC_CONTACT_TO_EMAIL || "").trim() ||
  "marufsalauddinofficial@gmail.com";

interface HandoffLinks {
  gmail: string;
  outlook: string;
  yahoo: string;
  mailto: string;
}

const emptyLinks: HandoffLinks = { gmail: "", outlook: "", yahoo: "", mailto: "" };

function messageParts(values: ContactInput) {
  const subject = values.subject.replace(/[\r\n]+/g, " ").trim();
  const body = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Subject: ${subject}`,
    "",
    values.message,
    "",
    "— Sent from your portfolio contact form.",
  ].join("\n");
  return { subject: `[Portfolio] ${subject}`, body };
}

function buildLinks(values: ContactInput): HandoffLinks {
  const { subject, body } = messageParts(values);

  const gmail = new URLSearchParams({ view: "cm", fs: "1", to: OWNER_EMAIL, su: subject, body });
  const outlook = new URLSearchParams({ to: OWNER_EMAIL, subject, body });
  const yahoo = new URLSearchParams({ to: OWNER_EMAIL, subject, body });

  return {
    gmail: `https://mail.google.com/mail/?${gmail.toString()}`,
    outlook: `https://outlook.live.com/mail/0/deeplink/compose?${outlook.toString()}`,
    yahoo: `https://compose.mail.yahoo.com/?${yahoo.toString()}`,
    mailto: `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}

/** Always opens SOMETHING: a new tab, or the same tab if popups are blocked. */
function openDraft(url: string) {
  try {
    const tab = window.open(url, "_blank");
    if (tab) tab.opener = null;
    else window.location.href = url;
  } catch {
    window.location.href = url;
  }
}

function createTimestamp() {
  return Date.now().toString();
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [links, setLinks] = useState<HandoffLinks>(emptyLinks);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const startedAtRef = useRef("");

  const {
    register,
    handleSubmit,
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

  // Hidden anti-bot timestamp must never depend on requestAnimationFrame.
  useEffect(() => {
    const timestamp = createTimestamp();
    startedAtRef.current = timestamp;
    setValue("startedAt", timestamp);
  }, [setValue]);

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

  useEffect(() => {
    if (status !== "success" && status !== "error" && status !== "handoff") return;
    const node = statusRef.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [status]);

  const onSubmit = (values: ContactInput) => {
    const next = buildLinks(values);
    setLinks(next);
    setStatus("handoff");
    setServerMessage(
      "Ready! Your email opened with the whole message already written. Press Send there — I will receive it in my inbox. If nothing opened, choose a link below.",
    );
    openDraft(next.gmail);
  };

  /**
   * Chrome/LastPass autofill can fill the hidden honeypot, and a restored
   * bfcache page can lose the hidden timestamp. Heal both and explain clearly
   * instead of failing silently with no highlighted field.
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
        <span className="inline-flex items-center gap-2 rounded-full border border-[#b9c9b3] bg-[rgba(95,122,95,0.08)] px-3 py-1.5 font-accent text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#4f6b52]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5f7a5f]" />
          Ready to send
        </span>
      </div>

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
            Opens your email with the message ready — no account or API needed.
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
                  {status === "handoff" && (
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                      <a href={links.gmail} target="_blank" rel="noreferrer" className="font-accent text-[0.62rem] font-semibold uppercase tracking-[0.12em] underline underline-offset-2 hover:opacity-80">
                        Gmail →
                      </a>
                      <a href={links.outlook} target="_blank" rel="noreferrer" className="font-accent text-[0.62rem] font-semibold uppercase tracking-[0.12em] underline underline-offset-2 hover:opacity-80">
                        Outlook →
                      </a>
                      <a href={links.yahoo} target="_blank" rel="noreferrer" className="font-accent text-[0.62rem] font-semibold uppercase tracking-[0.12em] underline underline-offset-2 hover:opacity-80">
                        Yahoo →
                      </a>
                      <a href={links.mailto} className="font-accent text-[0.62rem] font-semibold uppercase tracking-[0.12em] underline underline-offset-2 hover:opacity-80">
                        Email app →
                      </a>
                    </div>
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