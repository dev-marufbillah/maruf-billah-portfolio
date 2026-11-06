import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { cloudinaryClient, describeCloudinaryError, MAX_UPLOAD_LABEL, parseDataUrl, readCloudinaryConfig } from "@/lib/cloudinary";
import { isDatabaseConfigured, isDevFallback } from "@/lib/db";
import { deleteAssetRecord, getAsset, putAsset } from "@/lib/assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}

function safeKey(value: unknown) {
  if (typeof value !== "string") return null;
  const key = value.trim();
  return /^[a-zA-Z0-9._-]{1,120}$/.test(key) ? key : null;
}

/**
 * Admin-only diagnostic. Open /api/admin/upload?check=config while signed in.
 * Reports ONLY flags and variable NAMES — never a key, secret or URL value.
 */
export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const config = readCloudinaryConfig();
  const databaseConfigured = isDatabaseConfigured();
  return json({
    ok: true,
    configured: config.missing.length === 0,
    missing: config.missing,
    warnings: config.warnings,
    cloudNameSet: Boolean(config.cloudName),
    apiKeySet: Boolean(config.apiKey),
    apiSecretSet: Boolean(config.apiSecret),
    uploadPrefixSet: Boolean(config.uploadPrefix),
    databaseConfigured,
    databaseMode: isDevFallback() ? "dev-file (local only)" : databaseConfigured ? "mongodb" : "unconfigured",
    maxUpload: MAX_UPLOAD_LABEL,
    endpoint: "/api/admin/upload",
    note:
      config.missing.length === 0
        ? "All three Cloudinary variables are present. Values are read live on every request."
        : "Add the missing variables in Vercel → Settings → Environment Variables (Production + Preview), then Redeploy.",
  });
}

/**
 * Signed, server-side Cloudinary upload. The API secret never leaves the server.
 * Body: { key, dataUrl, replace? }. `key` ties the asset to a content field so
 * an older upload can be removed from Cloudinary when it is replaced.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  let body: { key?: unknown; dataUrl?: unknown; replace?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ ok: false, error: "Invalid JSON body (or the request was too large for Vercel's 4.5 MB limit)." }, 400);
  }
  const key = safeKey(body?.key);
  if (!key) return json({ ok: false, error: "A valid asset `key` is required." }, 400);

  let parsed: ReturnType<typeof parseDataUrl>;
  try {
    parsed = parseDataUrl(body?.dataUrl);
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "Invalid file." }, 400);
  }

  // Fail fast with an actionable message BEFORE calling Cloudinary.
  const config = readCloudinaryConfig();
  if (config.missing.length > 0) {
    console.error(`[upload] Cloudinary not configured; missing: ${config.missing.join(", ")}`);
    return json(
      {
        ok: false,
        error: `Cloudinary is not configured on this deployment. Missing: ${config.missing.join(", ")}. Add them in Vercel → Settings → Environment Variables (Production), then Redeploy.`,
        missing: config.missing,
      },
      503,
    );
  }

  let uploadedUrl = "";
  try {
    const cloudinary = cloudinaryClient();
    const resourceType: "raw" | "image" = parsed.mime === "application/pdf" ? "raw" : "image";

    // Cleaning up a previous asset is optional — a database hiccup must not
    // prevent a brand-new upload from succeeding.
    let previous: Awaited<ReturnType<typeof getAsset>> = null;
    try {
      previous = await getAsset(key);
    } catch (error) {
      console.warn("[upload] could not read previous asset:", error instanceof Error ? error.message : error);
    }

    const uploadOptions = {
      folder: "maruf-portfolio",
      public_id: key.replace(/[^a-zA-Z0-9_-]/g, "_"),
      overwrite: true,
      invalidate: true,
      resource_type: resourceType,
      ...(config.uploadPrefix ? { upload_prefix: config.uploadPrefix } : {}),
    };

    let uploaded;
    try {
      uploaded = await cloudinary.uploader.upload(parsed.dataUrl, uploadOptions);
    } catch (error) {
      console.error("[upload] Cloudinary rejected:", error);
      return json({ ok: false, error: describeCloudinaryError(error) }, 502);
    }

    uploadedUrl = uploaded.secure_url;

    try {
      await putAsset({
        key,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        resourceType,
        bytes: uploaded.bytes ?? parsed.bytes,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[upload] database save failed:", error);
      return json(
        {
          ok: false,
          error: `The file reached Cloudinary, but its URL could not be saved to the database (${error instanceof Error ? error.message : "database error"}). Check MONGODB_URI, the Atlas database user's readWrite role and Network Access 0.0.0.0/0, then Redeploy and try again.`,
        },
        502,
      );
    }

    // Optional cleanup of the replaced Cloudinary asset.
    if (body?.replace !== false && previous && previous.publicId !== uploaded.public_id) {
      await cloudinary.uploader
        .destroy(previous.publicId, {
          resource_type: previous.resourceType === "raw" ? "raw" : "image",
          invalidate: true,
          ...(config.uploadPrefix ? { upload_prefix: config.uploadPrefix } : {}),
        })
        .catch((error: unknown) => console.warn("[upload] old asset cleanup failed:", error));
    }

    return json({
      ok: true,
      key,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      message: "Uploaded to Cloudinary and saved to the database. Click Save to publish it on the site.",
    });
  } catch (error) {
    console.error("[upload] failed:", error);
    return json(
      {
        ok: false,
        error: describeCloudinaryError(error),
        ...(uploadedUrl ? { uploadedUrl } : {}),
      },
      502,
    );
  }
}

/** Admin-only removal of an asset (Cloudinary + database record). */
export async function DELETE(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;
  const key = safeKey(new URL(request.url).searchParams.get("key"));
  if (!key) return json({ ok: false, error: "A valid `key` query parameter is required." }, 400);

  try {
    const existing = await getAsset(key);
    if (existing) {
      const cloudinary = cloudinaryClient();
      await cloudinary.uploader
        .destroy(existing.publicId, { resource_type: existing.resourceType === "raw" ? "raw" : "image", invalidate: true })
        .catch((error: unknown) => console.warn("[upload] destroy failed:", error));
    }
    await deleteAssetRecord(key);
    return json({ ok: true, key, message: "Asset removed from Cloudinary and the database." });
  } catch (error) {
    return json({ ok: false, error: describeCloudinaryError(error) }, 502);
  }
}