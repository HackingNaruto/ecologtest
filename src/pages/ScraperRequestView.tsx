import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { updatePickupStatus } from "../services/supabaseApi";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuth } from "../contexts/AuthContext";

export function ScraperRequestView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("pickup_requests")
      .select("id, device_type, model_name, photo_url, status, created_at, scraper_id")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setRequest(data);
    setLoading(false);
  };

  const acceptRequest = async () => {
    if (!user) return;
    
    await updatePickupStatus(request.id, "assigned");
    await supabase
      .from("pickup_requests")
      .update({
        scraper_id: user.id,
      })
      .eq("id", request.id);

    navigate("/scraper-dashboard");
  };

  const rejectRequest = async () => {
    await updatePickupStatus(request.id, "rejected");
    navigate("/scraper-dashboard");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-foreground-muted">Loading request...</p>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout>
        <p className="text-red-400">Request not found</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <GlassCard className="p-6 space-y-5">
        <h2 className="text-xl font-semibold text-foreground">
          Pickup Request Details
        </h2>

        <div className="space-y-2">
          <p><b>Device:</b> {request.device_type}</p>
          <p><b>Model:</b> {request.model_name}</p>
        </div>

        {/* PHOTO */}
        {request.photo_url && (
          <div>
            <p className="font-medium mb-2">Device Photo</p>
            <img
              src={request.photo_url}
              alt="device"
              className="rounded-lg max-h-80 object-cover border border-border"
            />
          </div>
        )}

        {/* VIDEO */}
        {request.video_url && (
          <div>
            <p className="font-medium mb-2">Device Video</p>
            <video controls className="rounded-lg w-full border border-border">
              <source src={request.video_url} />
            </video>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={acceptRequest}
            className="btn-primary w-full"
          >
            Accept Request
          </button>

          <button
            onClick={rejectRequest}
            className="btn-secondary w-full"
          >
            Reject
          </button>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}