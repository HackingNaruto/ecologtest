import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { GlassCard } from "../components/ui/GlassCard";

export function PickupDetails() {
  const { id } = useParams();
  const [pickup, setPickup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("pickup_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setPickup(null);
      } else {
        setPickup(data);
      }

      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  if (!pickup) {
    return (
      <DashboardLayout>
        <p>Pickup not found</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <GlassCard className="p-6 space-y-4">
        <h2 className="text-xl font-bold">{pickup.device_type}</h2>

        <p><b>Model:</b> {pickup.model_name}</p>
        <p><b>Address:</b> {pickup.address}</p>
        <p><b>Phone:</b> {pickup.phone}</p>
        <p><b>Description:</b> {pickup.description}</p>
        <p><b>Status:</b> {pickup.status}</p>

        {pickup.photo_url && (
          <img
            src={pickup.photo_url}
            alt="device"
            className="rounded-lg w-full"
          />
        )}

        {pickup.video_url && (
          <video controls className="w-full rounded-lg">
            <source src={pickup.video_url} />
          </video>
        )}
      </GlassCard>
    </DashboardLayout>
  );
}