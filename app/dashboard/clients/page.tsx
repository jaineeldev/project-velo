import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { NewClientButton } from "./new-client-button";
import { DeleteClientButton } from "./delete-client-button";

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  industry: string | null;
  website: string | null;
  created_at: string | Date;
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function ClientsPage() {
  const user = await getOrCreateUser();

  const clients = (await sql`
    SELECT id, name, email, phone, company_name, industry, website, created_at
    FROM clients
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `) as ClientRow[];

  return (
    <div className="px-10 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Clients
        </h1>
        <NewClientButton />
      </header>

      {clients.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No clients yet. Add your first client to get started.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {clients.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {c.name}
                  {c.company_name && (
                    <span className="ml-2 font-normal text-neutral-500 dark:text-neutral-400">
                      · {c.company_name}
                    </span>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {c.email && <span>{c.email}</span>}
                  {c.phone && <span>{c.phone}</span>}
                  {c.industry && <span>{c.industry}</span>}
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-2 hover:text-neutral-900 hover:underline dark:hover:text-neutral-100"
                    >
                      {c.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Added {dateFmt.format(new Date(c.created_at))}
                </p>
                <DeleteClientButton clientId={c.id} clientName={c.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
