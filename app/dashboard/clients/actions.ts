"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { clientsTag } from "@/lib/clients-data";
import { clientSchema, uuidSchema } from "@/lib/validation";

export async function createClient(formData: FormData) {
  const user = await getOrCreateUser();

  const result = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    companyName: formData.get("companyName"),
    industry: formData.get("industry"),
    website: formData.get("website"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const { name, email, phone, companyName, industry, website, notes } = result.data;

  await sql`
    INSERT INTO clients (user_id, name, email, phone, company_name, industry, website, notes)
    VALUES (
      ${user.id}, ${name}, ${email}, ${phone},
      ${companyName}, ${industry}, ${website}, ${notes}
    )
  `;

  revalidateTag(clientsTag(user.id));
  revalidatePath("/dashboard/clients");
}

export async function checkClientDeletable(
  clientId: string,
): Promise<{ canDelete: true } | { canDelete: false; reason: string }> {
  if (!uuidSchema.safeParse(clientId).success) {
    return { canDelete: false, reason: "Client not found." };
  }

  const user = await getOrCreateUser();

  const clientRows = await sql`
    SELECT id FROM clients WHERE id = ${clientId} AND user_id = ${user.id}
  `;
  if (clientRows.length === 0) {
    return { canDelete: false, reason: "Client not found." };
  }

  const [proposalRows, projectRows] = await Promise.all([
    sql`
      SELECT id FROM proposals
      WHERE client_id = ${clientId}
        AND status IN ('draft', 'sent', 'pending')
      LIMIT 1
    `,
    sql`
      SELECT id FROM projects
      WHERE client_id = ${clientId}
        AND status = 'active'
      LIMIT 1
    `,
  ]);

  if (proposalRows.length > 0 || projectRows.length > 0) {
    return {
      canDelete: false,
      reason:
        "This client has active proposals or projects and cannot be deleted. Please complete or cancel them first.",
    };
  }

  return { canDelete: true };
}

export async function deleteClient(clientId: string): Promise<void> {
  if (!uuidSchema.safeParse(clientId).success) {
    throw new Error("Client not found.");
  }

  const user = await getOrCreateUser();

  // Ownership check — re-run the active-work guard here too so the delete is
  // always safe even if the UI check was bypassed or the state changed in the
  // window between check and confirm.
  const clientRows = await sql`
    SELECT id FROM clients WHERE id = ${clientId} AND user_id = ${user.id}
  `;
  if (clientRows.length === 0) throw new Error("Client not found.");

  const [proposalRows, projectRows] = await Promise.all([
    sql`
      SELECT id FROM proposals
      WHERE client_id = ${clientId}
        AND status IN ('draft', 'sent', 'pending')
      LIMIT 1
    `,
    sql`
      SELECT id FROM projects
      WHERE client_id = ${clientId}
        AND status = 'active'
      LIMIT 1
    `,
  ]);

  if (proposalRows.length > 0 || projectRows.length > 0) {
    throw new Error(
      "This client has active proposals or projects and cannot be deleted. Please complete or cancel them first.",
    );
  }

  await sql`
    DELETE FROM clients WHERE id = ${clientId} AND user_id = ${user.id}
  `;

  revalidateTag(clientsTag(user.id));
  revalidatePath("/dashboard/clients");
}
