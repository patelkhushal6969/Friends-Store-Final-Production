-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL,
  original_price integer,
  category text NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  reviews integer NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  tags text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  images jsonb NOT NULL DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (since this is a public store)
CREATE POLICY "Products are viewable by everyone"
  ON public.products
  FOR SELECT
  USING (true);

-- Create policy for authenticated users to insert products
CREATE POLICY "Authenticated users can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for authenticated users to update products
CREATE POLICY "Authenticated users can update products"
  ON public.products
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create policy for authenticated users to delete products
CREATE POLICY "Authenticated users can delete products"
  ON public.products
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create index on category for faster filtering
CREATE INDEX idx_products_category ON public.products(category);

-- Create index on created_at for sorting
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

-- Insert existing products data
INSERT INTO public.products (name, description, price, original_price, category, rating, reviews, in_stock, tags, features, images) VALUES
  (
    'Monstera Deliciosa',
    'A stunning artificial Monstera with realistic split leaves. Perfect for adding a tropical touch to any room without the maintenance.',
    1499,
    1999,
    'Large Plants',
    4.9,
    128,
    true,
    ARRAY['bestseller', 'tropical'],
    ARRAY['Lifelike texture', 'UV resistant', 'Easy to clean', 'Adjustable stems'],
    '["product-monstera.jpg"]'::jsonb
  ),
  (
    'Fiddle Leaf Fig',
    'Our signature fiddle leaf fig brings elegance to any space. Hand-crafted with attention to every detail.',
    2499,
    NULL,
    'Large Plants',
    4.8,
    94,
    true,
    ARRAY['popular', 'statement'],
    ARRAY['Premium quality', 'Real-touch leaves', 'Weighted base', 'Indoor safe'],
    '["product-fiddle.jpg"]'::jsonb
  ),
  (
    'Snake Plant',
    'Modern and architectural, this artificial snake plant adds contemporary style to offices and homes alike.',
    999,
    NULL,
    'Small Plants',
    4.7,
    156,
    true,
    ARRAY['minimalist', 'office'],
    ARRAY['Geometric planter', 'Fade resistant', 'No water needed', 'Pet safe'],
    '["product-snake.jpg"]'::jsonb
  ),
  (
    'Eucalyptus Stems',
    'Delicate artificial eucalyptus branches that bring a touch of natural elegance to your arrangements.',
    599,
    NULL,
    'Stems & Branches',
    4.6,
    89,
    true,
    ARRAY['new', 'arrangement'],
    ARRAY['Bendable stems', 'Natural colors', 'Long lasting', 'Versatile'],
    '["product-eucalyptus.jpg"]'::jsonb
  ),
  (
    'Hanging Pothos',
    'Lush trailing pothos in a beautiful macrame hanger. Creates instant greenery without any care required.',
    1299,
    1699,
    'Hanging Plants',
    4.9,
    201,
    true,
    ARRAY['bestseller', 'hanging'],
    ARRAY['Macrame included', '6ft trailing vines', 'Hook ready', 'Indoor/outdoor'],
    '["product-pothos.jpg"]'::jsonb
  ),
  (
    'Succulent Bowl',
    'A curated arrangement of realistic succulents in a minimalist ceramic bowl. Perfect for desks and shelves.',
    799,
    NULL,
    'Small Plants',
    4.8,
    167,
    true,
    ARRAY['desk', 'gift'],
    ARRAY['Mixed varieties', 'Ceramic bowl', 'Compact size', 'Gift ready'],
    '["product-succulent.jpg"]'::jsonb
  );