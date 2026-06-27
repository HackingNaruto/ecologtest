import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Truck,
  DollarSign,
  MapPin,
  CheckCircle,
  Star,
  Clock,
  PackageCheck,
  Phone, 
  X,     
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRealtime } from '../hooks/useRealtime';
import {
  getAssignedPickups,
  getScraperByUserId,
  updatePickupStatus,
  updateScraperLocation,
  getScraperLots
} from '../services/supabaseApi';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { CreateLotModal } from '../components/ui/CreateLotModal';

type PickupRequest = Database['public']['Tables']['pickup_requests']['Row'] & {
  phone?: string | null;
};
type Recycler = { id: string; company_name: string | null };

export default function DealerDashboard() {
  const { user } = useAuth();
  const { requestLocation } = useGeolocation();
  const navigate = useNavigate();

  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [scraperProfile, setScraperProfile] = useState<any>(null);
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [scraperLots, setScraperLots] = useState<any[]>([]);
  const [isCreateLotOpen, setIsCreateLotOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState('');
  const [delivering, setDelivering] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pickupsData, scraperData, recyclerData] = await Promise.all([
        getAssignedPickups(user.id),
        getScraperByUserId(user.id),
        supabase
          .from('recyclers')
          .select('id, company_name')
          .eq('verification_status', 'approved'),
      ]);
      setPickups(pickupsData);
      setScraperProfile(scraperData);
      setRecyclers((recyclerData.data as Recycler[]) || []);
      
      if (user.id) {
        const lots = await getScraperLots(user.id);
        setScraperLots(lots);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (!user || !scraperProfile?.id) return;
    requestLocation().then((loc) => {
      if (loc) {
        updateScraperLocation(scraperProfile.id, loc.latitude, loc.longitude).catch(
          console.error
        );
      }
    });
  }, [scraperProfile?.id]);

  useRealtime('pickup_requests', loadData);

  const handleStatusUpdate = async (
    pickupId: string,
    status: PickupRequest['status']
  ) => {
    try {
      await updatePickupStatus(pickupId, status);
      if (status === 'on_the_way' && scraperProfile?.id) {
        const loc = await requestLocation();
        if (loc) {
          await updateScraperLocation(scraperProfile.id, loc.latitude, loc.longitude);
        }
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptJob = async (pickupId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('pickup_requests')
        .update({ status: 'assigned', scraper_id: user.id })
        .eq('id', pickupId);
      if (error) throw error;
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const openDeliverModal = (pickupId: string) => {
    setDeliveringId(pickupId);
    setSelectedRecyclerId(recyclers[0]?.id || '');
  };

  const handleDeliverToRecycler = async () => {
    if (!deliveringId || !selectedRecyclerId) return;
    setDelivering(true);
    try {
      const { error } = await supabase
        .from('pickup_requests')
        .update({
          status: 'delivered_to_recycler',
          recycler_id: selectedRecyclerId,
        })
        .eq('id', deliveringId);
      if (error) throw error;
      setDeliveringId(null);
      setSelectedRecyclerId('');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDelivering(false);
    }
  };

  const activeJobs = pickups.filter((p) =>
    ['requested', 'assigned', 'on_the_way', 'picked_up'].includes(p.status)
  );
  const deliveredJobs = pickups.filter((p) =>
    ['delivered_to_recycler', 'completed'].includes(p.status)
  );
  const totalEarnings = pickups.reduce((sum, p) => sum + (p.pickup_fee || 0), 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Scraper Dashboard"
        subtitle="Manage your pickup jobs and earnings"
        icon={LayoutDashboard}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Jobs" value={activeJobs.length} icon={Truck} />
        <StatCard title="Delivered" value={deliveredJobs.length} icon={CheckCircle} />
        <StatCard title="Total Earnings" value={`₹${totalEarnings}`} icon={DollarSign} />
        <StatCard title="Active Auctions" value={scraperLots.filter(l => l.status === 'open_for_bids').length} icon={PackageCheck} />
      </div>

      <CreateLotModal 
        isOpen={isCreateLotOpen} 
        onClose={() => setIsCreateLotOpen(false)} 
        onSuccess={loadData} 
      />

      {/* Deliver to recycler modal */}
      {deliveringId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <PackageCheck className="text-primary" size={20} />
              <h3 className="text-base font-semibold">Deliver to Recycler</h3>
            </div>

            <p className="text-sm text-foreground-muted mb-4">
              Select the recycling facility you are delivering this pickup to.
            </p>

            {recyclers.length === 0 ? (
              <p className="text-sm text-red-400 mb-4">
                No approved recyclers available. Contact admin.
              </p>
            ) : (
              <select
                value={selectedRecyclerId}
                onChange={(e) => setSelectedRecyclerId(e.target.value)}
                className="input-field mb-4"
              >
                {recyclers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.company_name || r.id}
                  </option>
                ))}
              </select>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setDeliveringId(null)}
                className="btn-secondary flex-1"
                disabled={delivering}
              >
                Cancel
              </button>
              <button
                onClick={handleDeliverToRecycler}
                disabled={delivering || !selectedRecyclerId}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {delivering ? (
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  'Confirm Delivery'
                )}
              </button>
            </div>
          </div>
        </div>
      )}



      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="section-title">My Scrap Lots (Auctions)</h2>
            <button 
              onClick={() => setIsCreateLotOpen(true)}
              className="btn-primary text-sm py-1.5"
            >
              + Create Lot
            </button>
          </div>

          {scraperLots.length === 0 ? (
            <GlassCard>
              <p className="text-center text-foreground-muted py-8">
                You haven't created any auction lots yet.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {scraperLots.map((lot, i) => {
                const startTime = new Date(lot.scheduled_start_time).getTime();
                const now = Date.now();
                const isStarted = now >= startTime;
                
                return (
                  <motion.div
                    key={lot.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 glass-card-hover"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium capitalize">
                            {lot.category.replace(/_/g, ' ')}
                          </p>
                          <StatusBadge status={lot.status} />
                        </div>
                        <p className="text-xs text-foreground-muted mt-1">
                          {lot.weight_kg} kg • Base: ₹{lot.base_price}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        {lot.status === 'completed' ? (
                          <p className="text-sm font-semibold text-primary">
                            Sold for: ₹{lot.winning_bid_amount || 0}
                          </p>
                        ) : (
                          <p className="text-sm font-medium">
                            Starts at: {new Date(lot.scheduled_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        
                        {(lot.status === 'scheduled' || lot.status === 'live' || lot.status === 'open_for_bids') && (
                          <button
                            onClick={() => navigate(`/auction/${lot.id}`)}
                            className="btn-primary text-xs py-1 px-4"
                          >
                            Enter Live Room
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="section-title">Drop-off Jobs</h2>

          {activeJobs.length === 0 ? (
            <GlassCard>
              <p className="text-center text-foreground-muted py-8">
                No active jobs assigned to you right now.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {activeJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 glass-card-hover"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium capitalize">
                          {job.device_type || 'Device'}
                        </p>
                        <StatusBadge status={job.status} />
                      </div>
                      
                      {job.photo_url && (
                        <img 
                          src={job.photo_url} 
                          alt="Device" 
                          className="mt-3 w-20 h-20 object-cover rounded-md border border-border" 
                        />
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-foreground-muted">
                        <Clock size={12} />
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        ₹{job.pickup_fee || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                    {job.status === 'requested' && (
                      <button
                        onClick={() => handleAcceptJob(job.id)}
                        className="btn-primary text-sm py-1.5 flex-1"
                      >
                        Accept Request
                      </button>
                    )}
                    {job.status === 'assigned' && (
                      <button
                        onClick={() => handleStatusUpdate(job.id, 'picked_up')}
                        className="btn-primary text-sm py-1.5 flex-1"
                      >
                        Mark as Received
                      </button>
                    )}
                    {job.status === 'picked_up' && (
                      <button
                        onClick={() => openDeliverModal(job.id)}
                        className="btn-secondary text-sm py-1.5 flex-1"
                      >
                        Deliver to Recycler
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="section-title">Delivered</h2>
          <GlassCard>
            {deliveredJobs.length === 0 ? (
              <p className="text-center text-foreground-muted py-4">
                No deliveries yet.
              </p>
            ) : (
              deliveredJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm capitalize">{job.device_type}</p>
                    <StatusBadge status={job.status} />
                  </div>
                  <span className="text-primary text-sm font-medium">
                    ₹{job.pickup_fee || 0}
                  </span>
                </div>
              ))
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}