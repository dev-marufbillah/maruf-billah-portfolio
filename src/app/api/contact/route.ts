import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_MIN_SUBMIT_MS, contactSchema } from "@/lib/validation";

export const runtime = "nodejs";
/** Env vars must be read on every request, never baked into a cached response. */
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 3;
const submissions = new Map<string, number[]>();

/** Resend's always-verified test sender. It can only send to the account owner. */
const TEST_SENDER = "onboarding@resend.dev";
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
/** Public mailboxes can NEVER be verified in Resend as a sender domain. */
const PUBLIC_MAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "ymail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com", "aol.com",
  "icloud.com", "me.com", "mac.com", "proton.me", "protonmail.com",
  "gmx.com", "gmx.de", "mail.com", "yandex.com", "zoho.com",
]);

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** Vercel values are often pasted WITH quotes; that alone breaks the API key. */
function cleanEnv(value: unknown): string {
  const raw = (typeof value === "string" ? value : "").trim();
  if (raw.length >= 2) {
    const double = raw.startsWith('"') && raw.endsWith('"');
    const single = raw.startsWith("'") && raw.endsWith("'");
    if (double || single) return raw.slice(1, -1).trim();
  }
  return raw;
}

/** Works for both `hello@domain.com` and `Name <hello@domain.com>`. */
function plainAddress(value: string): string {
  return (value.match(/<([^>]+)>/)?.[1] ?? value).trim();
}

function domainOf(value: string): string {
  return plainAddress(value).split("@")[1]?.toLowerCase() ?? "";
}

interface EmailConfig {
  apiKey: string;
  to: string;
  from: string;
  senderMode: "custom" | "test";
  missing: string[];
  warnings: string[];
}

/**
 * Only `RESEND_API_KEY` + a recipient are truly required now.
 * A missing/invalid/public `CONTACT_FROM_EMAIL` no longer causes a 502:
 * we automatically use Resend's verified test sender instead.
 */
function readEmailConfig(): EmailConfig {
  const apiKey = cleanEnv(process.env.RESEND_API_KEY);
  const to = cleanEnv(process.env.CONTACT_TO_EMAIL) || cleanEnv(process.env.ADMIN_EMAIL);
  const explicitFrom = cleanEnv(process.env.CONTACT_FROM_EMAIL);

  const missing: string[] = [];
  const warnings: string[] = [];
  if (!apiKey) missing.push("RESEND_API_KEY");
  else if (!apiKey.startsWith("re_")) warnings.push("RESEND_API_KEY does not look like a Resend key (should start with re_).");
  if (!to) missing.push("CONTACT_TO_EMAIL");
  else if (!EMAIL_RE.test(to)) warnings.push("CONTACT_TO_EMAIL is not a valid single email address.");

  let from = explicitFrom || TEST_SENDER;
  let senderMode: EmailConfig["senderMode"] = explicitFrom ? "custom" : "test";

  if (explicitFrom) {
    if (!EMAIL_RE.test(plainAddress(explicitFrom))) {
      from = TEST_SENDER;
      senderMode = "test";
      warnings.push("CONTACT_FROM_EMAIL is not a valid address; using the Resend test sender.");
    } else if (PUBLIC_MAIL_DOMAINS.has(domainOf(explicitFrom))) {
      from = TEST_SENDER;
      senderMode = "test";
      warnings.push("CONTACT_FROM_EMAIL is a public mailbox (not verifiable in Resend); using the Resend test sender.");
    }
  }

  return { apiKey, to, from, senderMode, missing, warnings };
}

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (submissions.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    submissions.set(key, recent);
    return true;
  }
  recent.push(now);
  submissions.set(key, recent);

  if (submissions.size > 1000) {
    for (const [mapKey, timestamps] of submissions) {
      if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS)) submissions.delete(mapKey);
    }
  }
  return false;
}

/** A failed DELIVERY should not burn the visitor's 3-attempt spam quota. */
function refundQuota(key: string) {
  const list = submissions.get(key);
  if (!list?.length) return;
  list.pop();
  if (!list.length) submissions.delete(key);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Clean, readable email (inline CSS — no external assets, works in every inbox). */
function buildEmail(name: string, email: string, subject: string, message: string) {
  const safeSubject = subject.replace(/[\r\n]+/g, " ").trim();
  const text = [
    "NEW PORTFOLIO MESSAGE",
    "",
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Subject: ${safeSubject}`,
    "",
    message,
    "",
    "— Sent from your portfolio contact form.",
  ].join("\n");

  const replyLink = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${safeSubject}`)}`;
  const html = `
<div style="margin:0;padding:32px 16px;background:#f7f6f2;font-family:Arial,Helvetica,sans-serif;color:#171717;">
  <div style="max-width:600px;margin:0 auto;background:#fffefb;border:1px solid #e5e2da;border-radius:3px;overflow:hidden;">
    <div style="padding:28px 32px;border-bottom:1px solid #e5e2da;">
      <p style="margin:0;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#a17b42;font-weight:700;">Portfolio · Contact</p>
      <h1 style="margin:10px 0 0;font-family:Georgia,serif;font-size:26px;font-weight:400;letter-spacing:-.02em;">New message</h1>
    </div>
    <div style="padding:28px 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.7;">
        <tr><td style="width:92px;padding:6px 0;color:#8b8579;text-transform:uppercase;font-size:10px;letter-spacing:.14em;">Name</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:6px 0;color:#8b8579;text-transform:uppercase;font-size:10px;letter-spacing:.14em;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#a17b42;">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#8b8579;text-transform:uppercase;font-size:10px;letter-spacing:.14em;">Subject</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(safeSubject)}</td></tr>
      </table>
      <div style="margin:24px 0 0;padding:20px;border-left:3px solid #b18a50;background:#faf9f5;white-space:pre-wrap;word-break:break-word;font-size:14px;line-height:1.8;">${escapeHtml(message)}</div>
      <p style="margin:26px 0 0;">
        <a href="${escapeHtml(replyLink)}" style="display:inline-block;padding:12px 22px;background:#171717;color:#ffffff;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;border-radius:2px;">Reply to ${escapeHtml(name)}</a>
      </p>
    </div>
    <div style="padding:18px 32px;border-top:1px solid #e5e2da;background:#faf9f5;font-size:11px;color:#9b968b;">
      Sent from your portfolio contact form · ${escapeHtml(new Date().toUTCString())}
    </div>
  </div>
</div>`;

  return { subject: safeSubject, text, html };
}

type SendError = { name?: string; message?: string; statusCode?: number | null };
type SendResult = { id?: string; error?: SendError };

type MailPayload = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
};

async function trySend(resend: Resend, payload: MailPayload): Promise<SendResult> {
  try {
    const { data, error } = await resend.emails.send(payload);
    if (error) {
      return { error: { name: error.name, message: error.message, statusCode: error.statusCode } };
    }
    if (!data?.id) {
      return { error: { name: "application_error", message: "Resend returned no message id." } };
    }
    return { id: data.id };
  } catch (error) {
    return {
      error: {
        name: "network_error",
        message: error instanceof Error ? error.message : "Network request failed",
        statusCode: null,
      },
    };
  }
}

/** A custom sender that Resend rejects can be rescued with the test sender. */
function isSenderProblem(error: SendError) {
  const name = (error.name || "").toLowerCase();
  const msg = (error.message || "").toLowerCase();
  return (
    name === "invalid_from_address" ||
    (name === "validation_error" && /from|sender|domain|verif/.test(msg)) ||
    /domain is not verified|not verified.*from|from.*not verified/.test(msg)
  );
}

/** Exact, actionable reason instead of one generic wall of text. No secrets. */
function describeResendError(error: SendError): { message: string; status: number } {
  const name = (error.name || "").toLowerCase();
  const msg = (error.message || "").toLowerCase();
  const code = error.statusCode;

  if (["invalid_api_key", "missing_api_key", "restricted_api_key", "invalid_access", "security_error"].includes(name) || code === 401 || code === 403 && /api.?key|unauthor/i.test(msg)) {
    return {
      message: "RESEND_API_KEY is missing, invalid, or lacks sending permission. In Vercel → Settings → Environment Variables (Production) paste the full key (starts with re_), WITHOUT quotes or spaces, then Redeploy.",
      status: 502,
    };
  }
  if (["daily_quota_exceeded", "monthly_quota_exceeded", "rate_limit_exceeded"].includes(name) || code === 429) {
    return { message: "Resend's sending limit has been reached. Please try again later or check your plan's quota.", status: 429 };
  }
  if (/only send (testing|test) emails|your own email|own email address|verified email/i.test(error.message || "")) {
    return {
      message: "Using the free test sender (onboarding@resend.dev), messages can only go to the email address you used to create your Resend account. Set CONTACT_TO_EMAIL to exactly that address, or verify your own domain at resend.com/domains and set CONTACT_FROM_EMAIL.",
      status: 502,
    };
  }
  if (isSenderProblem(error)) {
    return {
      message: "The sender (CONTACT_FROM_EMAIL) is not verified in Resend. Verify the domain at resend.com/domains, OR remove CONTACT_FROM_EMAIL so the form uses the free test sender onboarding@resend.dev.",
      status: 502,
    };
  }
  if (name === "validation_error" && /to\b|recipient/.test(msg)) {
    return { message: "CONTACT_TO_EMAIL is not a valid recipient. Set one valid email address in Vercel → Environment Variables, then Redeploy.", status: 502 };
  }
  if (name === "network_error" || code === null || code === undefined || (typeof code === "number" && code >= 500)) {
    return { message: "Resend could not be reached right now. Please wait a moment and try again.", status: 502 };
  }
  return {
    message: `Resend could not deliver the message (${error.name || "unknown_error"}). Check the API key, sender domain and recipient in Vercel, then Redeploy.`,
    status: 502,
  };
}

/**
 * Lightweight runtime diagnostic. Reports only NAMES / flags, never values.
 * `?check=email` adds sender-mode details for quick troubleshooting.
 */
export async function GET(request: Request) {
  const config = readEmailConfig();
  const detailed = new URL(request.url).searchParams.get("check") === "email";
  return json({
    ok: true,
    configured: config.missing.length === 0,
    missing: config.missing,
    endpoint: "/api/contact",
    method: "POST",
    ...(detailed
      ? {
          senderMode: config.senderMode,
          apiKeyFormatOk: config.apiKey.startsWith("re_"),
          recipientConfigured: EMAIL_RE.test(config.to),
          warnings: config.warnings,
          note:
            config.senderMode === "test"
              ? "Using onboarding@resend.dev — CONTACT_TO_EMAIL must be the email used to sign up for Resend."
              : "Using a custom sender — its domain must show Verified in Resend.",
        }
      : {}),
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = contactSchema.safeParse(payload);

    if (!parsed.success) {
      return json(
        { ok: false, error: "Please check the form fields and try again.", fields: parsed.error.flatten().fieldErrors },
        400,
      );
    }

    const { name, email, subject, message, company, startedAt } = parsed.data;

    if (company) return json({ ok: false, error: "Submission rejected." }, 400);

    const timestamp = Number(startedAt);
    const elapsed = Date.now() - timestamp;
    if (elapsed < CONTACT_MIN_SUBMIT_MS) {
      return json({ ok: false, error: "Please wait a moment before sending." }, 429);
    }
    if (elapsed > 60 * 60 * 1000) {
      return json({ ok: false, error: "This form session expired. Please refresh and try again." }, 400);
    }

    // Fail fast on true misconfiguration before consuming the rate-limit quota.
    const config = readEmailConfig();
    if (config.missing.length > 0) {
      console.error(`[contact] email delivery not configured; missing: ${config.missing.join(", ")}`);
      return json(
        {
          ok: false,
          error: `Email delivery is not configured on the server. Missing: ${config.missing.join(", ")}. Add them in Vercel → Settings → Environment Variables (Production), then redeploy — env vars only reach a running deployment after a new deploy.`,
          missing: config.missing,
        },
        503,
      );
    }

    const key = clientKey(request);
    if (isRateLimited(key)) {
      return json({ ok: false, error: "Too many messages were sent. Please try again later." }, 429);
    }

    const resend = new Resend(config.apiKey);
    const built = buildEmail(name, email, subject, message);
    const mail: MailPayload = {
      from: config.from,
      to: config.to,
      replyTo: email,
      subject: `[Portfolio] ${built.subject}`,
      text: built.text,
      html: built.html,
    };

    let result = await trySend(resend, mail);
    let usedFallback = false;

    // Unverified custom domain? Retry once with the free test sender.
    if (result.error && config.senderMode === "custom" && isSenderProblem(result.error)) {
      usedFallback = true;
      result = await trySend(resend, { ...mail, from: TEST_SENDER });
    }

    if (result.error) {
      refundQuota(key);
      console.error(
        `[contact] Resend send failed: name=${result.error.name ?? "unknown"} status=${result.error.statusCode ?? "n/a"} senderMode=${usedFallback ? "test-fallback" : config.senderMode}`,
      );
      const described = describeResendError(result.error);
      return json({ ok: false, error: described.message }, described.status);
    }

    // Success ONLY when Resend confirms with a real message id — never a false success.
    return json({ ok: true, message: "Your message was sent successfully." }, 200);
  } catch (error) {
    console.error("Contact route error:", error);
    return json({ ok: false, error: "An unexpected server error occurred. Please try again later." }, 500);
  }
}