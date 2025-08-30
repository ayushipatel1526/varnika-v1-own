-- Fix search path issues for security functions
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.mask_sensitive_profile_data(
  profile_row profiles,
  requesting_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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