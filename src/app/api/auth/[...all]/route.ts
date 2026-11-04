import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Turn an infrastructure failure into a short, actionable, secret-free message.
 * Never echo the raw error: MongoDB errors can contain the full URI with the
 * database password.
 */
function safeAuthError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (/BETTER_AUTH_SECRET/i.test(raw)) {
    return "BETTER_AUTH_SECRET is missing. Add a long random value, then redeploy.";
  }
  if (/MONGODB_URI is not configured/i.test(raw)) {
    return "MONGODB_URI is missing. Add the Atlas connection string in Vercel, then redeploy.";
  }
  if (/authentication failed|bad auth|auth failed|invalid.*credential/i.test(raw)) {
    return "MongoDB rejected the database user or password. Check the Atlas Database Access user and MONGODB_URI.";
  }
  if (/timed out|serverselection|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|ENETUNREACH/i.test(raw)) {
    return "MongoDB is unreachable. In Atlas → Network Access allow this machine's IP and Vercel (0.0.0.0/0), then use the mongodb+srv:// URI from Connect → Drivers.";
  }
  if (/SSL|TLS|certificate/i.test(raw)) {
    return "MongoDB TLS error. Use the mongodb+srv:// URI from Atlas → Connect → Drivers.";
  }
  return "Auth service could not start. Check the server logs and /api/admin/session?check=db.";
}

/**
 * Better Auth catch-all. `toNextJsHandler` needs a handler-shaped object, so we
 * lazily resolve the cached auth instance per request (never at build time).
 */
const authHandler = async (request: Request) => {
  try {
    const auth = await getAuth();
    return await auth.handler(request);
  } catch (error) {
    // Full detail stays server-side only; the browser gets a safe `message`
    // field so better-auth's client shows the real reason instead of the
    // generic "Sign-in failed. Check your credentials." fallback.
    console.error("[auth] handler failed:", error);
    return Response.json(
      {
        ok: false,
        message: `Auth unavailable: ${safeAuthError(error)}`,
        code: "AUTH_SERVICE_UNAVAILABLE",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
};

const handler = toNextJsHandler({ handler: authHandler });

export const GET = handler.GET;
export const POST = handler.POST;
export const PATCH = handler.PATCH;
export const PUT = handler.PUT;
export const DELETE = handler.DELETE;