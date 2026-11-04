import "server-only";

import { v2 as cloudinary } from "cloudinary";

export function cloudinaryClient() {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (server-side only).",
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
    // Optional server-side endpoint override (private CDN proxy / local QA mock).
    // Never read from the client; no secret is involved.
    ...(process.env.CLOUDINARY_UPLOAD_PREFIX ? { upload_prefix: process.env.CLOUDINARY_UPLOAD_PREFIX.trim() } : {}),
  });
  return cloudinary;
}

/** Only these upload types are accepted from the Content Studio. */
export const ALLOWED_UPLOAD_PREFIXES = ["data:image/", "data:application/pdf"] as const;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

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
  if (bytes > MAX_UPLOAD_BYTES) throw new Error("File is larger than 8 MB. Please upload a smaller file.");
  return { dataUrl: value, mime, bytes };
}
