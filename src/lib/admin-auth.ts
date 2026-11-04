/**
 * LEGACY — replaced by Better Auth (src/lib/auth.ts) in Step 2.
 * Kept only because the project rules say "delete no files". No route imports
 * this module anymore; /api/admin/{login,logout,setup} are explicit 410 shims.
 * Do not use for new code.
 */
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AdminSessionInfo } from "@/types/content";

export const runtime = "nodejs";

const AUTH_DIR = path.join(process.cwd(), "content");
const AUTH_FILE = path.join(AUTH_DIR, "admin-auth.json");
export const ADMIN_COOKIE_NAME = "mb_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const PBKDF2_ITERATIONS = 120_000;
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

interface StoredAuth {
  salt: string;
  hash: string;
  sessionSecret: string;
  createdAt: string;
}

interface AuthContext {
  passwordConfigured: boolean;
  sessionSecret: string;
  checkPassword: (password: string) => boolean;
}

const attempts = new Map<string, { count: number; resetAt: number }>();

function isVercelRuntime() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

export function isLocalRequest(request: Request) {
  const host = (request.headers.get("host") || "").toLowerCase();
  return host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("[::1]");
}

function isRemoteProduction(request: Request) {
  return process.env.NODE_ENV === "production" && !isLocalRequest(request);
}

function envPassword() {
  return (process.env.ADMIN_PASSWORD || "").trim();
}

async function readStoredAuth(): Promise<StoredAuth | null> {
  try {
    const raw = await readFile(AUTH_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    if (
      typeof parsed.salt === "string" &&
      typeof parsed.hash === "string" &&
      typeof parsed.sessionSecret === "string" &&
      typeof parsed.createdAt === "string"
    ) {
      return parsed as StoredAuth;
    }
  } catch {
    return null;
  }
  return null;
}

function deriveHash(password: string, salt: string) {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, "sha256").toString("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function getAuthContext(): Promise<AuthContext> {
  const configured = envPassword();
  const stored = await readStoredAuth();
  const passwordConfigured = Boolean(configured || stored);
  const sessionSecret =
    (process.env.ADMIN_SESSION_SECRET || "").trim() || configured || stored?.sessionSecret || "";

  const checkPassword = (password: string) => {
    if (configured) return safeEqual(password, configured);
    if (stored) return safeEqual(deriveHash(password, stored.salt), stored.hash);
    return false;
  };

  return { passwordConfigured, sessionSecret, checkPassword };
}

export async function setupAdminPassword(password: string) {
  const context = await getAuthContext();
  if (context.passwordConfigured) throw new Error("Admin password is already configured.");
  if (isVercelRuntime()) throw new Error("Browser setup is disabled on Vercel. Set ADMIN_PASSWORD in the environment instead.");
  if (password.length < 8) throw new Error("Use at least 8 characters.");

  const salt = randomBytes(16).toString("hex");
  const sessionSecret = randomBytes(32).toString("hex");
  const record: StoredAuth = {
    salt,
    hash: deriveHash(password, salt),
    sessionSecret,
    createdAt: new Date().toISOString(),
  };

  await mkdir(AUTH_DIR, { recursive: true });
  await writeFile(AUTH_FILE, JSON.stringify(record, null, 2), { encoding: "utf8", mode: 0o600 });
  // Use the same effective secret the login/session verifier will use.
  return (await getAuthContext()).sessionSecret;
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function canAttemptLogin(request: Request) {
  const key = getClientIp(request);
  const now = Date.now();
  const entry = attempts.get(key);
  if (entry && entry.resetAt > now && entry.count >= MAX_LOGIN_ATTEMPTS) return false;
  return true;
}

export function recordLoginFailure(request: Request) {
  const key = getClientIp(request);
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    attempts.set(key, { count: entry.count + 1, resetAt: entry.resetAt });
  }
  for (const [ip, value] of attempts.entries()) {
    if (value.resetAt <= now) attempts.delete(ip);
  }
}

export function clearLoginFailures(request: Request) {
  attempts.delete(getClientIp(request));
}

function createSignature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionValue(secret: string) {
  const now = Date.now();
  const payload = Buffer.from(
    JSON.stringify({ iat: now, exp: now + SESSION_MAX_AGE_SECONDS * 1000 }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${createSignature(payload, secret)}`;
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...valueParts] = part.trim().split("=");
    if (key === name) return valueParts.join("=");
  }
  return null;
}

export function verifySession(request: Request, secret: string) {
  const value = readCookie(request, ADMIN_COOKIE_NAME);
  if (!value || !secret) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  const expected = createSignature(payload, secret);
  if (!safeEqual(signature, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: unknown };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) return forwardedProto.split(",")[0]?.trim() === "https";
  return request.url.startsWith("https://");
}

export function setSessionCookie(response: Response, request: Request, value: string) {
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=${value}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${isSecureRequest(request) ? "; Secure" : ""}`,
  );
}

export function clearSessionCookie(response: Response, request: Request) {
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isSecureRequest(request) ? "; Secure" : ""}`,
  );
}

export async function getSessionInfo(request: Request): Promise<AdminSessionInfo> {
  const context = await getAuthContext();
  const remoteProduction = isRemoteProduction(request);
  const passwordRequired = context.passwordConfigured || remoteProduction;
  const authenticated = context.passwordConfigured
    ? verifySession(request, context.sessionSecret)
    : !remoteProduction;
  const setupAllowed = !context.passwordConfigured && !isVercelRuntime();
  const persistent = !isVercelRuntime();

  let message = "Local project mode: changes can be saved to content/portfolio.json.";
  if (context.passwordConfigured && !authenticated) {
    message = "Enter your admin password to unlock editing. Only you can change this portfolio.";
  } else if (context.passwordConfigured && authenticated) {
    message = "Unlocked. Only this signed admin session can save project changes.";
  } else if (remoteProduction && !setupAllowed) {
    message = "Set ADMIN_PASSWORD in the hosting environment variables, redeploy, then reload this page.";
  } else if (remoteProduction && setupAllowed) {
    message = "Create your admin password once. After this, only someone with the password can edit the site.";
  } else if (!persistent) {
    message = "Hosted mode: changes save in this browser; export JSON for backup.";
  }

  return {
    passwordRequired,
    passwordConfigured: context.passwordConfigured,
    setupAllowed,
    authenticated,
    persistent,
    localMode: !remoteProduction && !context.passwordConfigured,
    message,
  };
}

export async function isAuthorized(request: Request) {
  const context = await getAuthContext();
  if (context.passwordConfigured) return verifySession(request, context.sessionSecret);
  return !isRemoteProduction(request);
}
