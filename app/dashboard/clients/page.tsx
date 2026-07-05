import { getOrCreateUser } from "@/lib/auth";
import { getClientsList } from "@/lib/clients-data";
import { NewClientButton } from "./new-client-button";
import { ClientsList } from "./clients-list";

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
        <div className="mt-10 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No clients yet. Add your first client to get started.
          </p>
        </div>
      ) : (
        <ClientsList clients={clients} />
      )}
    </div>
  );
}
