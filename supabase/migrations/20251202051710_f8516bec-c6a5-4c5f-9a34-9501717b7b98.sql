-- Create a table to store pre-approved admin emails
CREATE TABLE IF NOT EXISTS public.admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_emails
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can manage admin emails
CREATE POLICY "Only admins can view admin emails"
  ON public.admin_emails
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert admin emails"
  ON public.admin_emails
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete admin emails"
  ON public.admin_emails
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Function to auto-assign admin role to pre-approved emails
CREATE OR REPLACE FUNCTION public.handle_new_user_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user's email is in admin_emails
  IF EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE email = NEW.email
  ) THEN
    -- Insert admin role for this user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign admin role on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_admin_role();