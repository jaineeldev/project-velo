import { ProfileUploader } from "@/components/profile-uploader";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  await requireAdmin("/admin/profile");
  const user = await getOrCreateUser();

  const avatarRows = await sql`
    SELECT avatar_url FROM user_profiles WHERE user_id = ${user.id} LIMIT 1
  `;
  const hasAvatar = Boolean(avatarRows[0]?.avatar_url);

  return (
    <div className="max-w-3xl px-10 py-10">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your operator account. Photo updates everywhere it appears.
        </p>
      </header>

      <section className="mt-8 border-t border-border pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">
            Account details
          </h2>
          <span className="rounded-md border border-primary/30 bg-primary/15 px-2 py-1 text-xs font-medium uppercase tracking-wider text-foreground">
            Operator
          </span>
        </div>
        <ProfileUploader
          userId={user.clerk_id}
          name={user.name}
          email={user.email}
          initialHasAvatar={hasAvatar}
        />
      </section>
    </div>
  );
}
