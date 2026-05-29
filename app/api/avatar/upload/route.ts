import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { del, issueSignedToken, presignUrl, put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS: Record<string, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const SIGNED_URL_TTL_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart form data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing 'file' field" },
      { status: 400 },
    );
  }

  const ext = ALLOWED_EXTENSIONS[file.type];
  if (!ext) {
    logSecurityEvent({
      event: "validation_failed",
      route: "/api/avatar/upload",
      outcome: "denied",
      reason: "unsupported_mime",
      meta: { mime: file.type || "unknown" },
    });
    return NextResponse.json(
      { error: "Only JPG, PNG, and WebP files are accepted" },
      { status: 415 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    logSecurityEvent({
      event: "validation_failed",
      route: "/api/avatar/upload",
      outcome: "denied",
      reason: "file_too_large",
      meta: { size: file.size },
    });
    return NextResponse.json(
      { error: "File must be under 2MB" },
      { status: 413 },
    );
  }

  const userRows = await sql`
    SELECT id FROM users WHERE clerk_id = ${clerkUserId} LIMIT 1
  `;
  if (userRows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userId = userRows[0].id as string;

  const oldRows = await sql`
    SELECT avatar_url FROM user_profiles WHERE user_id = ${userId} LIMIT 1
  `;
  const oldPathname = (oldRows[0]?.avatar_url as string | null | undefined) ?? null;

  const pathname = `avatars/${clerkUserId}/${Date.now()}.${ext}`;

  let uploaded;
  try {
    uploaded = await put(pathname, file, {
      access: "private",
      contentType: file.type,
      addRandomSuffix: false,
      allowOverwrite: false,
    });
  } catch (err) {
    logSecurityEvent({
      event: "validation_failed",
      route: "/api/avatar/upload",
      outcome: "failure",
      reason: "blob_put_failed",
      meta: { msg: err instanceof Error ? err.message.slice(0, 120) : "unknown" },
    });
    return NextResponse.json(
      { error: "Upload failed, try again" },
      { status: 500 },
    );
  }

  // INSERT a row if none exists, otherwise UPDATE. The profile row should
  // already exist (webhook on user.created creates it for agency users,
  // finalize endpoint creates it for clients), but a manual SQL change or
  // a missed webhook could leave a user without one. ON CONFLICT keeps
  // the upload atomic against that edge case.
  await sql`
    INSERT INTO user_profiles (user_id, avatar_url)
    VALUES (${userId}, ${pathname})
    ON CONFLICT (user_id) DO UPDATE
      SET avatar_url = EXCLUDED.avatar_url,
          updated_at = now()
  `;

  // Best-effort delete of the previous blob. If this fails (stale pathname,
  // already deleted, transient Blob error) we still keep the new avatar.
  // The orphaned blob is a small waste, not a correctness problem.
  if (oldPathname && oldPathname !== pathname) {
    void del(oldPathname).catch((err: unknown) => {
      logSecurityEvent({
        event: "validation_failed",
        route: "/api/avatar/upload",
        outcome: "failure",
        reason: "blob_del_old_failed",
        meta: {
          msg: err instanceof Error ? err.message.slice(0, 120) : "unknown",
        },
      });
    });
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
    { url: presignedUrl, pathname, size: uploaded.contentType },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function DELETE() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRows = await sql`
    SELECT id FROM users WHERE clerk_id = ${clerkUserId} LIMIT 1
  `;
  if (userRows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userId = userRows[0].id as string;

  const profileRows = await sql`
    SELECT avatar_url FROM user_profiles WHERE user_id = ${userId} LIMIT 1
  `;
  const pathname = (profileRows[0]?.avatar_url as string | null | undefined) ?? null;

  if (!pathname) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  await sql`
    UPDATE user_profiles
    SET avatar_url = NULL, updated_at = now()
    WHERE user_id = ${userId}
  `;

  void del(pathname).catch((err: unknown) => {
    logSecurityEvent({
      event: "validation_failed",
      route: "/api/avatar/upload",
      outcome: "failure",
      reason: "blob_del_on_remove_failed",
      meta: { msg: err instanceof Error ? err.message.slice(0, 120) : "unknown" },
    });
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
