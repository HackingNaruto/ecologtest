import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { PageHeader } from "../components/ui/PageHeader";
import { toast } from "react-hot-toast";
import { Eye, CheckCircle, AlertTriangle } from "lucide-react";

export default function ScraperDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [pendingAcceptId, setPendingAcceptId] = useState<string | null>(null);

  const lastJobIdRef = useRef<string | null>(null);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("pickup_requests")
      .select("id, device_type, model_name, photo_url, status, created_at, scraper_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
      setJobs([]);
    } else {
      const newJobs = data || [];
      const latestNewId = newJobs?.[0]?.id;
      if (latestNewId && latestNewId !== lastJobIdRef.current) {
        if (lastJobIdRef.current !== null) {
          toast.success("🚚 New pickup request available!");
        }
        lastJobIdRef.current = latestNewId;
      }
      setJobs(newJobs);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    const channel = supabase
      .channel("pickup_requests_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "pickup_requests" }, fetchJobs)
      .subscribe();
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAcceptClick = (jobId: string) => {
    setPendingAcceptId(jobId);
    setShowDisclaimer(true);
  };

  const confirmAccept = async () => {
    if (!user?.id || !pendingAcceptId) return;
    setAcceptingId(pendingAcceptId);
    setShowDisclaimer(false);

    const { error } = await supabase
      .from("pickup_requests")
      .update({
        status: "assigned",
        scraper_id: user.id,
      })
      .eq("id", pendingAcceptId);

    if (error) {
      console.error("Accept error:", error.message);
      toast.error("Failed to accept: " + error.message);
    } else {
      toast.success("✅ Request accepted successfully!");
      fetchJobs();
    }

    setAcceptingId(null);
    setPendingAcceptId(null);
  };

  const statusStyle: Record<string, string> = {
    requested: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    assigned: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    on_the_way: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
    picked_up: "bg-teal-500/10 text-teal-400 border border-teal-500/30",
    delivered_to_recycler: "bg-green-500/10 text-green-400 border border-green-500/30",
    completed: "bg-green-600/10 text-green-500 border border-green-600/30",
    rejected: "bg-red-500/10 text-red-400 border border-red-500/30",
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Pickup Requests"
        subtitle="View and action incoming e-waste collections"
      />

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-yellow-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Acceptance Disclaimer</h3>
            </div>
            <p className="text-sm text-foreground-muted leading-relaxed">
              By accepting this request, you are committing to <strong>inspect and purchase</strong> this item when the user drops it off at your location. You agree to pay the user a fair negotiated price upon receipt.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowDisclaimer(false); setPendingAcceptId(null); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmAccept}
                className="btn-primary flex-1"
              >
                I Agree & Accept
              </button>
            </div>
          </div>
        </div>
      )}

      <GlassCard className="p-6 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <p className="text-foreground-muted text-center py-8">
            No pickup requests available yet.
          </p>
        )}

        {!loading &&
          jobs.map((job) => {
            const status = (job?.status ?? "").toString().toLowerCase().trim();
            const isRequested = status === "requested";
            const isBeingAccepted = acceptingId === job.id;

            return (
              <div
                key={job.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface-elevated/40 border border-border hover:border-primary/30 transition-colors"
              >
                {/* Left: Device info */}
                <div className="flex items-center gap-4">
                  {job.photo_url ? (
                    <img
                      src={job.photo_url}
                      alt="Device"
                      className="w-16 h-16 object-cover rounded-lg border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-foreground-muted text-xs shrink-0">
                      No Img
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {job.device_type || "Unknown Device"}
                    </p>
                    {job.model_name && (
                      <p className="text-sm text-primary">{job.model_name}</p>
                    )}
                    <p className="text-xs text-foreground-muted mt-1">
                      {new Date(job.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${statusStyle[status] ?? "bg-white/5 text-foreground-muted"}`}>
                    {status.replace(/_/g, " ")}
                  </span>

                  <button
                    onClick={() => navigate(`/scraper-request/${job.id}`)}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <Eye size={13} /> View
                  </button>

                  {isRequested && (
                    <button
                      onClick={() => handleAcceptClick(job.id)}
                      disabled={isBeingAccepted}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
                    >
                      {isBeingAccepted ? (
                        <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={13} />
                      )}
                      {isBeingAccepted ? "Accepting..." : "Accept"}
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