import { supabase } from "../lib/supabase";

// ================= AUTH HELPERS =================

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

// ================= SCRAPER =================

export const getScraperByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("scrapers")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data;
};

export const updateScraperLocation = async (
  scraperId: string,
  lat: number,
  lng: number
) => {
  const { error } = await supabase
    .from("scrapers")
    .update({ latitude: lat, longitude: lng })
    .eq("id", scraperId);

  if (error) throw error;
};

export const updateScraperStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from("scrapers")
    .update({ verification_status: status })
    .eq("id", id);

  if (error) throw error;
};

// ================= RECYCLER =================

export const registerRecycler = async (payload: any) => {
  const { data, error } = await supabase
    .from("recyclers")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateRecyclerStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from("recyclers")
    .update({ verification_status: status })
    .eq("id", id);

  if (error) throw error;
};

// ================= PICKUPS =================

export const createPickupRequest = async (payload: any) => {
  const { data, error } = await supabase
    .from("pickup_requests")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAssignedPickups = async (userId: string) => {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*")
    .eq("scraper_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
};

export const updatePickupStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from("pickup_requests")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
};

// ================= BULK =================

export const createBulkPickup = async (
  userId: string,
  totalValue: number,
  items: any[]
) => {
  const { data, error } = await supabase
    .from("bulk_pickups")
    .insert({
      scraper_id: userId,
      total_value: totalValue,
      status: "created",
    })
    .select()
    .single();

  if (error) throw error;

  if (items?.length) {
    const mapped = items.map((i) => ({
      bulk_pickup_id: data.id,
      device_type: i.device_type,
      brand_and_model: i.brand_and_model,
      condition: i.condition,
      quantity: i.quantity,
      estimated_value_per_unit: i.estimated_value_per_unit,
    }));

    await supabase.from("pickup_items").insert(mapped);
  }

  return data;
};

// ================= ADMIN =================

export const getAdminStats = async () => {
  const [scrapers, recyclers, pickups, transactions] = await Promise.all([
    supabase.from("scrapers").select("*", { count: "exact" }),
    supabase.from("recyclers").select("*", { count: "exact" }),
    supabase.from("pickup_requests").select("*", { count: "exact" }),
    supabase.from("transactions").select("*", { count: "exact" }),
  ]);

  return {
    totalScrapers: scrapers.count || 0,
    totalRecyclers: recyclers.count || 0,
    totalPickups: pickups.count || 0,
    totalTransactions: transactions.count || 0,
  };
};

export const getAllProfiles = async () => {
  const { data } = await supabase.from("profiles").select("*");
  return data || [];
};

export const getPendingScrapers = async () => {
  const { data } = await supabase
    .from("scrapers")
    .select("*")
    .eq("verification_status", "pending");

  return data || [];
};

export const getPendingRecyclers = async () => {
  const { data } = await supabase
    .from("recyclers")
    .select("*")
    .eq("verification_status", "pending");

  return data || [];
};

export const getAllPickups = async () => {
  const { data } = await supabase.from("pickup_requests").select("*");
  return data || [];
};

export const getMyTransactions = async () => {
  const { data } = await supabase.from("transactions").select("*");
  return data || [];
};

export const getMyPickups = async (userId: string) => {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
};

// ================= RECYCLER HELPERS =================

export const getRecyclerByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("recyclers")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data;
};

export const getRecyclerPickups = async (recyclerId: string) => {
  const { data, error } = await supabase
    .from("pickup_requests")
    .select("*")
    .eq("recycler_id", recyclerId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
};

// ================= SCRAPER HELPERS =================

export const registerScraper = async (payload: any) => {
  const { data, error } = await supabase
    .from("scrapers")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getInventory = async (recyclerId?: string) => {
  const query = supabase.from("pickup_items").select("*");

  if (recyclerId) {
    query.eq("recycler_id", recyclerId);
  }

  const { data, error } = await query;

  if (error) return [];
  return data || [];
};

// ================= AUCTION SYSTEM (ECOLOG V2) =================

export const createScrapLot = async (
  scraperId: string,
  category: string,
  weightKg: number,
  basePrice: number,
  description: string
) => {
  const { data, error } = await supabase
    .from("scrap_lots")
    .insert({
      scraper_id: scraperId,
      category,
      weight_kg: weightKg,
      base_price: basePrice,
      description,
      status: "available"
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAvailableLots = async () => {
  const { data, error } = await supabase
    .from("scrap_lots")
    .select("*, profiles!scrap_lots_scraper_id_fkey(full_name)")
    .in("status", ["available", "negotiating"])
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
};

export const getLotById = async (lotId: string) => {
  const { data, error } = await supabase
    .from("scrap_lots")
    .select("*, profiles!scrap_lots_scraper_id_fkey(full_name)")
    .eq("id", lotId)
    .single();

  if (error) throw error;
  return data;
};

export const updateLotStatus = async (lotId: string, status: string, endTime?: string) => {
  const updatePayload: any = { status };
  if (endTime) {
    updatePayload.auction_end_time = endTime;
  }
  
  const { data, error } = await supabase
    .from("scrap_lots")
    .update(updatePayload)
    .eq("id", lotId);

  if (error) throw error;
  return data;
};
export const getScraperLots = async (scraperId: string) => {
  const { data, error } = await supabase
    .from("scrap_lots")
    .select("*")
    .eq("scraper_id", scraperId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
};



export const sendMessage = async (
  lotId: string,
  senderId: string,
  receiverId: string,
  message: string
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      lot_id: lotId,
      sender_id: senderId,
      receiver_id: receiverId,
      message
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMessagesForLot = async (lotId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("lot_id", lotId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data || [];
};

export const startNegotiation = async (
  lotId: string,
  scraperId: string,
  recyclerId: string
) => {
  await updateLotStatus(lotId, "negotiating");
  
  const { data, error } = await supabase
    .from("negotiations")
    .insert({
      lot_id: lotId,
      scraper_id: scraperId,
      recycler_id: recyclerId,
      status: "active"
    })
    .select()
    .single();
    
  return data;
};