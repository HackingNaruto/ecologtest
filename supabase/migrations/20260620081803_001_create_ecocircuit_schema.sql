/*
# EcoLog Database Schema - Initial Migration

1. New Tables
- `profiles` - Extended user profiles linked to auth.users
  - `id` (uuid, PK, refs auth.users)
  - `full_name` (text)
  - `email` (text)
  - `phone` (text)
  - `role` (text) - customer, scraper, recycler, admin
  - `avatar_url` (text)
  - `created_at` (timestamptz)

- `scrapers` - Scraper onboarding and verification
  - `id` (uuid, PK)
  - `user_id` (uuid, refs profiles)
  - `aadhaar_number` (text)
  - `vehicle_type` (text)
  - `service_radius` (int)
  - `bank_account` (text)
  - `upi_id` (text)
  - `verification_status` (text) - pending, approved, rejected
  - `current_latitude` (float8)
  - `current_longitude` (float8)
  - `updated_at` (timestamptz)

- `recyclers` - Recycler company profiles and CPCB verification
  - `id` (uuid, PK)
  - `user_id` (uuid, refs profiles)
  - `company_name` (text)
  - `address` (text)
  - `cpcb_registration_number` (text)
  - `license_url` (text)
  - `verification_status` (text) - pending, approved, rejected
  - `created_at` (timestamptz)

- `pickup_requests` - Customer pickup requests with GPS
  - `id` (uuid, PK)
  - `user_id` (uuid, refs profiles)
  - `device_type` (text)
  - `estimated_weight` (float8)
  - `address` (text)
  - `latitude` (float8)
  - `longitude` (float8)
  - `status` (text) - requested, assigned, on_the_way, picked_up, delivered_to_recycler, completed, cancelled
  - `assigned_scraper_id` (uuid, refs scrapers)
  - `pickup_fee` (float8)
  - `distance_km` (float8)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- `inventory` - Recycler material inventory tracking
  - `id` (uuid, PK)
  - `recycler_id` (uuid, refs recyclers)
  - `material_type` (text) - copper, aluminium, lithium, plastic, circuit_boards, other_metals
  - `quantity_kg` (float8)
  - `purchase_price` (float8)
  - `sale_price` (float8)
  - `updated_at` (timestamptz)

- `transactions` - Payment records
  - `id` (uuid, PK)
  - `pickup_request_id` (uuid, refs pickup_requests)
  - `user_id` (uuid, refs profiles)
  - `scraper_id` (uuid, refs scrapers)
  - `amount` (float8)
  - `payment_status` (text) - pending, paid, failed, refunded
  - `razorpay_order_id` (text)
  - `razorpay_payment_id` (text)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on all tables.
- Owner-scoped policies for profiles.
- Role-based policies for scrapers, recyclers, pickup_requests, inventory, transactions.
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text UNIQUE,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'scraper', 'recycler', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_all_admin" ON profiles;
CREATE POLICY "profiles_select_all_admin" ON profiles FOR SELECT
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Scrapers table
CREATE TABLE IF NOT EXISTS scrapers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  aadhaar_number text,
  vehicle_type text,
  service_radius int DEFAULT 10,
  bank_account text,
  upi_id text,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  current_latitude float8,
  current_longitude float8,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scrapers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scrapers_select_own" ON scrapers;
CREATE POLICY "scrapers_select_own" ON scrapers FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "scrapers_select_all_admin" ON scrapers;
CREATE POLICY "scrapers_select_all_admin" ON scrapers FOR SELECT
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "scrapers_insert_own" ON scrapers;
CREATE POLICY "scrapers_insert_own" ON scrapers FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "scrapers_update_own" ON scrapers;
CREATE POLICY "scrapers_update_own" ON scrapers FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Recyclers table
CREATE TABLE IF NOT EXISTS recyclers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text,
  address text,
  cpcb_registration_number text,
  license_url text,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recyclers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recyclers_select_own" ON recyclers;
CREATE POLICY "recyclers_select_own" ON recyclers FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "recyclers_select_all_admin" ON recyclers;
CREATE POLICY "recyclers_select_all_admin" ON recyclers FOR SELECT
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "recyclers_insert_own" ON recyclers;
CREATE POLICY "recyclers_insert_own" ON recyclers FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "recyclers_update_own" ON recyclers;
CREATE POLICY "recyclers_update_own" ON recyclers FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Pickup requests table
CREATE TABLE IF NOT EXISTS pickup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  device_type text,
  estimated_weight float8,
  address text NOT NULL,
  latitude float8,
  longitude float8,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'assigned', 'on_the_way', 'picked_up', 'delivered_to_recycler', 'completed', 'cancelled')),
  assigned_scraper_id uuid REFERENCES scrapers(id),
  pickup_fee float8 DEFAULT 0,
  distance_km float8,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pickups_select_own" ON pickup_requests;
CREATE POLICY "pickups_select_own" ON pickup_requests FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "pickups_select_assigned_scraper" ON pickup_requests;
CREATE POLICY "pickups_select_assigned_scraper" ON pickup_requests FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM scrapers
      WHERE scrapers.id = pickup_requests.assigned_scraper_id
      AND scrapers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pickups_select_all_admin" ON pickup_requests;
CREATE POLICY "pickups_select_all_admin" ON pickup_requests FOR SELECT
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "pickups_insert_own" ON pickup_requests;
CREATE POLICY "pickups_insert_own" ON pickup_requests FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "pickups_update_own" ON pickup_requests;
CREATE POLICY "pickups_update_own" ON pickup_requests FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "pickups_update_assigned_scraper" ON pickup_requests;
CREATE POLICY "pickups_update_assigned_scraper" ON pickup_requests FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM scrapers
      WHERE scrapers.id = pickup_requests.assigned_scraper_id
      AND scrapers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pickups_update_admin" ON pickup_requests;
CREATE POLICY "pickups_update_admin" ON pickup_requests FOR UPDATE
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recycler_id uuid NOT NULL REFERENCES recyclers(id) ON DELETE CASCADE,
  material_type text NOT NULL CHECK (material_type IN ('copper', 'aluminium', 'lithium', 'plastic', 'circuit_boards', 'other_metals')),
  quantity_kg float8 NOT NULL DEFAULT 0,
  purchase_price float8,
  sale_price float8,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_select_own_recycler" ON inventory;
CREATE POLICY "inventory_select_own_recycler" ON inventory FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM recyclers
      WHERE recyclers.id = inventory.recycler_id
      AND recyclers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "inventory_select_all_admin" ON inventory;
CREATE POLICY "inventory_select_all_admin" ON inventory FOR SELECT
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "inventory_insert_own_recycler" ON inventory;
CREATE POLICY "inventory_insert_own_recycler" ON inventory FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM recyclers
      WHERE recyclers.id = inventory.recycler_id
      AND recyclers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "inventory_update_own_recycler" ON inventory;
CREATE POLICY "inventory_update_own_recycler" ON inventory FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM recyclers
      WHERE recyclers.id = inventory.recycler_id
      AND recyclers.user_id = auth.uid()
    )
  );

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_request_id uuid REFERENCES pickup_requests(id),
  user_id uuid REFERENCES profiles(id),
  scraper_id uuid REFERENCES scrapers(id),
  amount float8 NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
CREATE POLICY "transactions_select_own" ON transactions FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_select_scraper" ON transactions;
CREATE POLICY "transactions_select_scraper" ON transactions FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM scrapers
      WHERE scrapers.id = transactions.scraper_id
      AND scrapers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "transactions_select_all_admin" ON transactions;
CREATE POLICY "transactions_select_all_admin" ON transactions FOR SELECT
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "transactions_insert_own" ON transactions;
CREATE POLICY "transactions_insert_own" ON transactions FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
