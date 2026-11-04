import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin-session";
import { isDevFallback } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Session state for the Content Studio UI, backed by Better Auth. */
export async function GET(request: Request) {
  const identity = await getAdminIdentity(request);
  const configured = Boolean(process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD?.trim());
  return NextResponse.json(
    {
      ok: true,
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
