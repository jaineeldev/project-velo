-- Deliverables let the agency attach proof-of-work links (GitHub repo, Figma
-- file, live preview, etc.) to a milestone. The label/url pair is plain text;
-- application code restricts URLs to http(s) and validates the label. Cascade
-- on milestone deletion so deliverables don't outlive their parent.
CREATE TABLE deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX deliverables_milestone_id_idx ON deliverables(milestone_id);
