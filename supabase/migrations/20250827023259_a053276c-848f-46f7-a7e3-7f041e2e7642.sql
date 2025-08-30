-- Create additional security functions for enhanced validation
CREATE OR REPLACE FUNCTION public.validate_profile_access(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT target_user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.validate_order_access(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT target_user_id = auth.uid() OR is_admin(auth.uid());
$$;

-- Enhanced RLS policies for profiles table with additional validation
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Stricter profile policies with double validation
CREATE POLICY "Users can view own profile with validation" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid() AND validate_profile_access(user_id));

CREATE POLICY "Users can update own profile with validation" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid() AND validate_profile_access(user_id));

CREATE POLICY "Users can insert own profile with validation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid() AND validate_profile_access(user_id));

CREATE POLICY "Admins can view profiles with admin validation" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Enhanced RLS policies for orders table
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Stricter order policies
CREATE POLICY "Users can view own orders with validation" 
ON public.orders 
FOR SELECT 
USING (user_id = auth.uid() AND validate_order_access(user_id));

CREATE POLICY "Users can create own orders with validation" 
ON public.orders 
FOR INSERT 
WITH CHECK (user_id = auth.uid() AND validate_order_access(user_id));

CREATE POLICY "Admins can view all orders with admin validation" 
ON public.orders 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update orders with admin validation" 
ON public.orders 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Add function to mask sensitive data for non-owners
CREATE OR REPLACE FUNCTION public.mask_sensitive_profile_data(
  profile_row profiles,
  requesting_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- If user is viewing their own profile or is admin, return full data
  IF profile_row.user_id = requesting_user_id OR is_admin(requesting_user_id) THEN
    RETURN to_jsonb(profile_row);
  END IF;
  
  -- Otherwise return masked data
  RETURN jsonb_build_object(
    'id', profile_row.id,
    'user_id', profile_row.user_id,
    'full_name', profile_row.full_name,
    'avatar_url', profile_row.avatar_url,
    'created_at', profile_row.created_at,
    'updated_at', profile_row.updated_at,
    'email', CASE WHEN profile_row.email IS NOT NULL 
              THEN regexp_replace(profile_row.email, '^(.{2}).*(@.*)$', '\1***\2') 
              ELSE NULL END,
    'phone', CASE WHEN profile_row.phone IS NOT NULL 
             THEN regexp_replace(profile_row.phone, '^(.{3}).*(.{2})$', '\1***\2') 
             ELSE NULL END,
    'address', CASE WHEN profile_row.address IS NOT NULL 
               THEN jsonb_build_object('masked', true) 
               ELSE NULL END
  );
END;
$$;

-- Create audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log access to sensitive tables
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers for sensitive tables
CREATE TRIGGER audit_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER audit_orders_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

-- Add updated_at triggers for audit table
CREATE TRIGGER update_audit_logs_updated_at
  BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();