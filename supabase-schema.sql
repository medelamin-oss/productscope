-- ============================================================
-- ProductScope — Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Public users table (mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  role            TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free','subscribed','canceled')),
  trial_used      BOOLEAN NOT NULL DEFAULT false,
  paddle_subscription_id TEXT,
  paddle_customer_id     TEXT,
  subscription_plan      TEXT CHECK (subscription_plan IN ('monthly','yearly')),
  subscription_end       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_url       TEXT,
  product_image_url TEXT,
  product_name      TEXT,
  language          TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en','ar')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Analysis results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','completed','failed')),
  error_message     TEXT,
  product_description TEXT,
  ad_headlines      JSONB,
  marketing_hooks   JSONB,
  strengths         JSONB,
  weaknesses        JSONB,
  target_audience   TEXT,
  main_objection    TEXT,
  objection_response TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ
);

-- 4. Auto-create public.users row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own row
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Projects: users can CRUD their own
CREATE POLICY "projects_select_own" ON public.projects
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "projects_insert_own" ON public.projects
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "projects_update_own" ON public.projects
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "projects_delete_own" ON public.projects
  FOR DELETE USING (user_id = auth.uid());

-- Analysis results: users can read their own (via project)
CREATE POLICY "results_select_own" ON public.analysis_results
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );
CREATE POLICY "results_insert_own" ON public.analysis_results
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

-- Allow the API route (with anon key) to update analysis_results status
CREATE POLICY "results_update_own" ON public.analysis_results
  FOR UPDATE USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

-- 6. Service role access (for API routes)
-- The service_role key bypasses RLS automatically.
