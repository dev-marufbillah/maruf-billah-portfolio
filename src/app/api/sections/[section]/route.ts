import { NextResponse } from "next/server";
import { deleteSection, isSectionKey, readAllSections, writeSections } from "@/lib/sections";
import { requireAdmin } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" };

type Params = { params: Promise<{ section: string }> };

/** Public GET — one section, no cache. */
export async function GET(_request: Request, { params }: Params) {
  const { section } = await params;
  if (!isSectionKey(section)) {
    return NextResponse.json({ ok: false, error: "Unknown section." }, { status: 404, headers: noStore });
  }
  try {
    const { records, hasData } = await readAllSections();
    return NextResponse.json(
      { ok: true, section, data: hasData ? (records[section]?.data ?? null) : null },
      { headers: noStore },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Content service unavailable." },
      { status: 503, headers: noStore },
    );
  }
}

/** Admin-only upsert (single section). */
export async function PUT(request: Request, { params }: Params) {
  const { section } = await params;
  if (!isSectionKey(section)) {
    return NextResponse.json({ ok: false, error: "Unknown section." }, { status: 404, headers: noStore });
  }
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  let data: unknown;
  try {
    const body = (await request.json()) as { data?: unknown };
    data = body?.data;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400, headers: noStore });
  }
  if (data === undefined || data === null) {
    return NextResponse.json({ ok: false, error: "Section data is required." }, { status: 400, headers: noStore });
  }

  try {
    const result = await writeSections({ [section]: data });
    return NextResponse.json(
      { ok: true, saved: result.saved, data, message: `${section} saved to the database.` },
      { headers: noStore },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Save failed." },
      { status: 500, headers: noStore },
    );
  }
}

/** Admin-only create/upsert alias. */
export async function POST(request: Request, { params }: Params) {
  return PUT(request, { params });
}

/** Admin-only delete (falls back to defaults for that section). */
export async function DELETE(request: Request, { params }: Params) {
  const { section } = await params;
  if (!isSectionKey(section)) {
    return NextResponse.json({ ok: false, error: "Unknown section." }, { status: 404, headers: noStore });
  }
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;
  try {
    await deleteSection(section);
    return NextResponse.json({ ok: true, section, message: `${section} removed; defaults will be shown.` }, { headers: noStore });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Delete failed." },
      { status: 500, headers: noStore },
    );
  }
}
