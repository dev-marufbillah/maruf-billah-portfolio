import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Vercel Functions cap the response body at 4.5 MB. */
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Cloudinary serves `raw` uploads with `Content-Disposition: attachment` (and
 * sometimes `application/octet-stream`). An <iframe> pointing straight at that
 * URL therefore triggers a DOWNLOAD and stays blank. This same-origin proxy
 * re-serves the bytes as `application/pdf` + `inline`, so the PDF renders in
 * the preview popup instead of downloading. `?mode=download` deliberately
 * restores the attachment header for the Download button.
 */
function allowedSource(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function error(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const source = allowedSource(params.get("src"));
  if (!source) return error("Invalid resume source. Only https://res.cloudinary.com URLs are allowed.");

  const download = params.get("mode") === "download";
  const safeName = (params.get("name") || "Maruf-Billah-Resume.pdf")
    .replace(/[^\w.\- ]/g, "_")
    .slice(0, 120);

  try {
    const upstream = await fetch(source, { cache: "no-store" });
    if (!upstream.ok) return error(`Could not load the PDF (HTTP ${upstream.status}).`, 502);

    const bytes = new Uint8Array(await upstream.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) {
      return error("The PDF is larger than 4 MB and cannot be previewed here. Please use a smaller file.", 413);
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeName}"`,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (caught) {
    return error(`Could not reach the PDF host: ${caught instanceof Error ? caught.message : "network error"}`, 502);
  }
}