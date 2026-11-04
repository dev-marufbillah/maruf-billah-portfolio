import { NextResponse } from "next/server";
import { getAdminIdentity, requireAdmin } from "@/lib/admin-session";
import { deleteSection, isSectionKey, readAllSections, SECTION_KEYS, writeSections } from "@/lib/sections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}

/** Public read. Returns null content only when the DB has never been seeded. */
export async function GET(request: Request) {
  try {
    const { sections, records, hasData, mode } = await readAllSections();
    const identity = await getAdminIdentity(request);
    return json({
      ok: true,
      content: hasData ? sections : null,
      records,
      hasData,
      mode,
      session: {
        authenticated: Boolean(identity),
        email: identity?.email ?? null,
        publicSignUp: false,
      },
    });
  } catch (error) {
    console.error("[admin/content] read failed:", error);
    return json(
      { ok: false, content: null, records: {}, hasData: false, error: error instanceof Error ? error.message : "Content service unavailable." },
      503,
    );
  }
}

/** Admin-only batch save. Payload: { sections: { key: data, ... } }. */
export async function PUT(request: Request) {
  return save(request);
}

export async function POST(request: Request) {
  return save(request);
}

async function save(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const incoming = (payload as { sections?: unknown })?.sections;
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return json({ ok: false, error: "A `sections` object is required." }, 400);
  }
  const entries = incoming as Record<string, unknown>;
  const invalid = Object.keys(entries).filter((key) => !isSectionKey(key));
  if (invalid.length) return json({ ok: false, error: `Unknown sections: ${invalid.join(", ")}` }, 400);
  if (Object.keys(entries).length === 0) return json({ ok: false, error: "No sections to save." }, 400);

  try {
    const result = await writeSections(entries);
    return json({
      ok: true,
      saved: result.saved,
      records: result.records,
      message: `Saved ${result.saved.length} section(s) to the database.`,
    });
  } catch (error) {
    console.error("[admin/content] save failed:", error);
    return json({ ok: false, error: error instanceof Error ? error.message : "Save failed." }, 500);
  }
}

/** Admin-only reset of one section (or all when `all: true`). */
export async function DELETE(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const all = url.searchParams.get("all") === "true";
  try {
    if (all) {
      for (const section of SECTION_KEYS) await deleteSection(section);
      return json({ ok: true, message: "All sections reset to defaults." });
    }
    if (!key || !isSectionKey(key)) return json({ ok: false, error: "A valid `key` is required." }, 400);
    await deleteSection(key);
    return json({ ok: true, message: `${key} reset to defaults.` });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "Delete failed." }, 500);
  }
}
