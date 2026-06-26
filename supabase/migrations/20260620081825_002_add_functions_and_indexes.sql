/*
# EcoLog Functions and Indexes

1. New Functions
- `calculate_pickup_fee(distance_km)` - Returns fee based on EcoLog pricing rules
- `haversine_distance(lat1, lon1, lat2, lon2)` - Calculates distance between two GPS points
- `update_updated_at_column()` - Auto-updates updated_at timestamp

2. New Indexes
- Index on pickup_requests status for filtering
- Index on pickup_requests assigned_scraper_id
- Index on scrapers verification_status
- Index on recyclers verification_status
- Index on inventory recycler_id and material_type

3. Triggers
- Auto-update updated_at on pickup_requests and scrapers
*/

-- Haversine distance function for GPS calculations
CREATE OR REPLACE FUNCTION public.haversine_distance(
  lat1 float8, lon1 float8, lat2 float8, lon2 float8
)
RETURNS float8 AS $$
DECLARE
  R float8 := 6371; -- Earth radius in km
  dlat float8;
  dlon float8;
  a float8;
  c float8;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Pickup fee calculation
CREATE OR REPLACE FUNCTION public.calculate_pickup_fee(distance_km float8)
RETURNS float8 AS $$
BEGIN
  IF distance_km IS NULL OR distance_km <= 5 THEN
    RETURN 0;
  ELSE
    RETURN (distance_km - 5) * 10;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-update updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_pickup_requests_updated_at ON pickup_requests;
CREATE TRIGGER update_pickup_requests_updated_at
  BEFORE UPDATE ON pickup_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scrapers_updated_at ON scrapers;
CREATE TRIGGER update_scrapers_updated_at
  BEFORE UPDATE ON scrapers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON pickup_requests(status);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_user_id ON pickup_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_assigned_scraper ON pickup_requests(assigned_scraper_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_created_at ON pickup_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrapers_user_id ON scrapers(user_id);
CREATE INDEX IF NOT EXISTS idx_scrapers_verification ON scrapers(verification_status);
CREATE INDEX IF NOT EXISTS idx_recyclers_user_id ON recyclers(user_id);
CREATE INDEX IF NOT EXISTS idx_recyclers_verification ON recyclers(verification_status);
CREATE INDEX IF NOT EXISTS idx_inventory_recycler_id ON inventory(recycler_id);
CREATE INDEX IF NOT EXISTS idx_inventory_material ON inventory(material_type);
CREATE INDEX IF NOT EXISTS idx_transactions_pickup_id ON transactions(pickup_request_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
