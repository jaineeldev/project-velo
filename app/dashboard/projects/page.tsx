import Link from "next/link";
import { getProjects } from "./actions";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const statusStyles: Record<string, string> = {
  active: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  completed: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  on_hold: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="px-10 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Projects
        </h1>
      </header>

      {projects.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No projects yet. Projects are created automatically when a client
            approves a proposal.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="flex items-center justify-between py-4 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {p.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {p.client_name}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[p.status] ?? statusStyles.active}`}
                  >
                    {p.status.replace("_", " ")}
                  </span>
                  <p className="w-28 text-right text-sm text-neutral-500 dark:text-neutral-400">
                    {dateFmt.format(new Date(p.created_at))}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
