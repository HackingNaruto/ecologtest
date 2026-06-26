import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  Truck,
  Factory,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';

import {
  getAdminStats,
  getAllProfiles,
  getPendingScrapers,
  getPendingRecyclers,
  getAllPickups,
  updateScraperStatus,
  updateRecyclerStatus,
  getMyTransactions,
} from '../services/supabaseApi';

import { useRealtime } from '../hooks/useRealtime';

import type { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Scraper = Database['public']['Tables']['scrapers']['Row'];
type Recycler = Database['public']['Tables']['recyclers']['Row'];
type PickupRequest = Database['public']['Tables']['pickup_requests']['Row'];

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScrapers: 0,
    totalRecyclers: 0,
    totalPickups: 0,
    totalTransactions: 0,
  });

  const [users, setUsers] = useState<Profile[]>([]);
  const [pendingScrapers, setPendingScrapers] = useState<any[]>([]);
  const [pendingRecyclers, setPendingRecyclers] = useState<any[]>([]);
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] =
    useState<'overview' | 'scrapers' | 'recyclers' | 'pickups' | 'transactions'>('overview');

  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);

    const [s, u, ps, pr, p, t] = await Promise.all([
      getAdminStats(),
      getAllProfiles(),
      getPendingScrapers(),
      getPendingRecyclers(),
      getAllPickups(),
      getMyTransactions(),
    ]);

    setStats({
      totalUsers: u?.length || 0,
      totalScrapers: s?.totalScrapers || 0,
      totalRecyclers: s?.totalRecyclers || 0,
      totalPickups: s?.totalPickups || 0,
      totalTransactions: s?.totalTransactions || 0,
    });

    setUsers(u || []);
    setPendingScrapers(ps || []);
    setPendingRecyclers(pr || []);
    setPickups(p || []);
    setTransactions(t || []);

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useRealtime('scrapers', loadAll);
  useRealtime('recyclers', loadAll);
  useRealtime('pickup_requests', loadAll);

  const handleApproveScraper = async (id: string) => {
    await updateScraperStatus(id, 'approved');
    loadAll();
  };

  const handleRejectScraper = async (id: string) => {
    await updateScraperStatus(id, 'rejected');
    loadAll();
  };

  const handleApproveRecycler = async (id: string) => {
    await updateRecyclerStatus(id, 'approved');
    loadAll();
  };

  const handleRejectRecycler = async (id: string) => {
    await updateRecyclerStatus(id, 'rejected');
    loadAll();
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
        title="Admin Panel"
        subtitle="Platform management and oversight"
        icon={ShieldCheck}
      />

      {/* STATS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard title="Scrapers" value={stats.totalScrapers} icon={Truck} />
        <StatCard title="Recyclers" value={stats.totalRecyclers} icon={Factory} />
        <StatCard title="Pickups" value={stats.totalPickups} icon={Package} />
        <StatCard title="Transactions" value={stats.totalTransactions} icon={DollarSign} />
      </div>

      {/* OVERVIEW ONLY (SAFE VERSION) */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-sm font-medium mb-3">Recent Users</h3>
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex justify-between py-2">
                <span>{u.full_name || 'User'}</span>
                <StatusBadge status={u.role} />
              </div>
            ))}
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-medium mb-3">Pending Approvals</h3>

            {pendingScrapers.length === 0 && pendingRecyclers.length === 0 && (
              <p className="text-sm text-gray-400">No pending approvals</p>
            )}
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}