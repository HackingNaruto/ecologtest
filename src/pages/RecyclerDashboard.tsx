import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Recycle, Scale, CheckCircle, Package, ShoppingBag } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../hooks/useRealtime';
import { getInventory, getRecyclerByUserId, getRecyclerPickups, getAvailableLots, startNegotiation } from '../services/supabaseApi';

type Inventory = any;
type PickupRequest = any;

export function RecyclerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [recycler, setRecycler] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [recyclerData, pickupsData] = await Promise.all([
        getRecyclerByUserId(user.id),
        getRecyclerPickups(user.id),
      ]);

      setRecycler(recyclerData);
      setPickups(pickupsData);

      if (recyclerData?.id) {
        const inv = await getInventory(recyclerData.id);
        setInventory(inv || []);

        const availableLots = await getAvailableLots();
        setMarketplaceItems(availableLots || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);
  useRealtime('inventory', loadData);
  useRealtime('pickup_requests', loadData);

  const receivedPickups = pickups.filter((p: any) => p.status === 'delivered_to_recycler');
  const processedPickups = pickups.filter((p: any) => p.status === 'completed');
  const totalWeight = inventory.reduce((sum: number, i: any) => sum + (i.quantity_kg || 0), 0);

  const processItem = async (id: string) => {
    await supabase.from('pickup_requests').update({ status: 'completed' }).eq('id', id);
    loadData();
  };

  const handleExpressInterest = async (lotId: string, scraperId: string) => {
    if (!user) return;
    try {
      await startNegotiation(lotId, scraperId, user.id);
      navigate(`/negotiation/${lotId}`);
    } catch (err) {
      console.error(err);
      // If it's just a duplicate key error because they already expressed interest, we can just navigate
      navigate(`/negotiation/${lotId}`);
    }
  };

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
        title="Recycler Dashboard"
        subtitle="Manage processing queues, available streams and material metrics"
        icon={LayoutDashboard}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Incoming Material" value={receivedPickups.length} icon={Package} />
        <StatCard title="Processing Queue" value={processedPickups.length} icon={CheckCircle} />
        <StatCard title="Material Recovered (Kg)" value={`${totalWeight.toFixed(1)} kg`} icon={Scale} />
        <StatCard title="Material Recovery Rate" value="98.5%" icon={Recycle} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="section-title mb-3">Incoming Deliveries Queue</h2>
            {receivedPickups.length === 0 ? (
              <GlassCard>
                <p className="text-center text-foreground-muted py-4">
                  No active refinery streams awaiting processing.
                </p>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {receivedPickups.map((p: any) => (
                  <GlassCard key={p.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {p.device_type || 'Aggregated Lot'}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {p.estimated_weight || 0} kg · {p.address}
                      </p>
                    </div>
                    <button
                      onClick={() => processItem(p.id)}
                      className="btn-primary text-xs py-1 px-3"
                    >
                      Process Batch
                    </button>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="section-title mb-3">B2B Material Marketplace Streams</h2>
            {marketplaceItems.length === 0 ? (
              <GlassCard>
                <p className="text-center text-foreground-muted py-4">
                  No aggregated shop lots currently bidding.
                </p>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {marketplaceItems.map((m: any) => (
                  <GlassCard key={m.id} className="p-4 flex justify-between items-center border border-primary/20">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-primary capitalize">
                          {m.category.replace(/_/g, ' ')}
                        </p>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="text-xs text-foreground-muted mt-1">
                        {m.weight_kg} kg · Base: ₹{m.base_price}
                      </p>
                      {m.description && (
                        <p className="text-xs text-foreground mt-1 max-w-sm truncate">
                          "{m.description}"
                        </p>
                      )}
                      <p className="text-xs text-foreground-subtle mt-1">
                        By: {m.profiles?.full_name || 'Verified Scraper'}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleExpressInterest(m.id, m.scraper_id)}
                        className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1"
                      >
                        <ShoppingBag size={14} />
                        Express Interest
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="section-title">Facility Purchase History</h2>

          <GlassCard>
            <p className="text-sm font-medium">
              {recycler?.company_name || 'Processing Facility'}
            </p>
            <p className="text-xs text-foreground-subtle">
              CPCB ID: {recycler?.cpcb_registration_number || 'Verification Active'}
            </p>
          </GlassCard>

          <GlassCard title="Active Materials Store">
            {inventory.map((item: any) => (
              <div key={item.id} className="flex justify-between text-xs py-1.5 border-b border-border/40 last:border-0">
                <span className="capitalize">
                  {item.material_type.replace(/_/g, ' ')}
                </span>
                <span>
                  {item.quantity_kg}kg · ₹{item.purchase_price}/kg
                </span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RecyclerDashboard;