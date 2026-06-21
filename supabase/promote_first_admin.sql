-- ============================================================
-- Promote First User to Admin
-- ============================================================
-- After signing up via /login, run this in the Supabase Dashboard
-- SQL Editor to grant yourself Admin access.
--
-- Steps:
--   1. Sign up / sign in at http://localhost:3000/login
--   2. Go to Supabase Dashboard → SQL Editor
--   3. Run the query below (replace the email with yours)
-- ============================================================

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, full_name, role FROM public.profiles;
