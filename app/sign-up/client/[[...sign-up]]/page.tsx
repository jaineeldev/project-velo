import { notFound } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { ConsentGate } from "@/components/auth/consent-gate";
import { sql } from "@/lib/db";

// Share-token-aware sign-up entry point. Reached from a proposal share
// link by a client who wants to create an account; on completion the
// finalize endpoint promotes them to role='client'. Without a valid
// proposal token in the URL, we render a 404 — the agency sign-up route
// at /sign-up is the route for the operator side.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN_RE = /^[0-9a-f]{64}$/;

export default async function ClientSignUpPage({
  searchParams,
}: {
  searchParams: { proposal?: string };
}) {
  const token = searchParams.proposal;

  // Same discipline as the public share page: identical response for
  // bad-format and not-found so the route doesn't leak which check
  // failed. notFound() also avoids hinting at the existence of /sign-up/client
  // to a passerby.
  if (!token || !TOKEN_RE.test(token)) notFound();

  const rows = await sql`
    SELECT 1 FROM proposals
    WHERE share_token = ${token} AND status <> 'draft'
    LIMIT 1
  `;
  if (rows.length === 0) notFound();

  // Token is URL-safe (64 hex chars), no encoding needed.
  const finalizeUrl = `/api/sign-up/client/finalize?proposal=${token}`;

  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center">
        <ConsentGate signUpForceRedirectUrl={finalizeUrl} />
      </div>
    </AuthLayout>
  );
}
