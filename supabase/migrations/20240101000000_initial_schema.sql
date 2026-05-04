-- Dokita Health Database Schema
-- Based on the 6 modules defined in the documentation

-- Enable necessary extensions (gen_random_uuid is built into PostgreSQL 13+)

-- =====================================================
-- MODULE 1: Universal Patient Identity & Records (UHR)
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  genotype TEXT CHECK (genotype IN ('AA', 'AS', 'SS', 'AC', 'SC')),
  height_cm NUMERIC,
  weight_kg NUMERIC,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vitals tracking
CREATE TABLE public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  temperature NUMERIC,
  blood_sugar NUMERIC,
  weight_kg NUMERIC,
  oxygen_saturation INTEGER,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_times TEXT[], -- Array of times like ['08:00', '20:00']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allergies
CREATE TABLE public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  allergen TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')) NOT NULL,
  reaction TEXT,
  diagnosed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical conditions
CREATE TABLE public.conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  diagnosed_date DATE,
  status TEXT CHECK (status IN ('active', 'managed', 'resolved')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MODULE 2: DOKITA AI Chat History
-- =====================================================

CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  language TEXT DEFAULT 'en',
  is_emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MODULE 4: Facility Finder
-- =====================================================

CREATE TABLE public.saved_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  place_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  facility_type TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- =====================================================
-- MODULE 6: Medication Reminders & Chronic Disease
-- =====================================================

-- Health programs (Hypertension, Diabetes, Antenatal)
CREATE TABLE public.health_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  program_type TEXT CHECK (program_type IN ('hypertension', 'diabetes', 'antenatal', 'general')) NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  target_values JSONB, -- e.g., {"bp_target": "120/80", "sugar_target": "100"}
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication reminders log
CREATE TABLE public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'taken', 'missed', 'skipped')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency history
CREATE TABLE public.emergency_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emergency_type TEXT,
  symptoms TEXT[],
  location_lat NUMERIC,
  location_lng NUMERIC,
  facility_contacted TEXT,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Vitals: Users can only access their own vitals
CREATE POLICY "Users can view own vitals" ON public.vitals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vitals" ON public.vitals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vitals" ON public.vitals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vitals" ON public.vitals FOR DELETE USING (auth.uid() = user_id);

-- Medications: Users can only access their own medications
CREATE POLICY "Users can view own medications" ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medications" ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medications" ON public.medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medications" ON public.medications FOR DELETE USING (auth.uid() = user_id);

-- Allergies: Users can only access their own allergies
CREATE POLICY "Users can view own allergies" ON public.allergies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own allergies" ON public.allergies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own allergies" ON public.allergies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own allergies" ON public.allergies FOR DELETE USING (auth.uid() = user_id);

-- Conditions: Users can only access their own conditions
CREATE POLICY "Users can view own conditions" ON public.conditions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conditions" ON public.conditions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conditions" ON public.conditions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conditions" ON public.conditions FOR DELETE USING (auth.uid() = user_id);

-- Chat sessions: Users can only access their own chat sessions
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Chat messages: Users can access messages from their sessions
CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = chat_messages.session_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = chat_messages.session_id AND user_id = auth.uid()));

-- Saved facilities: Users can only access their own saved facilities
CREATE POLICY "Users can view own saved facilities" ON public.saved_facilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved facilities" ON public.saved_facilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved facilities" ON public.saved_facilities FOR DELETE USING (auth.uid() = user_id);

-- Health programs: Users can only access their own health programs
CREATE POLICY "Users can view own health programs" ON public.health_programs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health programs" ON public.health_programs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health programs" ON public.health_programs FOR UPDATE USING (auth.uid() = user_id);

-- Medication logs: Users can access logs for their medications
CREATE POLICY "Users can view own medication logs" ON public.medication_logs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.medications WHERE id = medication_logs.medication_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own medication logs" ON public.medication_logs FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.medications WHERE id = medication_logs.medication_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own medication logs" ON public.medication_logs FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.medications WHERE id = medication_logs.medication_id AND user_id = auth.uid()));

-- Emergency logs: Users can only access their own emergency logs
CREATE POLICY "Users can view own emergency logs" ON public.emergency_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency logs" ON public.emergency_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conditions_updated_at BEFORE UPDATE ON public.conditions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
