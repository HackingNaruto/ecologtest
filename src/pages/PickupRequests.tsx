import { useEffect, useState } from "react";
import { createPickupRequest, getMyPickups } from "../services/supabaseApi";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { PageHeader } from "../components/ui/PageHeader";

export function PickupRequests() {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);

  const [form, setForm] = useState({
    device_type: "",
    model_name: "",
    pickup_date: "",
    address: "",
    phone: "",
    description: "",
  });

  const loadPickups = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getMyPickups(user.id);
    setPickups(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPickups();

    const channel = supabase
      .channel("my_pickup_requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pickup_requests",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          loadPickups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!photo) {
      alert("Please upload a device photo");
      return;
    }

    try {
      let publicPhotoUrl = null;
      let publicVideoUrl = null;
      
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('request-photos')
          .upload(filePath, photo);
          
        if (uploadError) {
          console.error("Photo upload error:", uploadError);
          alert("Image upload failed: " + uploadError.message);
          return;
        }
        
        const { data: urlData } = supabase.storage
          .from('request-photos')
          .getPublicUrl(filePath);
          
        publicPhotoUrl = urlData.publicUrl;
      }

      if (video) {
        const fileExt = video.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('request-videos')
          .upload(filePath, video);
          
        if (uploadError) {
          console.error("Video upload error:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('request-videos')
            .getPublicUrl(filePath);
          publicVideoUrl = urlData.publicUrl;
        }
      }

      await createPickupRequest({
        user_id: user.id,

        device_type: form.device_type,
        model_name: form.model_name,
        pickup_date: form.pickup_date || null,
        address: form.address,
        phone: form.phone,
        description: form.description,

        status: "requested",

        created_at: new Date().toISOString(),

        photo_url: publicPhotoUrl,
        video_url: publicVideoUrl,
      });

      setOpen(false);

      setForm({
        device_type: "",
        model_name: "",
        pickup_date: "",
        address: "",
        phone: "",
        description: "",
      });

      setPhoto(null);
      setVideo(null);

      loadPickups();
    } catch (error: any) {
      console.error("CREATE PICKUP FAILED:", error.message);
    }
  };

  const statusStyle: Record<string, string> = {
    requested: "bg-yellow-500/10 text-yellow-400",
    assigned: "bg-blue-500/10 text-blue-400",
    on_the_way: "bg-indigo-500/10 text-indigo-400",
    picked_up: "bg-teal-500/10 text-teal-400",
    delivered_to_recycler: "bg-green-500/10 text-green-400",
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Pickup Requests"
        subtitle="Schedule and track your device collections"
      />

      <div className="flex justify-between mb-6">
        <button onClick={() => setOpen(true)} className="btn-primary">
          + New Request
        </button>
      </div>

      <GlassCard className="p-6 space-y-4">
        {loading ? (
          <p className="text-foreground-muted">Loading...</p>
        ) : (
          pickups.map((p) => {
            const status = (p.status ?? "").toLowerCase().trim();

            return (
              <div key={p.id} className="p-4 border border-border rounded-lg bg-surface-elevated/40">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{p.device_type}</p>
                    <p className="text-sm text-primary">{p.model_name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${statusStyle[status] || "bg-white/5 text-foreground-muted"}`}>
                    {status === 'assigned' ? 'Waiting for Drop-off' : status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-sm text-foreground-muted mb-4">
                  <p>Pickup Date: {p.pickup_date || 'Not specified'}</p>
                </div>

                {status === "assigned" && p.scraper_id && (
                  <AssignedScraperDetails scraperId={p.scraper_id} />
                )}
              </div>
            );
          })
        )}
      </GlassCard>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="glass-card p-6 w-full max-w-xl space-y-3">

            <input
              name="device_type"
              placeholder="Device Type"
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="model_name"
              placeholder="Model Name"
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="address"
              placeholder="Address"
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="phone"
              placeholder="Phone"
              onChange={handleChange}
              className="input-field"
            />

            <input
              type="date"
              name="pickup_date"
              onChange={handleChange}
              className="input-field"
            />

            <textarea
              name="description"
              placeholder="Description"
              onChange={handleChange}
              className="input-field"
            />

            <div>
              <label className="text-sm font-medium text-foreground-muted mb-1 block">Device Photo (Required)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground-muted mb-1 block">Device Video (Optional)</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            <button onClick={handleSubmit} className="btn-primary w-full">
              Submit
            </button>

            <button
              onClick={() => setOpen(false)}
              className="btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function AssignedScraperDetails({ scraperId }: { scraperId: string }) {
  const [scraperProfile, setScraperProfile] = useState<any>(null);
  const [scraperInfo, setScraperInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchDetails() {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", scraperId)
        .single();
        
      const { data: info } = await supabase
        .from("scrapers")
        .select("address, shop_name")
        .eq("user_id", scraperId)
        .single();

      setScraperProfile(profile);
      setScraperInfo(info);
    }
    
    fetchDetails();
  }, [scraperId]);

  if (!scraperProfile) return <p className="text-sm text-yellow-500 mt-2">Loading drop-off location...</p>;

  return (
    <div className="mt-4 p-4 bg-surface rounded-md border border-primary/20">
      <h4 className="font-semibold text-primary mb-2">Drop-off Location Details</h4>
      <p className="text-sm text-foreground"><strong>Shop/Scrapper Name:</strong> {scraperInfo?.shop_name || scraperProfile.full_name || "Authorized Scrapper"}</p>
      <p className="text-sm text-foreground mb-3"><strong>Address:</strong> {scraperInfo?.address || "Address not provided by scrapper"}</p>
      
      {scraperProfile.phone && (
        <a 
          href={`tel:${scraperProfile.phone}`}
          className="inline-flex items-center gap-2 btn-primary py-1.5 px-3 text-sm"
        >
          📞 Contact Scrapper
        </a>
      )}
    </div>
  );
}