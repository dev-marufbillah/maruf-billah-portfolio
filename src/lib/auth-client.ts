"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser client only talks to /api/auth. No database driver, no secrets and
 * no CLOUDINARY_API_SECRET ever reaches the frontend bundle.
 */
export const authClient = createAuthClient({
  baseURL: (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "") || undefined,
});

export const { signIn, signOut, useSession } = authClient;
