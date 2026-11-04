"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser client only talks to /api/auth on the SAME origin as the page.
 *
 * We deliberately do NOT set `baseURL` from an environment variable:
 * NEXT_PUBLIC_* values are inlined at build time, so a localhost value baked
 * into a Vercel build made the browser POST to http://localhost:3000 and fail
 * with "Failed to fetch" (mixed content / wrong host). Same-origin also works
 * on localhost, Vercel preview URLs, production URLs and custom domains
 * without any redeploy or env sync.
 *
 * No database driver and no secret ever reaches the frontend bundle.
 */
export const authClient = createAuthClient({
  basePath: "/api/auth",
});

export const { signIn, signOut, useSession } = authClient;