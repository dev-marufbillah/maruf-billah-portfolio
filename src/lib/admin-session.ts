import "server-only";

import type { NextRequest } from "next/server";
import { getAuth, adminEmail } from "@/lib/auth";

export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
}

/** Full server-side session verification. Never trusts a cookie's mere presence. */
export async function getAdminIdentity(request: Request | NextRequest): Promise<AdminIdentity | null> {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    const email = session?.user?.email?.toLowerCase();
    if (!session?.user?.id || !email) return null;
    const allowed = adminEmail();
    if (allowed && email !== allowed) return null;
    return { id: session.user.id, email, name: session.user.name || "Admin" };
  } catch (error) {
    console.error("[admin] session check failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function requireAdmin(request: Request | NextRequest) {
  const identity = await getAdminIdentity(request);
  if (!identity) {
    return {
      identity: null,
      response: Response.json(
        { ok: false, error: "Unauthorized. Sign in at /login to edit this portfolio." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      ),
    } as const;
  }
  return { identity, response: null } as const;
}
