-- ============================================================
-- FlowOps CRM — Notifications
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- TABLE
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id    UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  type        TEXT         NOT NULL,
  title       TEXT         NOT NULL,
  body        TEXT,
  entity_type TEXT,
  entity_id   UUID,
  is_read     BOOLEAN      NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users see only their own notifications
CREATE POLICY "notifications_select"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;


-- ────────────────────────────────────────────────────────────
-- FAN-OUT HELPER
-- Runs as SECURITY DEFINER so it can INSERT for other users.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.notify_team(
  p_actor_id  UUID,
  p_type      TEXT,
  p_title     TEXT,
  p_body      TEXT    DEFAULT NULL,
  p_entity_type TEXT  DEFAULT NULL,
  p_entity_id UUID    DEFAULT NULL
) RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.notifications
    (user_id, actor_id, type, title, body, entity_type, entity_id)
  SELECT
    p.id,
    p_actor_id,
    p_type,
    p_title,
    p_body,
    p_entity_type,
    p_entity_id
  FROM public.profiles p
  WHERE (p_actor_id IS NULL OR p.id != p_actor_id)
    AND p.is_active = true;
END;
$$;

-- Only triggers may call this function (not arbitrary SQL from users)
REVOKE EXECUTE ON FUNCTION public.notify_team FROM PUBLIC;


-- ────────────────────────────────────────────────────────────
-- TRIGGERS
-- ────────────────────────────────────────────────────────────

-- ── Customers ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.trg_notify_customer_created()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.notify_team(
    NEW.created_by,
    'customer_created',
    'New customer: ' || NEW.company_name,
    NEW.contact_name,
    'customer',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_customer_insert
  AFTER INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_customer_created();

-- ── Leads ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.trg_notify_lead_created()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.notify_team(
    NEW.created_by,
    'lead_created',
    'New lead: ' || NEW.first_name || ' ' || NEW.last_name,
    COALESCE(NEW.company, NEW.email),
    'lead',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_lead_insert
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_lead_created();

-- ── Deals ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.trg_notify_deal_change()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
DECLARE
  v_stage_name TEXT;
  v_actor      UUID;
BEGIN
  BEGIN
    v_actor := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_actor := NEW.created_by;
  END;

  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_team(
      COALESCE(v_actor, NEW.created_by),
      'deal_created',
      'New deal: ' || NEW.title,
      NULL,
      'deal',
      NEW.id
    );

  ELSIF TG_OP = 'UPDATE' AND OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    SELECT name INTO v_stage_name
    FROM public.pipeline_stages
    WHERE id = NEW.stage_id;

    PERFORM public.notify_team(
      v_actor,
      'deal_stage_changed',
      'Deal moved to ' || COALESCE(v_stage_name, 'new stage') || ': ' || NEW.title,
      NULL,
      'deal',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_deal_insert
  AFTER INSERT ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_deal_change();

CREATE TRIGGER notify_deal_update
  AFTER UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_deal_change();
