import { NextResponse } from "next/server";
import { readAllSections } from "@/lib/sections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Public, never-cached content. Desktop, mobile and admin all read this. */
export async function GET() {
  try {
    const { sections, hasData, mode } = await readAllSections();
    return NextResponse.json(
      { ok: true, content: hasData ? sections : null, hasData, source: hasData ? "database" : "defaults", mode },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0", Pragma: "no-cache" } },
    );
  } catch (error) {
    console.error("[content] read failed:", error);
    return NextResponse.json(
      {
        ok: false,
        content: null,
        hasData: false,
        source: "defaults",
        error: error instanceof Error ? error.message : "Content service unavailable.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
