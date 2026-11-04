import fs from "node:fs";
import path from "node:path";

/** Server-only check: the UI activates download/preview when this real file exists. */
export function hasResumePdf() {
  return fs.existsSync(path.join(process.cwd(), "public", "resume.pdf"));
}

/** Build-time hint only. The form always re-checks the live server via GET /api/contact. */
export function isContactEmailConfigured() {
  return Boolean(
    (process.env.RESEND_API_KEY || "").trim() &&
      (process.env.CONTACT_TO_EMAIL || "").trim() &&
      (process.env.CONTACT_FROM_EMAIL || "").trim(),
  );
}
