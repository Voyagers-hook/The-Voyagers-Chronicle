-- Grant admin role to info@voyagerhook.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'info@voyagerhook.com'
ON CONFLICT (user_id, role) DO NOTHING;
