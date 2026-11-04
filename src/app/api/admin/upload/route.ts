import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { cloudinaryClient, parseDataUrl } from "@/lib/cloudinary";
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
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }
  const key = safeKey(body?.key);
  if (!key) return json({ ok: false, error: "A valid asset `key` is required." }, 400);

  let parsed: ReturnType<typeof parseDataUrl>;
  try {
    parsed = parseDataUrl(body?.dataUrl);
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "Invalid file." }, 400);
  }

  try {
    const cloudinary = cloudinaryClient();
    const previous = await getAsset(key);
    const resourceType = parsed.mime === "application/pdf" ? "raw" : "image";
    const uploadPrefix = (process.env.CLOUDINARY_UPLOAD_PREFIX || "").trim();
    const uploaded = await cloudinary.uploader.upload(parsed.dataUrl, {
      ...(uploadPrefix ? { upload_prefix: uploadPrefix } : {}),
      folder: "maruf-portfolio",
      public_id: key.replace(/[^a-zA-Z0-9_-]/g, "_"),
      overwrite: true,
      invalidate: true,
      resource_type: resourceType,
    });

    await putAsset({
      key,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      resourceType,
      bytes: uploaded.bytes ?? parsed.bytes,
      updatedAt: new Date().toISOString(),
    });

    // Optional cleanup of the replaced Cloudinary asset.
    if (body?.replace !== false && previous && previous.publicId !== uploaded.public_id) {
      await cloudinary.uploader
        .destroy(previous.publicId, { resource_type: previous.resourceType === "raw" ? "raw" : "image", invalidate: true, ...(uploadPrefix ? { upload_prefix: uploadPrefix } : {}) })
        .catch((error: unknown) => console.warn("[upload] old asset cleanup failed:", error));
    }

    return json({ ok: true, key, url: uploaded.secure_url, publicId: uploaded.public_id, message: "Image uploaded to Cloudinary and saved to the database." });
  } catch (error) {
    console.error("[upload] failed:", error);
    return json({ ok: false, error: error instanceof Error ? error.message : "Upload failed." }, 502);
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
    return json({ ok: false, error: error instanceof Error ? error.message : "Delete failed." }, 502);
  }
}
