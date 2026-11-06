import "server-only";

import { v2 as cloudinary } from "cloudinary";

/** Vercel Functions cap the request body at 4.5 MB; base64 adds ~33%. */
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "3 MB";

/** Only these upload types are accepted from the Content Studio. */
export const ALLOWED_UPLOAD_PREFIXES = ["data:image/", "data:application/pdf"] as const;

/** Vercel values are often pasted WITH quotes or trailing spaces. */
export function cleanEnv(value: unknown): string {
  const raw = (typeof value === "string" ? value : "").trim();
  if (raw.length >= 2) {
    const double = raw.startsWith('"') && raw.endsWith('"');
    const single = raw.startsWith("'") && raw.endsWith("'");
    if (double || single) return raw.slice(1, -1).trim();
  }
  return raw;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPrefix: string;
  missing: string[];
  warnings: string[];
}

/** Reads server-side config on EVERY request. Never returns values to the client. */
export function readCloudinaryConfig(): CloudinaryConfig {
  const cloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY);
  const apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET);
  const rawPrefix = cleanEnv(process.env.CLOUDINARY_UPLOAD_PREFIX);

  const missing: string[] = [];
  const warnings: string[] = [];
  if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  else if (/\s|@|\//.test(cloudName)) warnings.push("CLOUDINARY_CLOUD_NAME should be just the short cloud name, not a URL or email.");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

  // A non-https prefix makes the SDK switch to its http module and breaks TLS.
  let uploadPrefix = "";
  if (rawPrefix) {
    if (rawPrefix.startsWith("https://")) uploadPrefix = rawPrefix.replace(/\/+$/, "");
    else warnings.push("CLOUDINARY_UPLOAD_PREFIX must start with https:// — ignoring it.");
  }

  return { cloudName, apiKey, apiSecret, uploadPrefix, missing, warnings };
}

export function cloudinaryClient() {
  const config = readCloudinaryConfig();
  if (config.missing.length > 0) {
    throw new Error(
      `Cloudinary is not configured on this deployment. Missing: ${config.missing.join(", ")}. Add them in Vercel → Settings → Environment Variables (Production), then Redeploy.`,
    );
  }
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
    ...(config.uploadPrefix ? { upload_prefix: config.uploadPrefix } : {}),
  });
  return cloudinary;
}

export function parseDataUrl(value: unknown) {
  if (typeof value !== "string" || !ALLOWED_UPLOAD_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    throw new Error("Only image files (PNG/JPG/WebP/SVG/GIF) and PDF files are allowed.");
  }
  const comma = value.indexOf(",");
  if (comma < 0) throw new Error("Invalid file payload.");
  const header = value.slice(0, comma);
  if (!header.includes(";base64")) throw new Error("Invalid base64 file payload.");
  const mime = header.slice(5, header.indexOf(";"));
  const base64 = value.slice(comma + 1);
  const bytes = Math.floor((base64.length * 3) / 4);
  if (bytes > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File is larger than ${MAX_UPLOAD_LABEL}. Vercel limits request bodies to 4.5 MB and base64 adds ~33%, so please upload a PDF under ${MAX_UPLOAD_LABEL} (compress it if needed).`,
    );
  }
  return { dataUrl: value, mime, bytes };
}

type Loose = Record<string, unknown>;

function asRecord(value: unknown): Loose | null {
  return value && typeof value === "object" ? (value as Loose) : null;
}

function pickString(source: Loose, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickCode(source: Loose): number | null {
  for (const key of ["http_code", "statusCode", "status"]) {
    const value = source[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && /^\d{3}$/.test(value)) return Number(value);
  }
  return null;
}

/**
 * Cloudinary's Node SDK rejects with PLAIN OBJECTS like
 * `{ error: { message: "Invalid Signature", http_code: 401 } }`, not with
 * `Error` instances. The old `error instanceof Error` check therefore threw
 * away the real reason and the UI only ever showed "Upload failed."
 */
export function describeCloudinaryError(error: unknown): string {
  const config = readCloudinaryConfig();
  let raw = "";
  let name = "";
  let code: number | null = null;

  if (error instanceof Error) raw = error.message;
  else if (typeof error === "string") raw = error;
  else {
    const outer = asRecord(error);
    if (outer) {
      raw = pickString(outer, ["message", "msg", "error"]);
      name = pickString(outer, ["name", "error_name"]);
      code = pickCode(outer);
      const inner = asRecord(outer.error);
      if (inner) {
        raw = pickString(inner, ["message", "msg", "error"]) || raw;
        name = pickString(inner, ["name"]) || name;
        code = code ?? pickCode(inner);
        const deepest = asRecord(inner.error);
        if (deepest) {
          raw = pickString(deepest, ["message", "msg"]) || raw;
          code = code ?? pickCode(deepest);
        }
      }
    }
  }

  // Never echo a secret if Cloudinary includes request params in its message.
  for (const secret of [config.apiKey, config.apiSecret]) {
    if (secret && secret.length >= 6) raw = raw.split(secret).join("***");
  }
  raw = raw.replace(/\s+/g, " ").replace(/\.+$/, "").slice(0, 260);

  const text = `${raw} ${name}`.toLowerCase();
  const hint = "Check them in Vercel → Settings → Environment Variables (Production), WITHOUT quotes/spaces, then Redeploy.";

  if (/must supply api_key|api_key.*(missing|required)|missing.*api.?key/.test(text)) {
    return `Cloudinary says CLOUDINARY_API_KEY is missing or invalid. ${hint}`;
  }
  if (/signature|invalid.*credential|api.?secret/.test(text)) {
    return `Cloudinary rejected the signature (${code ?? "auth"}): ${raw || "invalid credentials"}. Check CLOUDINARY_API_SECRET and CLOUDINARY_CLOUD_NAME — they must come from the SAME Cloudinary account. ${hint}`;
  }
  if (/cloud.?name|cloud not found|unknown cloud|invalid cloud|must supply cloud/.test(text)) {
    return `Cloudinary says the cloud name is wrong (${code ?? "config"}): ${raw}. CLOUDINARY_CLOUD_NAME is the short name from your Cloudinary dashboard, not a URL. ${hint}`;
  }
  if (/quota|limit|420|429|storage|plan/.test(text) || code === 420 || code === 429) {
    return `Cloudinary quota or rate limit reached (${code ?? "limit"}): ${raw}. Check your Cloudinary plan usage, then try again.`;
  }
  if (/not allowed|permission|unauthorized|forbidden|401|403/.test(text) || code === 401 || code === 403) {
    return `Cloudinary refused the upload (${code ?? "auth"}): ${raw || "not authorized"}. Verify all three Cloudinary values belong to the same account and the API key has upload permission. ${hint}`;
  }
  if (/invalid json|unexpected token|parse result|syntaxerror/i.test(text)) {
    return `Cloudinary returned an unexpected response (HTTP ${code ?? 500}): ${raw || "not JSON"}. This usually means CLOUDINARY_UPLOAD_PREFIX points to the wrong endpoint — remove that variable unless you know you need it, then Redeploy.`;
  }
  if (/econn|network|socket|timeout|unexpected status|enotfound|fetch failed|self.signed/i.test(text)) {
    return `Could not reach Cloudinary (${code ?? "network"}): ${raw || "connection failed"}. Retry in a moment; if it persists, check Vercel's outbound network and any CLOUDINARY_UPLOAD_PREFIX.`;
  }
  if (/configured|missing:/.test(text)) {
    return raw; // our own clear "not configured" Error
  }
  if (raw) {
    return `Cloudinary rejected the upload${code ? ` (HTTP ${code})` : ""}: ${raw}. ${hint}`;
  }
  return `Upload failed for an unknown reason. Open /api/admin/upload?check=config (while signed in) to see which values are missing. ${hint}`;
}