import Stripe from "stripe";

// Lazy singleton. Importing this module in a server component or action
// returns the same client across requests (the Stripe SDK is request-safe;
// it's a thin HTTPS wrapper). We don't construct at module load because the
// constructor reads from process.env, and pages that import this transitively
// shouldn't crash at build time if the key is absent in CI.

let _stripe: Stripe | null = null;

// Card payments stay switched off until a secret key is configured, so the
// share page never shows a Pay button that can only error. Before adding a
// live key: Checkout Sessions are created on the platform account, so every
// payment lands in Velo's own Stripe balance rather than the agency's. That
// needs Stripe Connect (payments routed to each agency's account) first.
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add the test or live secret key to .env.local before triggering a payment flow.",
    );
  }
  _stripe = new Stripe(key, {
    // Pinning the API version keeps responses stable across Stripe upgrades.
    // Bump this deliberately when adopting new fields, not silently via SDK
    // updates.
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  });
  return _stripe;
}
