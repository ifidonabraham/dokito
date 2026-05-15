-- Public healthcare facilities for facility finder and emergency routing.
-- Seed rows are sample Nigerian facilities and can be replaced by verified data.

CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital', 'clinic', 'pharmacy', 'laboratory', 'phc', 'teaching_hospital', 'private_hospital')),
  address TEXT NOT NULL,
  phone TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  rating NUMERIC,
  is_24_hours BOOLEAN NOT NULL DEFAULT FALSE,
  has_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  services TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  state TEXT,
  lga TEXT,
  is_sample_data BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view facilities" ON public.facilities;
CREATE POLICY "Anyone can view facilities"
  ON public.facilities
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS facilities_type_idx ON public.facilities (type);
CREATE INDEX IF NOT EXISTS facilities_emergency_idx ON public.facilities (has_emergency);
CREATE INDEX IF NOT EXISTS facilities_location_idx ON public.facilities (latitude, longitude);

DROP TRIGGER IF EXISTS update_facilities_updated_at ON public.facilities;
CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.facilities (
  name,
  type,
  address,
  phone,
  latitude,
  longitude,
  rating,
  is_24_hours,
  has_emergency,
  services,
  state,
  lga,
  is_sample_data
)
VALUES
  (
    'University of Lagos Medical Centre',
    'clinic',
    'University of Lagos, Akoka, Lagos',
    '+234 1 293 0330',
    6.5199,
    3.3974,
    4.1,
    true,
    true,
    ARRAY['Emergency', 'General Practice', 'Student Health', 'First Aid'],
    'Lagos',
    'Lagos Mainland',
    true
  ),
  (
    'Lagos University Teaching Hospital',
    'teaching_hospital',
    'Idi-Araba, Lagos',
    '+234 1 234 5678',
    6.5166,
    3.3584,
    4.2,
    true,
    true,
    ARRAY['Emergency', 'Surgery', 'Pediatrics', 'Maternity', 'ICU', 'Cardiology'],
    'Lagos',
    'Lagos Mainland',
    true
  ),
  (
    'Reddington Hospital',
    'private_hospital',
    '12, Idowu Martins Street, Victoria Island, Lagos',
    '+234 1 280 7100',
    6.4281,
    3.4219,
    4.5,
    true,
    true,
    ARRAY['Emergency', 'Diagnostics', 'Surgery', 'ICU', 'Oncology'],
    'Lagos',
    'Eti-Osa',
    true
  ),
  (
    'HealthPlus Pharmacy',
    'pharmacy',
    'Lekki Phase 1, Lagos',
    '+234 812 345 6789',
    6.4410,
    3.4765,
    4.0,
    false,
    false,
    ARRAY['Prescriptions', 'OTC Drugs', 'Health Products', 'Consultations'],
    'Lagos',
    'Eti-Osa',
    true
  ),
  (
    'MedPlus Pharmacy',
    'pharmacy',
    'Allen Avenue, Ikeja, Lagos',
    '+234 809 876 5432',
    6.5975,
    3.3463,
    4.3,
    true,
    false,
    ARRAY['Prescriptions', '24hr Service', 'Delivery', 'Vaccinations'],
    'Lagos',
    'Ikeja',
    true
  ),
  (
    'St. Nicholas Hospital',
    'private_hospital',
    '57 Campbell Street, Lagos Island',
    '+234 1 263 0091',
    6.4531,
    3.3958,
    4.4,
    true,
    true,
    ARRAY['Emergency', 'Cardiology', 'Orthopedics', 'Dialysis', 'Maternity'],
    'Lagos',
    'Lagos Island',
    true
  )
ON CONFLICT DO NOTHING;
