import { supabase } from "../lib/supabase";

export async function createNotification({
  user_id,
  title,
  message,
  type = "info",
}: any) {
  return await supabase.from("notifications").insert([
    { user_id, title, message, type },
  ]);
}