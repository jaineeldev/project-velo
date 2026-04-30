ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE clients
  DROP CONSTRAINT IF EXISTS clients_industry_check;

ALTER TABLE clients
  ADD CONSTRAINT clients_industry_check CHECK (
    industry IS NULL OR industry IN (
      'Technology', 'Marketing', 'E-commerce', 'Healthcare', 'Finance',
      'Education', 'Real Estate', 'Hospitality', 'Legal', 'Non-profit', 'Other'
    )
  );
