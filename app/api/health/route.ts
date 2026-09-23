export const dynamic = "force-dynamic";

/** Used by the Dockerfile HEALTHCHECK and Coolify's health check. */
export function GET() {
  return Response.json({ ok: true, commit: process.env.APP_COMMIT ?? null });
}
