import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Legacy single-password admin auth has been replaced by Better Auth.
 * Kept as an explicit, non-functional shim so no old bookmark silently
 * falls back to an insecure path. Sign in at /login (or POST /api/auth/sign-in/email).
 */
function gone() {
  return NextResponse.json(
    {
      ok: false,
      error: "Legacy admin password login is disabled. Use the Better Auth sign-in at /login.",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST() {
  return gone();
}

export async function GET() {
  return gone();
}
