import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { PageHeader } from "../components/ui/PageHeader";
import { toast } from "react-hot-toast";

export default function ScraperDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const lastJobIdRef = useRef<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("pickup_requests")
      .select("id, device_type, model_name, photo_url, status, created_at, scraper_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
      setJobs([]);
    } else {
      const newJobs = data || [];

      const latestOldId = lastJobIdRef.current;
      const latestNewId = newJobs?.[0]?.id;

      if (latestNewId && latestNewId !== latestOldId) {
        toast.success("🚚 New pickup request available!");
      }

      lastJobIdRef.current = latestNewId || null;
      setJobs(newJobs);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();

    const interval = setInterval(fetchJobs, 10000);

    const channel = supabase
      .channel("pickup_requests_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pickup_requests",
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatus = (job: any) =>
    (job?.status ?? "").toString().toLowerCase().trim();

  // ✅ FIXED ACCEPT JOB (moved inside function properly)
  const acceptJob = async (id: string) => {
    if (!user?.id) return;

    // get scraper address
    const { data: scraperData, error: scraperError } = await supabase
      .from("scrapers")
      .select("address")
      .eq("user_id", user.id)
      .single();

    if (scraperError) {
      console.error("Scraper fetch error:", scraperError.message);
      return;
    }

    const { error } = await supabase
      .from("pickup_requests")
      .update({
        status: "assigned",
        scraper_id: user.id,
        scraper_address: scraperData?.address || null,
      })
      .eq("id", id);

    if (error) {
      console.error("Accept error:", error.message);
      return;
    }

    fetchJobs();
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
        subtitle="View and action incoming e-waste collections"
      />

      <GlassCard className="p-6 space-y-4">
        {loading && (
          <p className="text-foreground-muted">Loading jobs...</p>
        )}

        {!loading && jobs.length === 0 && (
          <p className="text-foreground-muted text-center py-8">
            No jobs available
          </p>
        )}

        {!loading &&
          jobs.map((job) => {
            const status = getStatus(job);
            const isMine = job?.scraper_id === user?.id;

            return (
              <div
                key={job.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-surface-elevated/40 border border-border"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {job.device_type || "Unknown Device"}
                  </p>

                  {job.model_name && (
                    <p className="text-sm text-primary">
                      {job.model_name}
                    </p>
                  )}
                  
                  {job.photo_url && (
                    <img 
                      src={job.photo_url} 
                      alt="Device preview" 
                      className="mt-2 w-20 h-20 object-cover rounded-md border border-border" 
                    />
                  )}
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">

                  {/* VIEW BUTTON */}
                  <button
                    onClick={() =>
                      (window.location.href = `/scraper-request/${job.id}`)
                    }
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    View
                  </button>

                  <span
                    className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                      statusStyle[status] ??
                      "bg-white/5 text-foreground-muted"
                    }`}
                  >
                    {status.replace(/_/g, " ")}
                  </span>

                  {status === "requested" && (
                    <button
                      onClick={() => acceptJob(job.id)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      Accept Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </GlassCard>
    </DashboardLayout>
  );
}