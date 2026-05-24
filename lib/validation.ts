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

export const USER_ROLES = ["agency", "client"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Lenient on parse: anything not in USER_ROLES (including undefined or a
// stray string an admin put in publicMetadata) collapses to 'agency'. The
// CHECK constraint on user_profiles.role is the hard guard; this just
// keeps the webhook from rejecting otherwise-valid payloads.
export const userRoleSchema = z
  .enum(USER_ROLES, "Invalid user role")
  .catch("agency");

// Validates user data extracted from a trusted Clerk webhook payload (after
// signature verification). Provides defence-in-depth before the DB insert.
export const webhookUserSchema = z.object({
  clerk_id: z.string().min(1).max(255),
  email: z
    .email("Webhook user has invalid email address")
    .trim()
    .max(254),
  name: z.string().trim().max(100).nullable(),
  role: userRoleSchema,
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

export const MILESTONE_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
] as const;

export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const milestoneStatusSchema = z.enum(
  MILESTONE_STATUSES,
  "Invalid milestone status",
);

export const timeEntrySchema = z.object({
  description: z.preprocess(
    (val) => String(val ?? "").trim(),
    z
      .string()
      .min(1, "Description is required")
      .max(500, "Description must be 500 characters or fewer"),
  ),
  hours: z.coerce
    .number()
    .positive("Hours must be greater than 0")
    .max(999.99, "Hours is too large")
    .refine(
      (n) => Math.round(n * 100) === n * 100,
      "Hours can have at most 2 decimal places",
    ),
});

export type TimeEntryInput = z.infer<typeof timeEntrySchema>;

export const deliverableSchema = z.object({
  label: z.preprocess(
    (val) => String(val ?? "").trim(),
    z
      .string()
      .min(1, "Label is required")
      .max(100, "Label must be 100 characters or fewer"),
  ),
  // URL must be http(s) — reject anything else so we never render a
  // javascript:, data:, or file: link on the public portal.
  url: z.preprocess(
    (val) => String(val ?? "").trim(),
    z
      .url("URL must be valid")
      .max(500, "URL must be 500 characters or fewer")
      .refine(
        (s) => /^https?:\/\//i.test(s),
        "URL must start with http:// or https://",
      ),
  ),
});

export type DeliverableInput = z.infer<typeof deliverableSchema>;

export const AU_STATES = [
  "ACT",
  "NSW",
  "NT",
  "QLD",
  "SA",
  "TAS",
  "VIC",
  "WA",
] as const;

export type AuState = (typeof AU_STATES)[number];

export const userProfileSchema = z.object({
  businessName: z.preprocess(
    toTrimmedStringOrNull,
    z
      .string()
      .max(150, "Business name must be 150 characters or fewer")
      .nullable(),
  ),

  // ABN: 11 digits with optional spaces. We strip whitespace before checking.
  abn: z.preprocess(
    (val) => {
      const s = toTrimmedStringOrNull(val);
      if (s === null) return null;
      const digitsOnly = s.replace(/\s+/g, "");
      return digitsOnly === "" ? null : digitsOnly;
    },
    z
      .string()
      .regex(/^\d{11}$/, "ABN must be exactly 11 digits")
      .nullable(),
  ),

  addressStreet: z.preprocess(
    toTrimmedStringOrNull,
    z
      .string()
      .max(200, "Street must be 200 characters or fewer")
      .nullable(),
  ),

  addressCity: z.preprocess(
    toTrimmedStringOrNull,
    z
      .string()
      .max(100, "City must be 100 characters or fewer")
      .nullable(),
  ),

  addressState: z.preprocess(
    toTrimmedStringOrNull,
    z.enum(AU_STATES, "Please choose a valid state").nullable(),
  ),

  addressPostcode: z.preprocess(
    toTrimmedStringOrNull,
    z
      .string()
      .regex(/^\d{4}$/, "Postcode must be 4 digits")
      .nullable(),
  ),

  phone: z.preprocess(
    toTrimmedStringOrNull,
    z
      .string()
      .max(20, "Phone must be 20 characters or fewer")
      .regex(/^\+?[\d\s\-().]+$/, "Phone contains invalid characters")
      .refine((s) => {
        const digits = s.replace(/\D/g, "").length;
        return digits >= 7 && digits <= 15;
      }, "Phone must contain 7 to 15 digits")
      .nullable(),
  ),

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
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
