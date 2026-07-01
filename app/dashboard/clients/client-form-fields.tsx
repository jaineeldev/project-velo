"use client";

import { CLIENT_INDUSTRIES } from "@/lib/validation";
import type { ClientRow } from "@/lib/clients-data";

const inputCls =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";

const labelCls =
  "block text-sm font-medium text-foreground";

// Shared form fields for the new-client and edit-client dialogs. Pass
// `client` to pre-fill from an existing row; omit for the create flow.
export function ClientFormFields({ client }: { client?: ClientRow }) {
  const tagsDefault = client?.tags?.join(", ") ?? "";

  return (
    <>
      <div className="space-y-1.5">
        <label htmlFor="name" className={labelCls}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="off"
          placeholder="e.g. Jane Smith"
          maxLength={100}
          defaultValue={client?.name ?? ""}
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className={labelCls}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          placeholder="e.g. jane@acme.com"
          maxLength={254}
          defaultValue={client?.email ?? ""}
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className={labelCls}>
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="off"
          placeholder="e.g. +1 (555) 123-4567"
          maxLength={20}
          defaultValue={client?.phone ?? ""}
          className={inputCls}
        />
        <p className="text-xs text-muted-foreground">
          Digits, spaces, and <code>+ - ( ) .</code> only. 7 to 15 digits.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="companyName" className={labelCls}>
          Company name
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          autoComplete="off"
          placeholder="e.g. Acme Corp"
          maxLength={150}
          defaultValue={client?.company_name ?? ""}
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="industry" className={labelCls}>
          Industry
        </label>
        <select
          id="industry"
          name="industry"
          defaultValue={client?.industry ?? ""}
          className={inputCls}
        >
          <option value="">Select an industry…</option>
          {CLIENT_INDUSTRIES.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="website" className={labelCls}>
          Website
        </label>
        <input
          id="website"
          name="website"
          type="url"
          autoComplete="off"
          placeholder="e.g. https://acme.com"
          maxLength={255}
          defaultValue={client?.website ?? ""}
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="tags" className={labelCls}>
          Tags
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          autoComplete="off"
          placeholder="e.g. hot-lead, retainer, vip"
          maxLength={500}
          defaultValue={tagsDefault}
          className={inputCls}
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated. Letters, numbers, spaces, hyphens, and underscores.
          Up to 10 tags.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className={labelCls}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={1000}
          placeholder="Internal notes about this client (not shared)…"
          defaultValue={client?.notes ?? ""}
          className={inputCls}
        />
      </div>
    </>
  );
}
