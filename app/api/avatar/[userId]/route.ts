import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNED_URL_TTL_MS = 60 * 60 * 1000;

// Mints a short-lived signed GET URL for the requested user's avatar. Any
// signed-in user can request any user's URL: avatars are shown across the
// app (sidebars, admin lists, future proposal/project surfaces) and the
// signed URL itself expires after one hour, so a leaked URL doesn't grant
// persistent access. Returns 404 when the user has no avatar, which the
// Avatar component reads as "fall back to initials".

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } },
) {
  const { userId: callerClerkId } = await auth();
  if (!callerClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetClerkId = decodeURIComponent(params.userId);

  const rows = await sql`
    SELECT up.avatar_url
    FROM users u
    JOIN user_profiles up ON up.user_id = u.id
    WHERE u.clerk_id = ${targetClerkId}
    LIMIT 1
  `;

  const pathname = (rows[0]?.avatar_url as string | null | undefined) ?? null;
  if (!pathname) {
    return NextResponse.json({ error: "No avatar" }, { status: 404 });
  }

  const token = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil: Date.now() + SIGNED_URL_TTL_MS,
  });
  const { presignedUrl } = await presignUrl(token, {
    operation: "get",
    pathname,
    access: "private",
  });

  return NextResponse.json(
    { url: presignedUrl },
    {
      status: 200,
      // Browser-side cache: a few minutes is enough to dedupe rapid layout
      // re-renders (sidebar + page header both render Avatar with the same
      // userId) without holding a stale URL for the full TTL. After upload
      // we cache-bust by passing a fresh key into the Avatar component.
      headers: { "Cache-Control": "private, max-age=300" },
    },
  );
}
