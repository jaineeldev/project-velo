import { unstable_cache } from "next/cache";
import { sql } from "@/lib/db";

export type ClientOption = { id: string; name: string };

export type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  industry: string | null;
  website: string | null;
  notes: string | null;
  tags: string[];
  last_contacted_at: string | Date | null;
  created_at: string | Date;
};

// Per-user tag for the clients cache. Invalidated from createClient /
// deleteClient via revalidateTag(clientsTag(userId)). Both the directory list
// and the form-options list share this tag — any mutation refreshes both.
export const clientsTag = (userId: string) => `clients:${userId}`;

// {id, name} pairs for the proposal form selects. Cheap enough that we could
// fetch every render, but the form is hit in flow paths (new proposal, edit
// proposal) where shaving a round-trip matters more than the full list view.
export async function getClientOptions(userId: string): Promise<ClientOption[]> {
  const tag = clientsTag(userId);
  return unstable_cache(
    async () => {
      const rows = await sql`
        SELECT id, name FROM clients WHERE user_id = ${userId} ORDER BY name ASC
      `;
      return rows as ClientOption[];
    },
    ["client-options", userId],
    { tags: [tag], revalidate: 3600 },
  )();
}

// Full clients list for /dashboard/clients. Same cache tag as the options list
// so a single revalidateTag call refreshes both.
export async function getClientsList(userId: string): Promise<ClientRow[]> {
  const tag = clientsTag(userId);
  return unstable_cache(
    async () => {
      const rows = await sql`
        SELECT id, name, email, phone, company_name, industry, website,
               notes, tags, last_contacted_at, created_at
        FROM clients
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
      return rows as ClientRow[];
    },
    ["clients-list", userId],
    { tags: [tag], revalidate: 3600 },
  )();
}
