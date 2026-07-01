import { LifeBuoy } from "lucide-react";
import { getOrCreateUser } from "@/lib/auth";
import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Help & Support",
};

export default async function SupportPage() {
  const user = await getOrCreateUser();

  return (
    <div className="max-w-2xl px-10 py-12">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <LifeBuoy aria-hidden className="h-4 w-4" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Help &amp; support
        </h1>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Velo is in early beta — if something breaks or you have feedback, send
        it through here. Every message lands in our inbox and we&apos;ll reply
        within a day or two.
      </p>

      <ContactForm userEmail={user.email} />

      <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        Prefer your own email client? Reach us directly at{" "}
        <a
          href="mailto:jaineelk.dev@gmail.com"
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          jaineelk.dev@gmail.com
        </a>
        .
      </div>
    </div>
  );
}
