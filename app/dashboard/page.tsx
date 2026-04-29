import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";

export default async function DashboardPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 text-neutral-100">
      <p className="text-sm text-neutral-400">Signed in as</p>
      <p className="text-lg font-medium">{email}</p>
      <SignOutButton>
        <button className="rounded-md border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900">
          Sign out
        </button>
      </SignOutButton>
    </main>
  );
}
