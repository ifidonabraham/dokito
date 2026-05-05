-- Health Records schema for AKILI Health Module 1.
-- Stores user-owned clinical documents/events such as diagnoses, lab results,
-- prescriptions, visit notes, immunizations, and surgeries.

CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'diagnosis',
      'lab_result',
      'prescription',
      'visit_note',
      'immunization',
      'surgery',
      'other'
    )
  ),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT,
  record_date DATE NOT NULL,
  provider TEXT,
  facility TEXT,
  attachment_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health records"
  ON public.health_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health records"
  ON public.health_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health records"
  ON public.health_records
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health records"
  ON public.health_records
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS health_records_user_id_record_date_idx
  ON public.health_records (user_id, record_date DESC);

CREATE INDEX IF NOT EXISTS health_records_user_id_type_idx
  ON public.health_records (user_id, type);

CREATE INDEX IF NOT EXISTS health_records_metadata_gin_idx
  ON public.health_records USING GIN (metadata);

DROP TRIGGER IF EXISTS update_health_records_updated_at ON public.health_records;
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON public.health_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
