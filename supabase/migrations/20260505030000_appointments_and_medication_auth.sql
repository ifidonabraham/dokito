-- Appointments and prescription tracking.
-- Keep user-owned rows tied directly to Supabase auth users.

ALTER TABLE public.medications
  DROP CONSTRAINT IF EXISTS medications_user_id_fkey;

ALTER TABLE public.medications
  ADD CONSTRAINT medications_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  facility TEXT,
  provider TEXT,
  reason TEXT,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON public.appointments FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS appointments_user_id_date_idx
  ON public.appointments (user_id, appointment_date, appointment_time);

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
