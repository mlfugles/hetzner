import { type NextRequest, NextResponse } from "next/server";

/**
 * Runs on every request (Next 16's replacement for middleware.ts).
 * NOINDEX=true is set on the develop app and on PR previews in Coolify; the
 * header keeps search engines away from them. It is read at request time, so
 * it also covers pages that were prerendered at build time, and flipping the
 * variable in Coolify needs a restart but no rebuild.
 */
export function proxy(_request: NextRequest) {
  const response = NextResponse.next();
  if (process.env.NOINDEX === "true") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  // Skip static assets; everything else gets the header.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
