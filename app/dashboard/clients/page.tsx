import { getOrCreateUser } from "@/lib/auth";
import { getClientsList } from "@/lib/clients-data";
import { dateShortFmt } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { NewClientButton } from "./new-client-button";
import { DeleteClientButton } from "./delete-client-button";

export default async function ClientsPage() {
  const user = await getOrCreateUser();
  const clients = await getClientsList(user.id);

  return (
    <div className="px-10 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Clients
        </h1>
        <NewClientButton />
      </header>

      {clients.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No clients yet. Add your first client to get started.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-border border-t border-border">
          {clients.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {c.name}
                  {c.company_name && (
                    <span className="ml-2 font-normal text-muted-foreground">
                      · {c.company_name}
                    </span>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                  {c.email && <span>{c.email}</span>}
                  {c.phone && <span>{c.phone}</span>}
                  {c.industry && <span>{c.industry}</span>}
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "rounded underline-offset-2 hover:text-foreground hover:underline",
                        focusRing,
                      )}
                    >
                      {c.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Added {dateShortFmt.format(new Date(c.created_at))}
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
