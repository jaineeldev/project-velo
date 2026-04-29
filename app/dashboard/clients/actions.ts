"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

export async function createClient(formData: FormData) {
  const user = await getOrCreateUser();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!name) throw new Error("Name is required");

  await sql`
    INSERT INTO clients (user_id, name, email, phone)
    VALUES (${user.id}, ${name}, ${email}, ${phone})
  `;

  revalidatePath("/dashboard/clients");
}
