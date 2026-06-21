-- ============================================================
-- FlowOps CRM — Initial Schema Migration
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────────────────

CREATE TYPE public.user_role    AS ENUM ('admin', 'manager', 'employee');
CREATE TYPE public.customer_status AS ENUM ('active', 'inactive', 'churned');
CREATE TYPE public.lead_status  AS ENUM ('new', 'contacted', 'qualified', 'disqualified', 'converted');
CREATE TYPE public.lead_source  AS ENUM ('web', 'referral', 'linkedin', 'event', 'cold-outreach', 'other');
CREATE TYPE public.activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task');


-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

-- profiles — one row per auth.users entry, created automatically by trigger
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid              PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text              NOT NULL UNIQUE,
  full_name   text              NOT NULL,
  avatar_url  text,
  role        public.user_role  NOT NULL DEFAULT 'employee',
  department  text,
  phone       text,
  is_active   boolean           NOT NULL DEFAULT true,
  created_at  timestamptz       NOT NULL DEFAULT now(),
  updated_at  timestamptz       NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.profiles IS 'Extended user profile data. Mirrors auth.users 1:1.';

-- tags — reusable labels for customers
CREATE TABLE IF NOT EXISTS public.tags (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,
  color      text        NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- customers
CREATE TABLE IF NOT EXISTS public.customers (
  id           uuid                   PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text                   NOT NULL,
  contact_name text                   NOT NULL,
  email        text,
  phone        text,
  website      text,
  industry     text,
  status       public.customer_status NOT NULL DEFAULT 'active',
  address      text,
  notes        text,
  assigned_to  uuid                   REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by   uuid                   NOT NULL REFERENCES public.profiles(id),
  created_at   timestamptz            NOT NULL DEFAULT now(),
  updated_at   timestamptz            NOT NULL DEFAULT now()
);

-- customer_tags — M:M junction
CREATE TABLE IF NOT EXISTS public.customer_tags (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid        NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tag_id      uuid        NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, tag_id)
);

-- leads
CREATE TABLE IF NOT EXISTS public.leads (
  id                       uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name               text                  NOT NULL,
  last_name                text                  NOT NULL,
  email                    text,
  phone                    text,
  company                  text,
  job_title                text,
  source                   public.lead_source    NOT NULL DEFAULT 'other',
  status                   public.lead_status    NOT NULL DEFAULT 'new',
  score                    integer               NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  notes                    text,
  assigned_to              uuid                  REFERENCES public.profiles(id) ON DELETE SET NULL,
  converted_to_customer_id uuid                  REFERENCES public.customers(id) ON DELETE SET NULL,
  converted_at             timestamptz,
  created_by               uuid                  NOT NULL REFERENCES public.profiles(id),
  created_at               timestamptz           NOT NULL DEFAULT now(),
  updated_at               timestamptz           NOT NULL DEFAULT now()
);

-- pipeline_stages — ordered Kanban columns (order_index is not UNIQUE to allow
-- atomic reordering: multiple stages can temporarily share a value during batch updates)
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text        NOT NULL UNIQUE,
  order_index    integer     NOT NULL,
  color          text        NOT NULL DEFAULT '#6366f1',
  probability    integer     NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  is_closed_won  boolean     NOT NULL DEFAULT false,
  is_closed_lost boolean     NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- deals
CREATE TABLE IF NOT EXISTS public.deals (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text          NOT NULL,
  value               numeric(12,2) NOT NULL DEFAULT 0 CHECK (value >= 0),
  currency            text          NOT NULL DEFAULT 'USD',
  stage_id            uuid          NOT NULL REFERENCES public.pipeline_stages(id),
  customer_id         uuid          REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id             uuid          REFERENCES public.leads(id) ON DELETE SET NULL,
  assigned_to         uuid          REFERENCES public.profiles(id) ON DELETE SET NULL,
  expected_close_date date,
  actual_close_date   date,
  probability         integer       NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  lost_reason         text,
  notes               text,
  created_by          uuid          NOT NULL REFERENCES public.profiles(id),
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now()
);

-- activities — calls, emails, meetings, notes, tasks linked to any entity
CREATE TABLE IF NOT EXISTS public.activities (
  id           uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  type         public.activity_type  NOT NULL,
  subject      text                  NOT NULL,
  description  text,
  outcome      text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  customer_id  uuid                  REFERENCES public.customers(id) ON DELETE CASCADE,
  lead_id      uuid                  REFERENCES public.leads(id) ON DELETE CASCADE,
  deal_id      uuid                  REFERENCES public.deals(id) ON DELETE CASCADE,
  assigned_to  uuid                  REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by   uuid                  NOT NULL REFERENCES public.profiles(id),
  created_at   timestamptz           NOT NULL DEFAULT now()
);

-- audit_logs — immutable record of all data changes; no UPDATE/DELETE policies
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id),
  action      text        NOT NULL,   -- 'created' | 'updated' | 'deleted' | 'stage_changed' | 'login'
  entity_type text        NOT NULL,   -- 'customer' | 'lead' | 'deal' | 'activity' | 'profile'
  entity_id   uuid,
  old_values  jsonb,
  new_values  jsonb,
  ip_address  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────

-- customers
CREATE INDEX idx_customers_assigned_to ON public.customers (assigned_to);
CREATE INDEX idx_customers_created_by  ON public.customers (created_by);
CREATE INDEX idx_customers_status      ON public.customers (status);

-- leads
CREATE INDEX idx_leads_assigned_to ON public.leads (assigned_to);
CREATE INDEX idx_leads_status      ON public.leads (status);
CREATE INDEX idx_leads_score       ON public.leads (score DESC);

-- deals
CREATE INDEX idx_deals_stage_id    ON public.deals (stage_id);
CREATE INDEX idx_deals_customer_id ON public.deals (customer_id);
CREATE INDEX idx_deals_assigned_to ON public.deals (assigned_to);
CREATE INDEX idx_deals_actual_close_date ON public.deals (actual_close_date);

-- activities
CREATE INDEX idx_activities_customer_id ON public.activities (customer_id);
CREATE INDEX idx_activities_lead_id     ON public.activities (lead_id);
CREATE INDEX idx_activities_deal_id     ON public.activities (deal_id);
CREATE INDEX idx_activities_created_at  ON public.activities (created_at DESC);

-- audit_logs
CREATE INDEX idx_audit_logs_user_id    ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_entity     ON public.audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- pipeline_stages
CREATE INDEX idx_pipeline_stages_order ON public.pipeline_stages (order_index);


-- ────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ────────────────────────────────────────────────────────────

-- Reusable updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Returns the role of the currently authenticated user.
-- SECURITY DEFINER so it can read profiles even when RLS is active.
-- STABLE means Postgres caches the result within a single query.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid()
$$;

-- Creates a profile row automatically when a new auth user signs up.
-- Reads full_name and role from user metadata if provided during signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'employee'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


-- ────────────────────────────────────────────────────────────
-- TRIGGERS
-- ────────────────────────────────────────────────────────────

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on new Supabase Auth user
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs     ENABLE ROW LEVEL SECURITY;


-- ── profiles ──────────────────────────────────────────────

-- All authenticated users can read all profiles (required for assignee selects/display)
CREATE POLICY "profiles: authenticated can select all"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- Users update their own profile; admin updates any
CREATE POLICY "profiles: own or admin can update"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.current_user_role() = 'admin');

-- Profiles are created by the trigger; admin may also insert directly
CREATE POLICY "profiles: admin can insert"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');

-- Only admin can deactivate/delete profile records
CREATE POLICY "profiles: admin can delete"
  ON public.profiles FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');


-- ── tags ──────────────────────────────────────────────────

CREATE POLICY "tags: authenticated can select"
  ON public.tags FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "tags: admin/manager can insert"
  ON public.tags FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

CREATE POLICY "tags: admin/manager can update"
  ON public.tags FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'));

CREATE POLICY "tags: admin can delete"
  ON public.tags FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');


-- ── customers ─────────────────────────────────────────────

-- Admin/Manager see all; Employee sees only assigned or self-created
CREATE POLICY "customers: role-scoped select"
  ON public.customers FOR SELECT TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );

CREATE POLICY "customers: authenticated can insert"
  ON public.customers FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "customers: role-scoped update"
  ON public.customers FOR UPDATE TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );

-- Hard deletes only by admin (prefer status = 'inactive' for soft deletes)
CREATE POLICY "customers: admin can delete"
  ON public.customers FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');


-- ── customer_tags ──────────────────────────────────────────

-- Access mirrors the parent customer's access policy
CREATE POLICY "customer_tags: inherit customer access for select"
  ON public.customer_tags FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id
        AND (
          public.current_user_role() IN ('admin', 'manager')
          OR c.assigned_to = auth.uid()
          OR c.created_by  = auth.uid()
        )
    )
  );

CREATE POLICY "customer_tags: inherit customer access for insert"
  ON public.customer_tags FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id
        AND (
          public.current_user_role() IN ('admin', 'manager')
          OR c.assigned_to = auth.uid()
          OR c.created_by  = auth.uid()
        )
    )
  );

CREATE POLICY "customer_tags: inherit customer access for delete"
  ON public.customer_tags FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id
        AND (
          public.current_user_role() IN ('admin', 'manager')
          OR c.assigned_to = auth.uid()
          OR c.created_by  = auth.uid()
        )
    )
  );


-- ── leads ─────────────────────────────────────────────────

CREATE POLICY "leads: role-scoped select"
  ON public.leads FOR SELECT TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );

CREATE POLICY "leads: authenticated can insert"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "leads: role-scoped update"
  ON public.leads FOR UPDATE TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );

CREATE POLICY "leads: admin can delete"
  ON public.leads FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');


-- ── pipeline_stages ────────────────────────────────────────

-- Kanban requires all users to read all stages
CREATE POLICY "pipeline_stages: authenticated can select"
  ON public.pipeline_stages FOR SELECT TO authenticated
  USING (true);

-- Only admin configures stages (Settings → Pipeline)
CREATE POLICY "pipeline_stages: admin can insert"
  ON public.pipeline_stages FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "pipeline_stages: admin can update"
  ON public.pipeline_stages FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin');

CREATE POLICY "pipeline_stages: admin can delete"
  ON public.pipeline_stages FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');


-- ── deals ─────────────────────────────────────────────────

CREATE POLICY "deals: role-scoped select"
  ON public.deals FOR SELECT TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );

CREATE POLICY "deals: authenticated can insert"
  ON public.deals FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "deals: role-scoped update"
  ON public.deals FOR UPDATE TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );

CREATE POLICY "deals: admin can delete"
  ON public.deals FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');


-- ── activities ─────────────────────────────────────────────

CREATE POLICY "activities: role-scoped select"
  ON public.activities FOR SELECT TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );

CREATE POLICY "activities: authenticated can insert"
  ON public.activities FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "activities: role-scoped update"
  ON public.activities FOR UPDATE TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );

-- Creator or admin can delete activities
CREATE POLICY "activities: creator/admin can delete"
  ON public.activities FOR DELETE TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR created_by = auth.uid()
  );


-- ── audit_logs ─────────────────────────────────────────────

-- Only admin can query the audit log
CREATE POLICY "audit_logs: admin can select"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.current_user_role() = 'admin');

-- Any authenticated user can append their own audit entries
CREATE POLICY "audit_logs: authenticated can insert own"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Audit logs are immutable — no UPDATE or DELETE policies


-- ────────────────────────────────────────────────────────────
-- SEED DATA
-- ────────────────────────────────────────────────────────────

-- Default pipeline stages (standard B2B sales funnel)
INSERT INTO public.pipeline_stages
  (name, order_index, color, probability, is_closed_won, is_closed_lost)
VALUES
  ('New',         1, '#94a3b8', 10,  false, false),
  ('Qualified',   2, '#60a5fa', 30,  false, false),
  ('Proposal',    3, '#a78bfa', 50,  false, false),
  ('Negotiation', 4, '#fb923c', 75,  false, false),
  ('Closed Won',  5, '#4ade80', 100, true,  false),
  ('Closed Lost', 6, '#f87171', 0,   false, true)
ON CONFLICT (name) DO NOTHING;

-- Default tags
INSERT INTO public.tags (name, color)
VALUES
  ('VIP',        '#f59e0b'),
  ('Partner',    '#6366f1'),
  ('Enterprise', '#0ea5e9'),
  ('SMB',        '#10b981'),
  ('At Risk',    '#ef4444'),
  ('Churned',    '#6b7280')
ON CONFLICT (name) DO NOTHING;
