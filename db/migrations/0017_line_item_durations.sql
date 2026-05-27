-- Per-line-item duration estimate. Operators pick from a fixed dropdown
-- when building a proposal; the same value is copied onto the milestone
-- when the proposal is approved so the client can see "expected time" on
-- the project portal as well as the proposal.
--
-- The bucket list is intentionally a small enum (text + CHECK) rather than
-- a lookup table — these labels rarely change and the value is what we
-- display verbatim, so an enum-shaped column is the cleanest fit.

ALTER TABLE line_items
  ADD COLUMN estimated_duration text
  CHECK (estimated_duration IN (
    '<1 day',
    '1-2 days',
    '3-5 days',
    '1 week',
    '2 weeks',
    '3-4 weeks',
    '1 month',
    '2 months',
    '3+ months'
  ));

ALTER TABLE milestones
  ADD COLUMN estimated_duration text
  CHECK (estimated_duration IN (
    '<1 day',
    '1-2 days',
    '3-5 days',
    '1 week',
    '2 weeks',
    '3-4 weeks',
    '1 month',
    '2 months',
    '3+ months'
  ));
