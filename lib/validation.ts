import { z } from "zod";

// Converts any FormData value to a trimmed string, or null if empty/absent.
// Used with z.preprocess so optional fields arrive as null rather than "".
const toTrimmedStringOrNull = (val: unknown): string | null => {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s === "" ? null : s;
};

export const CLIENT_INDUSTRIES = [
  "Technology",
  "Marketing",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Education",
  "Real Estate",
  "Hospitality",
  "Legal",
  "Non-profit",
  "Other",
] as const;

export type ClientIndustry = (typeof CLIENT_INDUSTRIES)[number];

export const clientSchema = z.object({
  // Required — kept as string so .min(1) catches an empty-after-trim name.
  name: z.preprocess(
    (val) => String(val ?? "").trim(),
    z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be 100 characters or fewer"),
  ),

  // Optional — null means "not provided".
  email: z.preprocess(
    toTrimmedStringOrNull,
    z
      .email("Invalid email address")
      .max(254, "Email must be 254 characters or fewer")
      .nullable(),
  ),

  // Optional — null means "not provided".
  // Allows digits, spaces, -, (, ), ., and a single leading '+'. Must contain
  // 7–15 actual digits (E.164 range), so junk like "(((", "---", or "   "
  // can't sneak through.
  phone: z.preprocess(
    toTrimmedStringOrNull,
    z
      .string()
      .max(20, "Phone must be 20 characters or fewer")
      .regex(
        /^\+?[\d\s\-().]+$/,
        "Phone contains invalid characters",
      )
      .refine(
        (s) => {
          const digits = s.replace(/\D/g, "").length;
          return digits >= 7 && digits <= 15;
        },
        "Phone must contain 7 to 15 digits",
      )
      .nullable(),
  ),

  // Optional — null means "not provided".
  companyName: z.preprocess(
    toTrimmedStringOrNull,
    z
      .string()
      .max(150, "Company name must be 150 characters or fewer")
      .nullable(),
  ),

  // Optional — must be one of the allowed values, or null.
  industry: z.preprocess(
    toTrimmedStringOrNull,
    z
      .enum(CLIENT_INDUSTRIES, "Please choose a valid industry")
      .nullable(),
  ),

  // Optional — must parse as a URL when provided. We tolerate users typing
  // "acme.com" by prepending https:// before validation.
  website: z.preprocess(
    (val) => {
      const s = toTrimmedStringOrNull(val);
      if (s === null) return null;
      return /^https?:\/\//i.test(s) ? s : `https://${s}`;
    },
    z
      .url("Website must be a valid URL")
      .max(255, "Website must be 255 characters or fewer")
      .nullable(),
  ),

  // Optional — null means "not provided".
  notes: z.preprocess(
    toTrimmedStringOrNull,
    z
      .string()
      .max(1000, "Notes must be 1000 characters or fewer")
      .nullable(),
  ),
});

export type ClientInput = z.infer<typeof clientSchema>;

// Validates user data extracted from a trusted Clerk webhook payload (after
// signature verification). Provides defence-in-depth before the DB insert.
export const webhookUserSchema = z.object({
  clerk_id: z.string().min(1),
  email: z
    .email("Webhook user has invalid email address")
    .trim()
    .max(254),
  name: z.string().trim().max(100).nullable(),
});

export type WebhookUser = z.infer<typeof webhookUserSchema>;

// Reusable guard for UUID-shaped server action parameters.
export const uuidSchema = z.uuid();

export const lineItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Line item description is required")
    .max(500, "Description must be 500 characters or fewer"),
  quantity: z.coerce
    .number()
    .positive("Quantity must be greater than 0")
    .max(9_999, "Quantity is too large"),
  unitPrice: z.coerce
    .number()
    .min(0, "Unit price cannot be negative")
    .max(999_999_999, "Unit price is too large"),
});

export const proposalSchema = z.object({
  clientId: z.uuid("Please select a client"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z.preprocess(
    toTrimmedStringOrNull,
    z.string().max(2000, "Description must be 2000 characters or fewer").nullable(),
  ),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "Add at least one line item"),
  depositPercentage: z.coerce
    .number()
    .min(0, "Deposit must be 0% or more")
    .max(100, "Deposit cannot exceed 100%"),
});

export type ProposalInput = z.infer<typeof proposalSchema>;
