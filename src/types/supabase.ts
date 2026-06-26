export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'customer' | 'scraper' | 'recycler' | 'admin';
  avatar_url: string | null;
  created_at: string;
};

export type Scraper = {
  id: string;
  user_id: string;
  aadhaar_number: string | null;
  vehicle_type: string | null;
  service_radius: number | null;
  bank_account: string | null;
  upi_id: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  current_latitude: number | null;
  current_longitude: number | null;
  updated_at: string;
};

export type Recycler = {
  id: string;
  user_id: string;
  company_name: string | null;
  address: string | null;
  cpcb_registration_number: string | null;
  license_url: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type PickupRequest = {
  id: string;
  user_id: string;
  device_type: string | null;
  estimated_weight: number | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: 'requested' | 'assigned' | 'on_the_way' | 'picked_up' | 'delivered_to_recycler' | 'completed' | 'cancelled';
  assigned_scraper_id: string | null;
  pickup_fee: number | null;
  distance_km: number | null;
  created_at: string;
  updated_at: string;
};

export type Inventory = {
  id: string;
  recycler_id: string;
  material_type: 'copper' | 'aluminium' | 'lithium' | 'plastic' | 'circuit_boards' | 'other_metals';
  quantity_kg: number;
  purchase_price: number | null;
  sale_price: number | null;
  updated_at: string;
};

export type Transaction = {
  id: string;
  pickup_request_id: string | null;
  user_id: string | null;
  scraper_id: string | null;
  amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
};
