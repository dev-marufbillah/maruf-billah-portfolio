import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_MIN_SUBMIT_MS, contactSchema } from "@/lib/validation";

export const runtime = "nodejs";
/** Env vars must be read on every request, never baked into a cached response. */
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 3;
const submissions = new Map<string, number[]>();

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

interface EmailConfig {
  apiKey: string;
  to: string;
  from: string;
  missing: string[];
}

/**
 * Server-only configuration. Values are trimmed so whitespace-only Vercel
 * variables are correctly reported as missing. Never returned to the client.
 */
function readEmailConfig(): EmailConfig {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const to = (process.env.CONTACT_TO_EMAIL || "").trim();
  const from = (process.env.CONTACT_FROM_EMAIL || "").trim();
  const missing: string[] = [];
  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!to) missing.push("CONTACT_TO_EMAIL");
  if (!from) missing.push("CONTACT_FROM_EMAIL");
  return { apiKey, to, from, missing };
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

/**
 * Lightweight runtime diagnostic. Reports only the NAMES of missing variables,
 * never their values. Used by the form to show an accurate status badge even
 * though the homepage itself is statically prerendered.
 */
export async function GET() {
  const { missing } = readEmailConfig();
  return json({
    ok: true,
    configured: missing.length === 0,
    missing,
    endpoint: "/api/contact",
    method: "POST",
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = contactSchema.safeParse(payload);

    if (!parsed.success) {
      return json(
        {
          ok: false,
          error: "Please check the form fields and try again.",
          fields: parsed.error.flatten().fieldErrors,
        },
        400,
      );
    }

    const { name, email, subject, message, company, startedAt } = parsed.data;

    if (company) {
      return json({ ok: false, error: "Submission rejected." }, 400);
    }

    const timestamp = Number(startedAt);
    const elapsed = Date.now() - timestamp;
    if (elapsed < CONTACT_MIN_SUBMIT_MS) {
      return json({ ok: false, error: "Please wait a moment before sending." }, 429);
    }
    if (elapsed > 60 * 60 * 1000) {
      return json({ ok: false, error: "This form session expired. Please refresh and try again." }, 400);
    }

    // Fail fast on misconfiguration before consuming the rate-limit quota.
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

    if (isRateLimited(clientKey(request))) {
      return json({ ok: false, error: "Too many messages were sent. Please try again later." }, 429);
    }

    const resend = new Resend(config.apiKey);
    const safeSubject = subject.replace(/[\r\n]+/g, " ").trim();
    const text = [
      `New portfolio message`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${safeSubject}`,
      ``,
      message,
    ].join("\n");

    // `to` is always CONTACT_TO_EMAIL; the visitor's address is only used as replyTo.
    const { data, error } = await resend.emails.send({
      from: config.from,
      to: config.to,
      replyTo: email,
      subject: `[Portfolio] ${safeSubject}`,
      text,
    });

    if (error) {
      console.error("[contact] Resend rejected the request:", error.name, error.message);
      return json(
        {
          ok: false,
          error: "The email service rejected the message. Check that CONTACT_FROM_EMAIL uses a domain verified in Resend and that the API key is valid, then try again.",
        },
        502,
      );
    }

    if (!data?.id) {
      console.error("[contact] Resend returned no message id.");
      return json({ ok: false, error: "The email service did not confirm delivery. Please try again later." }, 502);
    }

    return json({ ok: true, message: "Your message was sent successfully." }, 200);
  } catch (error) {
    console.error("Contact route error:", error);
    return json({ ok: false, error: "An unexpected server error occurred. Please try again later." }, 500);
  }
}
