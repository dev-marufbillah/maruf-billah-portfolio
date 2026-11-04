import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Better Auth catch-all. `toNextJsHandler` needs a handler-shaped object, so we
 * lazily resolve the cached auth instance per request (never at build time).
 */
const authHandler = async (request: Request) => {
  try {
    const auth = await getAuth();
    return await auth.handler(request);
  } catch (error) {
    console.error("[auth] handler failed:", error);
    return Response.json(
      {
        ok: false,
        error: "Auth service is not configured. Add BETTER_AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD and MONGODB_URI to the environment, then redeploy.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
};

const handler = toNextJsHandler({ handler: authHandler });

export const GET = handler.GET;
export const POST = handler.POST;
export const PATCH = handler.PATCH;
export const PUT = handler.PUT;
export const DELETE = handler.DELETE;
