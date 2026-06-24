-- ============================================================
-- FlowOps CRM — Demo Seed Data
-- ============================================================
-- Cách chạy: Supabase Dashboard → SQL Editor → paste → Run
-- Yêu cầu:   Đã sign up ít nhất 1 tài khoản (tạo ra 1 profile)
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- PHẦN 1: Customers · Leads · Deals · Activities
-- (tất cả assign cho admin — user đã sign up)
-- ════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_me uuid;

  -- pipeline stage ids (đã seed sẵn trong migration)
  st_new    uuid;
  st_qual   uuid;
  st_prop   uuid;
  st_nego   uuid;
  st_won    uuid;
  st_lost   uuid;

  -- tag ids (đã seed sẵn trong migration)
  tg_vip    uuid;
  tg_ent    uuid;
  tg_smb    uuid;
  tg_risk   uuid;
  tg_ptr    uuid;

  -- customer ids
  c1 uuid := gen_random_uuid();
  c2 uuid := gen_random_uuid();
  c3 uuid := gen_random_uuid();
  c4 uuid := gen_random_uuid();
  c5 uuid := gen_random_uuid();
  c6 uuid := gen_random_uuid();
  c7 uuid := gen_random_uuid();
  c8 uuid := gen_random_uuid();

  -- lead ids
  l1  uuid := gen_random_uuid();
  l2  uuid := gen_random_uuid();
  l3  uuid := gen_random_uuid();
  l4  uuid := gen_random_uuid();
  l5  uuid := gen_random_uuid();
  l6  uuid := gen_random_uuid();
  l7  uuid := gen_random_uuid();
  l8  uuid := gen_random_uuid();
  l9  uuid := gen_random_uuid();
  l10 uuid := gen_random_uuid();

  -- deal ids
  d1 uuid := gen_random_uuid();
  d2 uuid := gen_random_uuid();
  d3 uuid := gen_random_uuid();
  d4 uuid := gen_random_uuid();
  d5 uuid := gen_random_uuid();
  d6 uuid := gen_random_uuid();
  d7 uuid := gen_random_uuid();
  d8 uuid := gen_random_uuid();

BEGIN
  SELECT id INTO v_me FROM public.profiles LIMIT 1;
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Chưa có profile nào. Hãy sign up tại /login trước, rồi chạy lại script này.';
  END IF;

  SELECT id INTO st_new  FROM public.pipeline_stages WHERE name = 'New'         LIMIT 1;
  SELECT id INTO st_qual FROM public.pipeline_stages WHERE name = 'Qualified'   LIMIT 1;
  SELECT id INTO st_prop FROM public.pipeline_stages WHERE name = 'Proposal'    LIMIT 1;
  SELECT id INTO st_nego FROM public.pipeline_stages WHERE name = 'Negotiation' LIMIT 1;
  SELECT id INTO st_won  FROM public.pipeline_stages WHERE name = 'Closed Won'  LIMIT 1;
  SELECT id INTO st_lost FROM public.pipeline_stages WHERE name = 'Closed Lost' LIMIT 1;

  SELECT id INTO tg_vip  FROM public.tags WHERE name = 'VIP'       LIMIT 1;
  SELECT id INTO tg_ent  FROM public.tags WHERE name = 'Enterprise' LIMIT 1;
  SELECT id INTO tg_smb  FROM public.tags WHERE name = 'SMB'        LIMIT 1;
  SELECT id INTO tg_risk FROM public.tags WHERE name = 'At Risk'    LIMIT 1;
  SELECT id INTO tg_ptr  FROM public.tags WHERE name = 'Partner'    LIMIT 1;

  -- ── Customers ──────────────────────────────────────────────────────────────
  INSERT INTO public.customers
    (id, company_name, contact_name, email, phone, website, industry, status, notes, assigned_to, created_by)
  VALUES
    (c1, 'TechVision Corp',         'James Carter',   'james.carter@techvision.io',       '+1 415 555 0101', 'techvision.io',     'Technology',    'active',   'Key enterprise account. Annual contract renewal in Q4.',          v_me, v_me),
    (c2, 'Nova Financial Group',    'Sarah Mitchell',  'sarah.mitchell@novafinancial.com', '+1 212 555 0234', 'novafinancial.com', 'Finance',       'active',   'Requires SOC2 compliance documentation before renewal.',         v_me, v_me),
    (c3, 'CloudBase Solutions',     'David Park',      'david.park@cloudbase.dev',          '+1 206 555 0387', 'cloudbase.dev',    'Technology',    'active',   'Expanding to APAC and EU. Strong upsell opportunity.',           v_me, v_me),
    (c4, 'RetailPro Inc',           'Emily Torres',    'emily.torres@retailpro.com',        '+1 312 555 0412', 'retailpro.com',    'Retail',        'active',   'Seasonal spikes Q3–Q4. Exploring dedicated support package.',    v_me, v_me),
    (c5, 'DataStream Analytics',    'Michael Chen',    'michael.chen@datastream.ai',        '+1 628 555 0519', 'datastream.ai',   'Technology',    'active',   'Power user of analytics suite. Potential reference customer.',   v_me, v_me),
    (c6, 'MedCare Systems',         'Lisa Johnson',    'lisa.johnson@medcare.com',          '+1 713 555 0628', 'medcare.com',      'Healthcare',    'active',   'HIPAA requirements under review. Strong long-term potential.',   v_me, v_me),
    (c7, 'BuildRight Construction', 'Robert Kim',      'robert.kim@buildright.com',          '+1 503 555 0731', 'buildright.com',  'Manufacturing', 'inactive', 'Paused contract. Budget cut. Revisit Q2 next year.',            v_me, v_me),
    (c8, 'EduLearn Platform',       'Anna Williams',   'anna.williams@edulearn.io',          '+1 844 555 0842', 'edulearn.io',    'Education',     'churned',  'Churned Q1. Switched to competitor. Follow up in 12 months.',   v_me, v_me);

  INSERT INTO public.customer_tags (customer_id, tag_id) VALUES
    (c1, tg_vip),  (c1, tg_ent),
    (c2, tg_ent),
    (c3, tg_ent),  (c3, tg_ptr),
    (c4, tg_smb),
    (c5, tg_vip),
    (c6, tg_smb),
    (c7, tg_risk),
    (c8, tg_risk)
  ON CONFLICT DO NOTHING;

  -- ── Leads ──────────────────────────────────────────────────────────────────
  INSERT INTO public.leads
    (id, first_name, last_name, email, phone, company, job_title, source, status, score, notes, assigned_to, created_by)
  VALUES
    (l1,  'Alex',    'Morgan',    'alex.morgan@futuretech.io',    '+1 415 555 1001', 'FutureTech Inc',       'CTO',               'referral',     'qualified',   85, 'Referred by TechVision. High intent. Budget pre-approved.',         v_me, v_me),
    (l2,  'Priya',   'Sharma',    'priya.sharma@finedge.com',     '+1 212 555 1002', 'FinEdge Capital',      'CFO',               'linkedin',     'contacted',   62, 'Engaged with LinkedIn post. Pricing call completed.',              v_me, v_me),
    (l3,  'Tom',     'Bradley',   'tom.bradley@growthops.com',    NULL,              'GrowthOps',            'VP Sales',          'web',          'new',         30, 'Downloaded pipeline whitepaper. No follow-up yet.',                v_me, v_me),
    (l4,  'Maria',   'Santos',    'maria.santos@nexaretail.com',  '+1 312 555 1004', 'NexaRetail Group',     'Head of IT',        'event',        'qualified',   78, 'Met at SaaStr Annual. Demo scheduled next Tuesday.',               v_me, v_me),
    (l5,  'Kevin',   'Zhang',     'kevin.zhang@cloudfirst.io',    '+1 628 555 1005', 'CloudFirst Systems',   'Founder',           'cold-outreach','new',         20, 'Cold email. Opened 3× but no reply. Try LinkedIn.',                v_me, v_me),
    (l6,  'Rachel',  'Thompson',  'rachel.t@healthpulse.com',     '+1 713 555 1006', 'HealthPulse Analytics','COO',               'referral',     'converted',   92, 'Converted Q1. Excellent ICP fit.',                                 v_me, v_me),
    (l7,  'Daniel',  'Lee',       'daniel.lee@buildforge.com',    '+1 503 555 1007', 'BuildForge Tools',     'Operations Manager','web',          'disqualified',15, 'Budget too small. Referred to free tier.',                         v_me, v_me),
    (l8,  'Sophie',  'Martin',    'sophie.martin@edutechpro.com', '+1 844 555 1008', 'EduTechPro',           'Product Manager',   'linkedin',     'contacted',   55, 'Engaged with 3 posts. Requested full pricing.',                    v_me, v_me),
    (l9,  'Omar',    'Hassan',    'omar.hassan@analytix.ai',      '+1 415 555 1009', 'Analytix AI',          'CEO',               'event',        'new',         45, 'Met at AI Summit. Wants analytics roadmap overview.',             v_me, v_me),
    (l10, 'Jessica', 'Brown',     'jessica.brown@scaleup.io',     '+1 206 555 1010', 'ScaleUp Ventures',     'VP Engineering',    'referral',     'qualified',   70, 'Warm intro from DataStream. Schedule technical deep-dive.',        v_me, v_me);

  -- ── Deals ──────────────────────────────────────────────────────────────────
  INSERT INTO public.deals
    (id, title, value, currency, stage_id, customer_id, assigned_to, expected_close_date, actual_close_date, probability, notes, created_by)
  VALUES
    (d1, 'TechVision — Enterprise Renewal',    48000, 'USD', st_nego, c1, v_me, CURRENT_DATE+14,  NULL,              80, 'Annual renewal + 20% seat expansion. Legal review in progress.', v_me),
    (d2, 'Nova Financial — Compliance Module', 32000, 'USD', st_prop, c2, v_me, CURRENT_DATE+30,  NULL,              60, 'Custom compliance dashboard. Proposal sent, awaiting sign-off.', v_me),
    (d3, 'CloudBase — Multi-region Expansion', 75000, 'USD', st_qual, c3, v_me, CURRENT_DATE+45,  NULL,              40, 'Expansion to APAC and EU. Technical assessment next week.',      v_me),
    (d4, 'RetailPro — Peak Season Package',    18500, 'USD', st_new,  c4, v_me, CURRENT_DATE+60,  NULL,              20, 'New Q4 peak package. Initial requirements call done.',           v_me),
    (d5, 'DataStream — AI Analytics Add-on',   22000, 'USD', st_prop, c5, v_me, CURRENT_DATE+21,  NULL,              65, 'AI recommendations pilot. Strong interest from data team.',      v_me),
    (d6, 'MedCare — HIPAA Integration',        41000, 'USD', st_qual, c6, v_me, CURRENT_DATE+50,  NULL,              35, 'Security audit required. Intro call went well.',                  v_me),
    (d7, 'TechVision — Professional Services', 12000, 'USD', st_won,  c1, v_me, CURRENT_DATE-30,  CURRENT_DATE-28, 100, 'Delivered on time. Customer satisfied.',                          v_me),
    (d8, 'EduLearn — Pilot Renewal',            8500, 'USD', st_lost, c8, v_me, CURRENT_DATE-60,  CURRENT_DATE-55,   0, 'Lost to competitor on pricing. Follow up in 6 months.',          v_me);

  -- ── Activities ─────────────────────────────────────────────────────────────
  INSERT INTO public.activities
    (type, subject, description, customer_id, lead_id, deal_id, assigned_to, created_by, created_at)
  VALUES
    ('call',    'TechVision — Renewal discovery',       'Discussed renewal + seat expansion. Champion aligned.',             c1,   NULL, d1,   v_me, v_me, NOW()-INTERVAL '2 days'),
    ('email',   'Nova Financial — Compliance proposal', 'Sent 12-page proposal. Awaiting legal sign-off.',                  c2,   NULL, d2,   v_me, v_me, NOW()-INTERVAL '4 days'),
    ('meeting', 'CloudBase — Technical kick-off',       'Scoped multi-region needs. 3 regions confirmed.',                  c3,   NULL, d3,   v_me, v_me, NOW()-INTERVAL '7 days'),
    ('call',    'FutureTech — Qualification call',      'Budget confirmed. Moving to technical demo.',                      NULL, l1,   NULL, v_me, v_me, NOW()-INTERVAL '1 day'),
    ('email',   'FinEdge — Customized pricing deck',    'Sent pricing for 50-seat estimate. Awaiting budget approval.',     NULL, l2,   NULL, v_me, v_me, NOW()-INTERVAL '3 days'),
    ('meeting', 'NexaRetail — Product demo',            '1-hr demo. Loved the pipeline Kanban and reporting.',              NULL, l4,   NULL, v_me, v_me, NOW()-INTERVAL '5 days'),
    ('note',    'DataStream — AI pilot feedback',       'NPS: 9/10 from data science team.',                                c5,   NULL, d5,   v_me, v_me, NOW()-INTERVAL '2 days'),
    ('task',    'MedCare — Prepare HIPAA audit docs',   'Compile SOC2 Type II + security questionnaire.',                   c6,   NULL, d6,   v_me, v_me, NOW()-INTERVAL '6 days'),
    ('call',    'RetailPro — Seasonal requirements',    'Mapped Q4 capacity. Sending proposal tomorrow.',                   c4,   NULL, d4,   v_me, v_me, NOW()-INTERVAL '1 day'),
    ('email',   'ScaleUp — Intro + case studies',       'Sent 2 case studies from similar-stage companies.',                NULL, l10,  NULL, v_me, v_me, NOW()-INTERVAL '3 days'),
    ('meeting', 'TechVision — PS sign-off',             'Signed off PS delivery. Customer very happy.',                     c1,   NULL, d7,   v_me, v_me, NOW()-INTERVAL '28 days'),
    ('note',    'EduLearn — Churn post-mortem',         'Competitor 30% cheaper. Flag for pricing team.',                   c8,   NULL, d8,   v_me, v_me, NOW()-INTERVAL '55 days');

  RAISE NOTICE '✓ Phần 1 xong: 8 customers, 10 leads, 8 deals, 12 activities.';
END $$;


-- ════════════════════════════════════════════════════════════
-- PHẦN 2: Rep Leaderboard — Team Members + Deals của họ
-- Tạo 3 fake auth users → trigger auto-tạo profiles
-- Rồi insert deals/activities cho mỗi rep để leaderboard có data
-- ════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_instance_id uuid;
  v_me          uuid;

  -- profile ids cho 3 fake reps (gán trong BEGIN, không khai báo sẵn)
  u_sarah uuid;
  u_john  uuid;
  u_emma  uuid;

  -- pipeline stages
  st_won  uuid;
  st_prop uuid;
  st_qual uuid;
  st_nego uuid;

  -- customers (lookup từ phần 1)
  c_techvision uuid;
  c_cloudbase  uuid;
  c_retailpro  uuid;
  c_datastream uuid;
  c_medcare    uuid;
  c_nova       uuid;

BEGIN
  -- Lấy instance_id từ user thật đã sign up
  SELECT instance_id INTO v_instance_id FROM auth.users LIMIT 1;
  SELECT id          INTO v_me          FROM public.profiles LIMIT 1;

  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Chạy Phần 1 trước (cần có ít nhất 1 customer để lookup).';
  END IF;

  -- ── Tao 3 fake auth users (idempotent: check truoc, insert neu chua co) ────
  -- Trigger handle_new_user() tu tao profiles tu raw_user_meta_data

  SELECT id INTO u_sarah FROM auth.users WHERE email = 'sarah.rep@demo.flowops';
  IF u_sarah IS NULL THEN
    u_sarah := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
    VALUES (v_instance_id, u_sarah, 'authenticated', 'authenticated',
            'sarah.rep@demo.flowops', crypt('FlowOps2025!', gen_salt('bf', 10)), NOW(),
            '{"full_name":"Sarah Mitchell","role":"manager"}'::jsonb,
            '{"provider":"email","providers":["email"]}'::jsonb, NOW(), NOW());
  END IF;

  SELECT id INTO u_john FROM auth.users WHERE email = 'john.rep@demo.flowops';
  IF u_john IS NULL THEN
    u_john := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
    VALUES (v_instance_id, u_john, 'authenticated', 'authenticated',
            'john.rep@demo.flowops', crypt('FlowOps2025!', gen_salt('bf', 10)), NOW(),
            '{"full_name":"John Davis","role":"employee"}'::jsonb,
            '{"provider":"email","providers":["email"]}'::jsonb, NOW(), NOW());
  END IF;

  SELECT id INTO u_emma FROM auth.users WHERE email = 'emma.rep@demo.flowops';
  IF u_emma IS NULL THEN
    u_emma := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
    VALUES (v_instance_id, u_emma, 'authenticated', 'authenticated',
            'emma.rep@demo.flowops', crypt('FlowOps2025!', gen_salt('bf', 10)), NOW(),
            '{"full_name":"Emma Wilson","role":"employee"}'::jsonb,
            '{"provider":"email","providers":["email"]}'::jsonb, NOW(), NOW());
  END IF;

  -- Cập nhật thêm department (trigger chỉ set full_name + role)
  UPDATE public.profiles
  SET department = 'Sales'
  WHERE id IN (u_sarah, u_john, u_emma);

  -- ── Lookup stage ids ───────────────────────────────────────────────────────
  SELECT id INTO st_won  FROM public.pipeline_stages WHERE name = 'Closed Won'  LIMIT 1;
  SELECT id INTO st_prop FROM public.pipeline_stages WHERE name = 'Proposal'    LIMIT 1;
  SELECT id INTO st_qual FROM public.pipeline_stages WHERE name = 'Qualified'   LIMIT 1;
  SELECT id INTO st_nego FROM public.pipeline_stages WHERE name = 'Negotiation' LIMIT 1;

  -- ── Lookup customer ids từ Phần 1 ────────────────────────────────────────
  SELECT id INTO c_techvision FROM public.customers WHERE company_name = 'TechVision Corp'      LIMIT 1;
  SELECT id INTO c_cloudbase  FROM public.customers WHERE company_name = 'CloudBase Solutions'  LIMIT 1;
  SELECT id INTO c_retailpro  FROM public.customers WHERE company_name = 'RetailPro Inc'        LIMIT 1;
  SELECT id INTO c_datastream FROM public.customers WHERE company_name = 'DataStream Analytics' LIMIT 1;
  SELECT id INTO c_medcare    FROM public.customers WHERE company_name = 'MedCare Systems'      LIMIT 1;
  SELECT id INTO c_nova       FROM public.customers WHERE company_name = 'Nova Financial Group' LIMIT 1;

  -- ── Sarah Mitchell (Manager) — top performer ──────────────────────────────
  -- 3 Closed Won ($122K revenue) + 2 active deals
  INSERT INTO public.deals
    (title, value, currency, stage_id, customer_id, assigned_to, expected_close_date, actual_close_date, probability, notes, created_by)
  VALUES
    ('CloudBase — Initial Contract',     58000, 'USD', st_won,  c_cloudbase,  u_sarah, CURRENT_DATE-90, CURRENT_DATE-85, 100, 'Initial contract. Onboarded successfully.',          u_sarah),
    ('DataStream — Annual License',      36000, 'USD', st_won,  c_datastream, u_sarah, CURRENT_DATE-45, CURRENT_DATE-42, 100, 'Annual license renewal. Upsold 5 seats.',           u_sarah),
    ('MedCare — Phase 1 Rollout',        28000, 'USD', st_won,  c_medcare,    u_sarah, CURRENT_DATE-20, CURRENT_DATE-18, 100, 'Phase 1 completed on time.',                        u_sarah),
    ('RetailPro — Enterprise Upgrade',   42000, 'USD', st_nego, c_retailpro,  u_sarah, CURRENT_DATE+20, NULL,             75, 'Upgrade SMB → Enterprise. Legal almost done.',      u_sarah),
    ('Nova Financial — API Access',      25000, 'USD', st_prop, c_nova,       u_sarah, CURRENT_DATE+35, NULL,             55, 'API integration package. Technical review done.',   u_sarah);

  -- ── John Davis (Employee) — solid performer ───────────────────────────────
  -- 2 Closed Won ($36.5K revenue) + 2 active deals
  INSERT INTO public.deals
    (title, value, currency, stage_id, customer_id, assigned_to, expected_close_date, actual_close_date, probability, notes, created_by)
  VALUES
    ('TechVision — Q1 Seat Expansion',   22000, 'USD', st_won,  c_techvision, u_john, CURRENT_DATE-75, CURRENT_DATE-70, 100, 'Q1 seat expansion. Quick close.',                   u_john),
    ('RetailPro — Analytics Module',     14500, 'USD', st_won,  c_retailpro,  u_john, CURRENT_DATE-30, CURRENT_DATE-27, 100, 'Analytics add-on. Customer very happy.',            u_john),
    ('CloudBase — Support Package',      18000, 'USD', st_qual, c_cloudbase,  u_john, CURRENT_DATE+40, NULL,             40, 'Priority support package. In scoping.',             u_john),
    ('MedCare — Training Bundle',         9500, 'USD', st_prop, c_medcare,    u_john, CURRENT_DATE+25, NULL,             60, 'Onboarding + training bundle.',                     u_john);

  -- ── Emma Wilson (Employee) — newer rep ───────────────────────────────────
  -- 1 Closed Won ($8K revenue) + 2 active deals
  INSERT INTO public.deals
    (title, value, currency, stage_id, customer_id, assigned_to, expected_close_date, actual_close_date, probability, notes, created_by)
  VALUES
    ('DataStream — Starter Pack',         8000, 'USD', st_won,  c_datastream, u_emma, CURRENT_DATE-15, CURRENT_DATE-12, 100, 'Starter pack. First won deal!',                     u_emma),
    ('TechVision — Consulting Hours',    12000, 'USD', st_qual, c_techvision, u_emma, CURRENT_DATE+50, NULL,             30, 'Consulting hours block. Still in discovery.',       u_emma),
    ('Nova Financial — Dashboard Add-on', 7500, 'USD', st_prop, c_nova,       u_emma, CURRENT_DATE+30, NULL,             50, 'Custom dashboard add-on. Demo completed.',          u_emma);

  -- ── Activities cho 3 reps ────────────────────────────────────────────────
  INSERT INTO public.activities
    (type, subject, description, customer_id, assigned_to, created_by, created_at)
  VALUES
    ('call',    'Sarah — CloudBase contract close',      'Closed initial contract. Onboarding starts next Monday.',        c_cloudbase,  u_sarah, u_sarah, NOW()-INTERVAL '85 days'),
    ('meeting', 'Sarah — DataStream renewal meeting',    'Upsell accepted. +5 seats added to contract.',                   c_datastream, u_sarah, u_sarah, NOW()-INTERVAL '42 days'),
    ('email',   'Sarah — MedCare Phase 1 sign-off',      'Delivery docs signed. Customer very satisfied.',                 c_medcare,    u_sarah, u_sarah, NOW()-INTERVAL '18 days'),
    ('call',    'Sarah — RetailPro upgrade negotiation', 'Enterprise upgrade almost done. Legal review this week.',        c_retailpro,  u_sarah, u_sarah, NOW()-INTERVAL '3 days'),
    ('call',    'John — TechVision Q1 expansion',        'Seat expansion closed same day. Fast deal.',                     c_techvision, u_john,  u_john,  NOW()-INTERVAL '70 days'),
    ('meeting', 'John — RetailPro analytics demo',       'Demo of analytics module. Customer loved it. Closed next day.',  c_retailpro,  u_john,  u_john,  NOW()-INTERVAL '27 days'),
    ('email',   'John — CloudBase support proposal',     'Sent support package options. Awaiting decision.',               c_cloudbase,  u_john,  u_john,  NOW()-INTERVAL '5 days'),
    ('note',    'Emma — DataStream starter pack win',    'First deal closed! Customer onboarded within 48 hours.',         c_datastream, u_emma,  u_emma,  NOW()-INTERVAL '12 days'),
    ('call',    'Emma — TechVision consulting intro',    'Discovery call. Scoping consulting hours needed.',               c_techvision, u_emma,  u_emma,  NOW()-INTERVAL '8 days'),
    ('meeting', 'Emma — Nova Financial dashboard demo',  'Demo went well. Sending proposal this week.',                    c_nova,       u_emma,  u_emma,  NOW()-INTERVAL '4 days');

  RAISE NOTICE '✓ Phần 2 xong: 3 reps (Sarah/John/Emma), 12 deals, 10 activities.';
  RAISE NOTICE '  Sarah: $122,000 revenue (3 won) | John: $36,500 (2 won) | Emma: $8,000 (1 won)';
END $$;
