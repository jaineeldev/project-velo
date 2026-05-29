"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
};

type AvatarProps = {
  userId: string;
  name: string | null;
  size?: AvatarSize;
  className?: string;
  // Bumping this prop forces a refresh of the signed URL. The Avatar
  // otherwise caches via the browser's HTTP cache (the signed-URL endpoint
  // sets max-age=300) so a fresh upload would still display the old URL
  // until that window expires. The Profile uploader bumps this value
  // immediately after a successful POST so the new image renders without
  // a page refresh.
  cacheBust?: string | number;
};

export function Avatar({
  userId,
  name,
  size = "md",
  className,
  cacheBust,
}: AvatarProps) {
  const px = SIZE_PX[size];
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/avatar/${encodeURIComponent(userId)}`, {
      // Bypass the browser HTTP cache when the caller bumps cacheBust.
      // For routine renders we let the cache do its job.
      cache: cacheBust ? "no-store" : "default",
    })
      .then(async (r) => {
        if (cancelled) return;
        if (r.ok) {
          const data = (await r.json()) as { url?: string };
          setSrc(data.url ?? null);
        } else {
          setSrc(null);
        }
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, cacheBust]);

  if (loading) {
    return (
      <div
        aria-hidden
        className={cn(
          "shrink-0 animate-pulse rounded-full bg-accent",
          className,
        )}
        style={{ width: px, height: px }}
      />
    );
  }

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "Profile photo"}
        width={px}
        height={px}
        unoptimized
        className={cn("shrink-0 rounded-full object-cover", className)}
        sizes={`${px}px`}
      />
    );
  }

  return (
    <InitialsCircle name={name} px={px} className={className} />
  );
}

function InitialsCircle({
  name,
  px,
  className,
}: {
  name: string | null;
  px: number;
  className?: string;
}) {
  const initials = computeInitials(name);
  const fontSize = Math.max(10, Math.round(px * 0.38));
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary",
        className,
      )}
      style={{ width: px, height: px, fontSize }}
    >
      {initials}
    </div>
  );
}

function computeInitials(name: string | null): string {
  if (!name) return ".";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const initials = parts
    .map((p) => p[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();
  return initials || ".";
}
