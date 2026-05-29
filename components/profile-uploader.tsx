"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { cn, focusRing } from "@/lib/utils";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

type Props = {
  userId: string;
  name: string | null;
  email: string;
  initialHasAvatar: boolean;
};

type Status =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "removing" }
  | { kind: "error"; message: string }
  | { kind: "success"; message: string };

export function ProfileUploader({
  userId,
  name,
  email,
  initialHasAvatar,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasAvatar, setHasAvatar] = useState(initialHasAvatar);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Bumping cacheBust forces the Avatar component to refetch the signed URL
  // with cache: 'no-store'. We bump after upload (new pathname) and after
  // remove (so the fallback initials render instead of a stale image).
  const [cacheBust, setCacheBust] = useState(0);

  const busy = status.kind === "uploading" || status.kind === "removing";

  function pickFile() {
    if (busy) return;
    setStatus({ kind: "idle" });
    fileInputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    // Always reset the input so picking the same file twice fires change.
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_MIME.has(file.type)) {
      setStatus({
        kind: "error",
        message: "Only JPG, PNG, and WebP files are accepted",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus({ kind: "error", message: "File must be under 2MB" });
      return;
    }

    setStatus({ kind: "uploading" });
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/avatar/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setStatus({
          kind: "error",
          message: data?.error ?? "Upload failed, try again",
        });
        return;
      }
      setHasAvatar(true);
      setCacheBust((n) => n + 1);
      setStatus({ kind: "success", message: "Profile photo updated" });
    } catch {
      setStatus({ kind: "error", message: "Upload failed, try again" });
    }
  }

  async function onRemove() {
    if (busy || !hasAvatar) return;
    setStatus({ kind: "removing" });
    try {
      const res = await fetch("/api/avatar/upload", { method: "DELETE" });
      if (!res.ok) {
        setStatus({ kind: "error", message: "Could not remove photo" });
        return;
      }
      setHasAvatar(false);
      setCacheBust((n) => n + 1);
      setStatus({ kind: "success", message: "Profile photo removed" });
    } catch {
      setStatus({ kind: "error", message: "Could not remove photo" });
    }
  }

  return (
    <div className="mt-5">
      <div className="flex items-start gap-5">
        <div className="relative">
          <Avatar
            userId={userId}
            name={name}
            size="xl"
            cacheBust={cacheBust}
          />
          {status.kind === "uploading" ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
              <Loader2
                aria-hidden
                className="h-5 w-5 animate-spin text-foreground"
              />
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={pickFile}
              disabled={busy}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60",
                focusRing,
              )}
            >
              {status.kind === "uploading" ? (
                <>
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <Upload aria-hidden className="h-4 w-4" />
                  {hasAvatar ? "Replace photo" : "Upload photo"}
                </>
              )}
            </button>

            {hasAvatar ? (
              <button
                type="button"
                onClick={onRemove}
                disabled={busy}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
                  focusRing,
                )}
              >
                {status.kind === "removing" ? "Removing..." : "Remove photo"}
              </button>
            ) : null}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            JPG, PNG, or WebP. Max 2MB.
          </p>

          <div role="status" aria-live="polite" className="mt-2 min-h-[1.25rem]">
            {status.kind === "error" ? (
              <p className="text-xs font-medium text-destructive">
                {status.message}
              </p>
            ) : null}
            {status.kind === "success" ? (
              <p className="text-xs text-muted-foreground">{status.message}</p>
            ) : null}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ReadOnlyField label="Name" value={name ?? "·"} />
        <ReadOnlyField label="Email" value={email} />
      </dl>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm text-foreground" title={value}>
        {value}
      </dd>
    </div>
  );
}
