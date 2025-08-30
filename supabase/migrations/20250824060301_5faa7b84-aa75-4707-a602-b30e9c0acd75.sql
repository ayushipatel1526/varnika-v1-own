-- Set ap6030@admin.com as admin user
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'ap6030@admin.com';