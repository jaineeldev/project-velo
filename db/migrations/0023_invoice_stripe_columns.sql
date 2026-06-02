-- Stripe payment plumbing on invoices. The previous "Card payments coming
-- soon" placeholder gets replaced by a Checkout Session redirect; these
-- columns capture the link between an invoice row and Stripe's view of the
-- payment so the webhook handler can flip status correctly and the operator
-- can trace a payment back to a Stripe dashboard entry.
--
-- - stripe_session_id: Checkout Session id (cs_test_...) returned when the
--   action creates a session. Lets us short-circuit duplicate clicks and
--   reuse an existing pending session within its 24h validity window.
-- - stripe_payment_intent_id: the PaymentIntent (pi_...) that ultimately
--   captures the charge. Stored from the webhook payload, useful for
--   refund operations and dashboard cross-referencing.
-- - paid_at: when the webhook flipped the status. Separate from the
--   created_at issue date.
--
-- All three are nullable: existing invoices predate Stripe wiring and an
-- unpaid invoice has no session/payment intent until the client clicks pay.

ALTER TABLE invoices
  ADD COLUMN stripe_session_id text,
  ADD COLUMN stripe_payment_intent_id text,
  ADD COLUMN paid_at timestamptz;

CREATE INDEX invoices_stripe_session_id_idx
  ON invoices (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
