import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { memoryAdapter } from "better-auth/adapters/memory";
import { nextCookies } from "better-auth/next-js";
import {
  connectMongoose,
  devMemory,
  getNativeClient,
  getNativeDb,
  isDevFallback,
  isVercelRuntime,
} from "@/lib/db";

export function adminEmail() {
  return (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
}

function authSecret() {
  const secret = (process.env.BETTER_AUTH_SECRET || "").trim();
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not configured. Add it to .env.local or Vercel.");
  return secret;
}

/** Vercel injects these automatically; they are the real deployment hosts. */
function vercelHosts(): string[] {
  return [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
  ]
    .map((value) => (value || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, ""))
    .filter((value) => value.length > 0);
}

/**
 * Never trust a localhost BETTER_AUTH_URL on Vercel. A leftover local value
 * used to make cookies/origin checks point at the visitor's own machine.
 */
export function authBaseURL() {
  const explicit = (process.env.BETTER_AUTH_URL || "").trim().replace(/\/$/, "");
  if (explicit.startsWith("https://")) return explicit;
  const host = vercelHosts()[0];
  if (host) return `https://${host}`;
  return explicit || "http://localhost:3000";
}

function trustedOrigins() {
  const origins = new Set<string>([authBaseURL()]);
  for (const host of vercelHosts()) origins.add(`https://${host}`);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
  if (appUrl.startsWith("https://")) origins.add(appUrl);
  origins.add("http://localhost:3000");
  // Vercel preview deployments and Arena live preview proxy.
  if (isVercelRuntime()) origins.add("https://*.vercel.app");
  origins.add("https://*.e2b.app");
  return [...origins];
}

type AuthInstance = ReturnType<typeof betterAuth>;

const globalRef = globalThis as unknown as {
  __marufAuth?: AuthInstance;
  __marufAuthPromise?: Promise<AuthInstance>;
  __marufAdminSeeded?: boolean;
};

async function buildAuth(): Promise<AuthInstance> {
  if (isDevFallback()) {
    const memory = devMemory().auth ?? {};
    return betterAuth({
      appName: "MARUF.B Content Studio",
      baseURL: authBaseURL(),
      secret: authSecret(),
      trustedOrigins: trustedOrigins(),
      database: memoryAdapter(memory),
      emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 8 },
      session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
      plugins: [nextCookies()],
    }) as unknown as AuthInstance;
  }

  if (!process.env.MONGODB_URI?.trim()) {
    throw new Error("MONGODB_URI is not configured. Add it in Vercel → Environment Variables.");
  }

  await connectMongoose();
  return betterAuth({
    appName: "MARUF.B Content Studio",
    baseURL: authBaseURL(),
    secret: authSecret(),
    trustedOrigins: trustedOrigins(),
    database: mongodbAdapter(getNativeDb(), {
      client: getNativeClient(),
      // Atlas free/shared clusters and standalone test servers may not support transactions.
      transaction: false,
    }),
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 8 },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    plugins: [nextCookies()],
  }) as unknown as AuthInstance;
}

/** One Better Auth instance per warm serverless container (not per request). */
export async function getAuth(): Promise<AuthInstance> {
  if (globalRef.__marufAuth) return globalRef.__marufAuth;
  globalRef.__marufAuthPromise ??= buildAuth().then(async (auth) => {
    globalRef.__marufAuth = auth;
    await ensureAdminUser(auth);
    return auth;
  });
  return globalRef.__marufAuthPromise;
}

/**
 * Creates exactly one admin from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Public sign-up is disabled, so no other account can ever be created.
 */
export async function ensureAdminUser(auth: AuthInstance): Promise<void> {
  if (globalRef.__marufAdminSeeded) return;
  const email = adminEmail();
  const password = (process.env.ADMIN_PASSWORD || "").trim();
  if (!email || !password) {
    globalRef.__marufAdminSeeded = true;
    return;
  }
  if (password.length < 8) {
    console.warn("[admin] ADMIN_PASSWORD is shorter than 8 characters; admin account was not created.");
    return;
  }

  const context = await auth.$context;
  const existing = await context.internalAdapter.findUserByEmail(email, { includeAccounts: true });
  if (!existing?.user) {
    const user = await context.internalAdapter.createUser(
      { email, name: "Maruf Billah", emailVerified: true, image: null },
      { method: "email-password" },
    );
    const hash = await context.password.hash(password);
    await context.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hash,
    });
    console.info("[admin] Single admin account created from ADMIN_EMAIL / ADMIN_PASSWORD.");
  } else if (!existing.accounts.some((account) => account.providerId === "credential" && account.password)) {
    const hash = await context.password.hash(password);
    await context.internalAdapter.linkAccount({
      userId: existing.user.id,
      providerId: "credential",
      accountId: existing.user.id,
      password: hash,
    });
  }
  globalRef.__marufAdminSeeded = true;
}

export function isHostedWithoutDatabase() {
  return isVercelRuntime() && !process.env.MONGODB_URI?.trim();
}