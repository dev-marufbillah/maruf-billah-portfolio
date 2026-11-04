import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin-session";
import { authBaseURL } from "@/lib/auth";
import { connectMongoose, isDevFallback, isDatabaseConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Optional, secret-free connectivity probe. Add ?check=db when something is
 * wrong; it never returns the URI, password or raw driver error.
 */
async function probeDatabase(): Promise<{ reachable: boolean; reason: string }> {
  if (!isDatabaseConfigured()) {
    return isDevFallback()
      ? { reachable: true, reason: "Local dev fallback (in-memory) is active; no MongoDB needed." }
      : { reachable: false, reason: "MONGODB_URI is not set. Add it in Vercel → Environment Variables, then redeploy." };
  }
  try {
    const connection = await connectMongoose();
    await connection.connection.db?.admin().ping();
    return { reachable: true, reason: "MongoDB connection and ping succeeded." };
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    let reason = "MongoDB connection failed. Check the server logs for the technical detail.";
    if (/authentication failed|bad auth|auth failed|invalid.*credential/i.test(raw)) {
      reason = "MongoDB rejected the database user or password. Check Atlas → Database Access and MONGODB_URI.";
    } else if (/timed out|serverselection|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|ENETUNREACH/i.test(raw)) {
      reason = "MongoDB is unreachable. In Atlas → Network Access allow this machine's IP and Vercel (0.0.0.0/0); use the mongodb+srv:// URI from Connect → Drivers.";
    } else if (/SSL|TLS|certificate/i.test(raw)) {
      reason = "MongoDB TLS error. Use the mongodb+srv:// URI from Atlas → Connect → Drivers.";
    }
    console.error("[admin] database probe failed:", error instanceof Error ? error.message : error);
    return { reachable: false, reason };
  }
}

/** Session + non-secret config state for the Content Studio UI and debugging. */
export async function GET(request: Request) {
  const identity = await getAdminIdentity(request);
  const configured = Boolean(process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD?.trim());
  const checkDb = new URL(request.url).searchParams.get("check") === "db";
  const database = checkDb ? await probeDatabase() : undefined;

  return NextResponse.json(
    {
      ok: true,
      config: {
        // Only booleans / public origins — never values of secrets.
        adminConfigured: configured,
        authSecretConfigured: Boolean(process.env.BETTER_AUTH_SECRET?.trim()),
        databaseConfigured: isDatabaseConfigured(),
        databaseMode: isDevFallback() ? "memory-dev-fallback" : "mongodb",
        authBaseURL: authBaseURL(),
        // The browser auth client now always uses the same origin as the page.
        clientAuthMode: "same-origin",
      },
      database,
      session: {
        passwordRequired: true,
        passwordConfigured: configured,
        setupAllowed: false, // public sign-up is disabled; admin comes from env / seed
        authenticated: Boolean(identity),
        persistent: true,
        localMode: false,
        message: identity
          ? `Signed in as ${identity.email}. Only this account can edit the portfolio.`
          : configured
            ? "Sign in with your admin email and password."
            : isDevFallback()
              ? "Add ADMIN_EMAIL, ADMIN_PASSWORD and BETTER_AUTH_SECRET to .env.local, then restart."
              : "Add ADMIN_EMAIL, ADMIN_PASSWORD and BETTER_AUTH_SECRET in Vercel, then redeploy.",
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}