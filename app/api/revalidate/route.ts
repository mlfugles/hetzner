import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { REVALIDATE_TAG } from "@/sanity/env";

type WebhookBody = { _type?: string; _id?: string };

/**
 * Target of a Sanity GROQ-powered webhook (Manage → API → Webhooks):
 *   URL:      https://<your-domain>/api/revalidate
 *   Trigger:  create, update, delete
 *   Secret:   the value of SANITY_REVALIDATE_SECRET
 *
 * Expires everything fetched through `sanityFetch` so the next request gets
 * fresh content, even when no visitor had the Live API open at publish time.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return new NextResponse("SANITY_REVALIDATE_SECRET is not set", { status: 500 });

  const { isValidSignature, body } = await parseBody<WebhookBody>(req, secret);
  if (!isValidSignature) return new NextResponse("Invalid signature", { status: 401 });
  if (!body?._type) return new NextResponse("Bad request", { status: 400 });

  revalidateTag(REVALIDATE_TAG, "max");
  return NextResponse.json({ revalidated: true, type: body._type, id: body._id, now: Date.now() });
}
