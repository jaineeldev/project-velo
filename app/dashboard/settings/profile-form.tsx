"use client";

import { useState, useTransition } from "react";
import { cn, focusRing } from "@/lib/utils";
import { updateProfile } from "./actions";
import { AU_STATES } from "@/lib/validation";
import type { UserProfile } from "@/lib/user-profile";

const inputClass = cn(
  "w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600 dark:focus:border-neutral-600",
  focusRing,
);

const labelClass =
  "block text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [businessName, setBusinessName] = useState(profile.business_name ?? "");
  const [abn, setAbn] = useState(profile.abn ?? "");
  const [addressStreet, setAddressStreet] = useState(profile.street ?? "");
  const [addressCity, setAddressCity] = useState(profile.city ?? "");
  const [addressState, setAddressState] = useState(profile.state ?? "");
  const [addressPostcode, setAddressPostcode] = useState(profile.postcode ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      try {
        await updateProfile({
          businessName,
          abn,
          addressStreet,
          addressCity,
          addressState,
          addressPostcode,
          phone,
          website,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5">
      <div>
        <label htmlFor="business-name" className={labelClass}>
          Business name
        </label>
        <input
          id="business-name"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          maxLength={150}
          disabled={isPending}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="abn" className={labelClass}>
          ABN
        </label>
        <input
          id="abn"
          type="text"
          value={abn}
          onChange={(e) => setAbn(e.target.value)}
          placeholder="11 222 333 444"
          disabled={isPending}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="address-street" className={labelClass}>
          Street address
        </label>
        <input
          id="address-street"
          type="text"
          value={addressStreet}
          onChange={(e) => setAddressStreet(e.target.value)}
          maxLength={200}
          disabled={isPending}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="address-city" className={labelClass}>
            City
          </label>
          <input
            id="address-city"
            type="text"
            value={addressCity}
            onChange={(e) => setAddressCity(e.target.value)}
            maxLength={100}
            disabled={isPending}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="address-state" className={labelClass}>
            State
          </label>
          <select
            id="address-state"
            value={addressState}
            onChange={(e) => setAddressState(e.target.value)}
            disabled={isPending}
            className={`mt-1 ${inputClass}`}
          >
            <option value="">—</option>
            {AU_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="address-postcode" className={labelClass}>
            Postcode
          </label>
          <input
            id="address-postcode"
            type="text"
            value={addressPostcode}
            onChange={(e) => setAddressPostcode(e.target.value)}
            inputMode="numeric"
            maxLength={4}
            disabled={isPending}
            className={`mt-1 ${inputClass}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            disabled={isPending}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="website" className={labelClass}>
            Website
          </label>
          <input
            id="website"
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            maxLength={255}
            disabled={isPending}
            placeholder="acme.com"
            className={`mt-1 ${inputClass}`}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className={cn(
            "rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
            focusRing,
          )}
        >
          {isPending ? "Saving…" : "Save profile"}
        </button>
        {saved && (
          <span
            role="status"
            aria-live="polite"
            className="text-xs text-green-700 dark:text-green-400"
          >
            Saved
          </span>
        )}
        {error && (
          <span
            role="alert"
            aria-live="polite"
            className="text-xs text-red-600 dark:text-red-400"
          >
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
