import fs from "node:fs";
import path from "node:path";

/** Server-only check: the UI activates download/preview when this real file exists. */
export function hasResumePdf() {
  return fs.existsSync(path.join(process.cwd(), "public", "resume.pdf"));
}

/**
 * Build-time hint only. The form always re-checks the live server via GET /api/contact.
 *
 * Only RESEND_API_KEY is mandatory now: `/api/contact` falls back to
 * `ADMIN_EMAIL` for the recipient and to Resend's verified test sender
 * (`onboarding@resend.dev`) when CONTACT_FROM_EMAIL is missing or unverifiable.
 * Requiring all three here used to show "Setup required" even when mail worked.
 */
export function isContactEmailConfigured() {
  const raw = (process.env.RESEND_API_KEY || "").trim();
  const key = raw.replace(/^["']|["']$/g, "").trim();
  return key.startsWith("re_");
}