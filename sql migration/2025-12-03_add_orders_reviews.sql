-- SQL migration to add orders, order_items, customer_profiles, reviews, and supporting functions/policies
-- Run this in your Supabase SQL editor (Project > SQL Editor > New query)

-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function to set updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Order status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM ('received','dispatched','completed','returned','cancelled');
  END IF;
END $$;

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  status order_status NOT NULL DEFAULT 'received',
  total integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Customer profiles
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Add FK from reviews.user_id -> customer_profiles.user_id (customer_profiles.user_id is unique)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reviews_user_profile_fkey') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_user_profile_fkey
    FOREIGN KEY (user_id) REFERENCES public.customer_profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

-- Orders policies (admin-only management)
-- Requires `has_role(uid, 'admin')` function to exist (common in Supabase setups)
CREATE POLICY IF NOT EXISTS "Admins can view all orders" ON public.orders FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY IF NOT EXISTS "Admins can insert orders" ON public.orders FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY IF NOT EXISTS "Admins can update orders" ON public.orders FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY IF NOT EXISTS "Admins can delete orders" ON public.orders FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Order items policies
CREATE POLICY IF NOT EXISTS "Admins can view all order items" ON public.order_items FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY IF NOT EXISTS "Admins can insert order items" ON public.order_items FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY IF NOT EXISTS "Admins can update order items" ON public.order_items FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY IF NOT EXISTS "Admins can delete order items" ON public.order_items FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Customer profiles policies
CREATE POLICY IF NOT EXISTS "Anyone can view customer profiles" ON public.customer_profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.customer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.customer_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY IF NOT EXISTS "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Triggers to update `updated_at` timestamps
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate order number on insert
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || LPAD(EXTRACT(EPOCH FROM NOW())::bigint::text, 12, '0') || '-' || SUBSTR(NEW.id::text, 1, 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Function to create customer_profile row when new user created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customer_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (Supabase) to insert profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_customer ON auth.users;
CREATE TRIGGER on_auth_user_created_customer AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer();

-- End of migration
