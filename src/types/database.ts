export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProfileRole = 'customer' | 'scraper' | 'recycler' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type PickupStatus =
  | "requested"
  | "assigned"
  | "on_the_way"
  | "picked_up"
  | "delivered_to_recycler"
  | "processed"
  | "completed";export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type MaterialType = 'copper' | 'aluminium' | 'lithium' | 'plastic' | 'circuit_boards' | 'other_metals';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: ProfileRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Scraper {
  id: string;
  user_id: string;
  shop_name: string | null;
  aadhaar_number: string | null;
  address: string | null;
  vehicle_type: string | null;
  service_radius: number | null;
  bank_account: string | null;
  upi_id: string | null;
  verification_status: VerificationStatus;
  current_latitude: number | null;
  current_longitude: number | null;
  updated_at: string;
}

export interface Recycler {
  id: string;
  user_id: string;
  company_name: string | null;
  address: string | null;
  cpcb_registration_number: string | null;
  license_url: string | null;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface PickupRequest {
  id: string;
  user_id: string;
  device_type: string | null;
  estimated_weight: number | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: PickupStatus;
  assigned_scraper_id: string | null;
  pickup_fee: number | null;
  distance_km: number | null;
  lot_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScrapLot {
  id: string;
  scraper_id: string;
  category: string;
  weight_kg: number;
  base_price: number;
  description: string | null;
  status: 'available' | 'negotiating' | 'sold' | 'paid' | 'scheduled' | 'live' | 'open_for_bids' | 'completed';
  scheduled_start_time: string | null;
  auction_end_time: string | null;
  winner_recycler_id: string | null;
  winning_bid_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  lot_id: string;
  recycler_id: string;
  amount: number;
  created_at: string;
}

export interface Message {
  id: string;
  lot_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

export interface Negotiation {
  id: string;
  lot_id: string;
  scraper_id: string;
  recycler_id: string;
  status: 'active' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Inventory {
  id: string;
  recycler_id: string;
  material_type: MaterialType;
  quantity_kg: number;
  purchase_price: number | null;
  sale_price: number | null;
  updated_at: string;
}

export interface Transaction {
  id: string;
  pickup_request_id: string | null;
  user_id: string | null;
  scraper_id: string | null;
  amount: number;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: any; Update: any };
      scrapers: { Row: Scraper; Insert: any; Update: any };
      recyclers: { Row: Recycler; Insert: any; Update: any };
      pickup_requests: { Row: PickupRequest; Insert: any; Update: any };
      scrap_lots: { Row: ScrapLot; Insert: any; Update: any };
      messages: { Row: Message; Insert: any; Update: any };
      negotiations: { Row: Negotiation; Insert: any; Update: any };
      bids: { Row: Bid; Insert: any; Update: any };
      inventory: { Row: Inventory; Insert: any; Update: any };
      transactions: { Row: Transaction; Insert: any; Update: any };
    };
    Functions: {
      calculate_pickup_fee: { Args: { distance_km: number }; Returns: number };
      haversine_distance: { Args: { lat1: number; lon1: number; lat2: number; lon2: number }; Returns: number };
    };
  };
}
