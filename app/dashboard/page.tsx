import { currentUser } from "@clerk/nextjs/server";

const stats = [
  { label: "Active Projects", value: 4 },
  { label: "Pending Proposals", value: 2 },
  { label: "Unpaid Invoices", value: 1 },
  { label: "Total Clients", value: 7 },
];

export default async function DashboardPage() {
  const user = await currentUser();
  const name =
    user?.firstName ||
    user?.emailAddresses[0]?.emailAddress.split("@")[0] ||
    "there";

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="px-10 py-12">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Welcome back, {name}
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {today}
        </p>
      </header>

      {/* Stats */}
      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-neutral-200 px-5 py-4 dark:border-neutral-800"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Recent activity */}
      <section className="mt-10">
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Recent activity
        </h2>
        <div className="mt-4 rounded-lg border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No activity yet. Your latest proposals, projects, and invoices will
            show up here.
          </p>
        </div>
      </section>
    </div>
  );
}
