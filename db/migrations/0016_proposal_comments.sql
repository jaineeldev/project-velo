-- Two-way comments on proposals. Lets a client and agency exchange notes
-- threaded against a proposal without forcing the client through the
-- one-shot change-request flow for every small clarification.
--
-- author_role is denormalized off user_profiles so we don't have to join
-- across two tables to render a single comment. The DB doesn't enforce
-- consistency between this column and user_profiles.role — the writing
-- action is the single source of truth and stamps the role at write time.

CREATE TABLE proposal_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_role text NOT NULL CHECK (author_role IN ('client', 'agency')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX proposal_comments_proposal_id_idx
  ON proposal_comments (proposal_id, created_at);
