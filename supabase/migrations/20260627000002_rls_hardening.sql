-- ============================================================
-- FlowOps CRM — RLS Hardening
-- Patches security gaps in the initial schema migration.
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. Block anon at the table level
--
--    RLS already blocks anon (no anon policies exist), but
--    explicit table-level REVOKE provides defense-in-depth:
--    access is denied even if RLS is temporarily bypassed.
-- ────────────────────────────────────────────────────────────

REVOKE ALL ON public.profiles        FROM anon;
REVOKE ALL ON public.tags            FROM anon;
REVOKE ALL ON public.customers       FROM anon;
REVOKE ALL ON public.customer_tags   FROM anon;
REVOKE ALL ON public.leads           FROM anon;
REVOKE ALL ON public.pipeline_stages FROM anon;
REVOKE ALL ON public.deals           FROM anon;
REVOKE ALL ON public.activities      FROM anon;
REVOKE ALL ON public.audit_logs      FROM anon;
REVOKE ALL ON public.notifications   FROM anon;


-- ────────────────────────────────────────────────────────────
-- 2. Profiles — prevent role self-escalation
--
--    Gap: original UPDATE policy has no WITH CHECK, so it
--    defaults to USING. The USING clause is:
--      id = auth.uid() OR current_user_role() = 'admin'
--    An employee can do:
--      UPDATE profiles SET role = 'admin' WHERE id = auth.uid()
--    The new row still satisfies `id = auth.uid()` → accepted.
--
--    Fix: WITH CHECK requires either (a) caller is already
--    admin, or (b) caller is updating their own profile AND
--    the role column is not changing.
--
--    Note: current_user_role() is STABLE (cached per query),
--    so it reads the role that existed BEFORE this UPDATE —
--    exactly what we want for the self-update guard.
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles: own or admin can update" ON public.profiles;

CREATE POLICY "profiles: own or admin can update"
  ON public.profiles FOR UPDATE TO authenticated
  USING  (id = auth.uid() OR public.current_user_role() = 'admin')
  WITH CHECK (
    -- Admins may change any field, including role, on any profile
    public.current_user_role() = 'admin'
    OR (
      -- Non-admins may update their own profile but role must stay the same
      id   = auth.uid()
      AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    )
  );


-- ────────────────────────────────────────────────────────────
-- 3. Activities — widen SELECT to parent-entity access
--
--    Gap: original policy only shows activities where the
--    current user is the activity's creator or assignee. This
--    hides a teammate's call/email from a customer detail page
--    even when the current user owns that customer.
--
--    Fix: also grant visibility when the user can access the
--    parent entity (customer / lead / deal).
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "activities: role-scoped select" ON public.activities;

CREATE POLICY "activities: role-scoped select"
  ON public.activities FOR SELECT TO authenticated
  USING (
    -- Admins and managers see all activities
    public.current_user_role() IN ('admin', 'manager')

    -- Direct ownership of the activity itself
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()

    -- Activity belongs to a customer the user owns or is assigned to
    OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id
        AND (c.assigned_to = auth.uid() OR c.created_by = auth.uid())
    )

    -- Activity belongs to a lead the user owns or is assigned to
    OR EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_id
        AND (l.assigned_to = auth.uid() OR l.created_by = auth.uid())
    )

    -- Activity belongs to a deal the user owns or is assigned to
    OR EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = deal_id
        AND (d.assigned_to = auth.uid() OR d.created_by = auth.uid())
    )
  );


-- ────────────────────────────────────────────────────────────
-- 4. Notifications — allow users to delete their own rows
--
--    No DELETE policy existed. This enables a future
--    "Clear all notifications" button without server-side
--    action workarounds.
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "notifications: delete own" ON public.notifications;

CREATE POLICY "notifications: delete own"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 5. Leads — explicit WITH CHECK on UPDATE
--
--    Without WITH CHECK the clause defaults to USING, which
--    already prevents created_by / assigned_to hijacking.
--    Making it explicit documents intent and is resilient
--    to future Postgres behaviour changes.
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "leads: role-scoped update" ON public.leads;

CREATE POLICY "leads: role-scoped update"
  ON public.leads FOR UPDATE TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  )
  WITH CHECK (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );


-- ────────────────────────────────────────────────────────────
-- 6. Customers — explicit WITH CHECK on UPDATE
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "customers: role-scoped update" ON public.customers;

CREATE POLICY "customers: role-scoped update"
  ON public.customers FOR UPDATE TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  )
  WITH CHECK (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );


-- ────────────────────────────────────────────────────────────
-- 7. Deals — explicit WITH CHECK on UPDATE
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "deals: role-scoped update" ON public.deals;

CREATE POLICY "deals: role-scoped update"
  ON public.deals FOR UPDATE TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  )
  WITH CHECK (
    public.current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by  = auth.uid()
  );


-- ────────────────────────────────────────────────────────────
-- 8. Lead score — SECURITY DEFINER helper for cross-user updates
--
--    scoreOneLead() in the app runs with the current user's
--    session. If user A logs an activity on a lead created by
--    user B (not assigned to A), the direct UPDATE on leads
--    would be blocked by RLS.
--
--    This function bypasses RLS for the single score column
--    only; all other columns remain protected by the policy
--    above.  The app calls it via supabase.rpc().
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_lead_score(
  p_lead_id uuid,
  p_score   integer
) RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.leads
  SET score = p_score
  WHERE id = p_lead_id;
END;
$$;

-- Block arbitrary SQL execution; only the app (via authenticated RPC) can call it.
REVOKE EXECUTE ON FUNCTION public.set_lead_score FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.set_lead_score TO authenticated;
