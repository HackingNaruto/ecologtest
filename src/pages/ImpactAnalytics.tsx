import { useEffect, useState } from 'react';
import {
  BarChart3,
  Leaf,
  Droplets,
  Zap,
  Recycle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { PageHeader } from '../components/ui/PageHeader';
import { mockApi } from '../services/mockApi';
import { formatNumber } from '../lib/utils';
import type { ImpactMetrics } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const monthlyData = [
  { month: 'Jan', devices: 8, co2: 420, value: 3200 },
  { month: 'Feb', devices: 12, co2: 680, value: 5100 },
  { month: 'Mar', devices: 15, co2: 890, value: 6800 },
  { month: 'Apr', devices: 10, co2: 560, value: 4200 },
  { month: 'May', devices: 18, co2: 1120, value: 8500 },
  { month: 'Jun', devices: 22, co2: 1450, value: 11200 },
];

const materialData = [
  { name: 'Aluminum', value: 35, color: '#4ade80' },
  { name: 'Copper', value: 22, color: '#34d399' },
  { name: 'Plastic', value: 18, color: '#22c55e' },
  { name: 'Glass', value: 12, color: '#16a34a' },
  { name: 'Rare Earth', value: 8, color: '#15803d' },
  { name: 'Other', value: 5, color: '#525252' },
];

export function ImpactAnalytics() {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getImpactMetrics('u1').then((m) => {
      setMetrics(m);
      setLoading(false);
    });
  }, []);

  if (loading || !metrics) {
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
      <PageHeader title="Impact Analytics" subtitle="Measure your environmental contribution" icon={BarChart3} />

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="CO2 Prevented"
          value={`${formatNumber(metrics.co2SavedKg)} kg`}
          subtitle="Equivalent to driving 7,200 miles"
          icon={Leaf}
          trend={{ value: 18, positive: true }}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Water Saved"
          value={`${formatNumber(metrics.waterSavedLiters)} L`}
          subtitle="Enough for 120 households/month"
          icon={Droplets}
          trend={{ value: 12, positive: true }}
          iconColor="text-cyan-400"
        />
        <StatCard
          title="Energy Saved"
          value={`${formatNumber(metrics.energySavedKwh)} kWh`}
          subtitle="Powers 300 homes for a day"
          icon={Zap}
          trend={{ value: 24, positive: true }}
          iconColor="text-amber-400"
        />
        <StatCard
          title="Landfill Diverted"
          value={`${formatNumber(metrics.landfillDivertedKg)} kg`}
          subtitle="Raw materials recovered"
          icon={Recycle}
          trend={{ value: 15, positive: true }}
          iconColor="text-primary"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium text-foreground">Monthly Activity</h3>
              <p className="text-xs text-foreground-muted">Devices processed over time</p>
            </div>
            <div className="flex items-center gap-1 text-primary text-xs">
              <TrendingUp size={14} /> +32%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#525252" fontSize={12} />
              <YAxis stroke="#525252" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  color: '#fafafa',
                }}
              />
              <Bar dataKey="devices" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* CO2 Savings Chart */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium text-foreground">CO2 Savings Trend</h3>
              <p className="text-xs text-foreground-muted">Kilograms of CO2 prevented</p>
            </div>
            <div className="flex items-center gap-1 text-primary text-xs">
              <TrendingUp size={14} /> +45%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#525252" fontSize={12} />
              <YAxis stroke="#525252" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  color: '#fafafa',
                }}
              />
              <Area type="monotone" dataKey="co2" stroke="#4ade80" fill="url(#co2Gradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Material Recovery */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium text-foreground">Material Recovery</h3>
              <p className="text-xs text-foreground-muted">Breakdown by material type</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={240}>
              <PieChart>
                <Pie
                  data={materialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {materialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    color: '#fafafa',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {materialData.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-sm text-foreground-muted flex-1">{m.name}</span>
                  <span className="text-sm font-medium text-foreground">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Value Recovery */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium text-foreground">Value Recovery</h3>
              <p className="text-xs text-foreground-muted">Estimated value recovered monthly</p>
            </div>
            <div className="flex items-center gap-1 text-primary text-xs">
              <ArrowUpRight size={14} /> +28%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#525252" fontSize={12} />
              <YAxis stroke="#525252" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  color: '#fafafa',
                }}
                formatter={(value) => [`${Number(value).toLocaleString()}`, 'Value']}
              />
              <Area type="monotone" dataKey="value" stroke="#34d399" fill="url(#valueGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Impact Summary */}
      <div className="mt-8">
        <h2 className="section-title mb-4">Your Total Impact</h2>
        <GlassCard>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <p className="text-3xl font-bold text-primary">{metrics.devicesRecycled}</p>
              <p className="text-sm text-foreground-muted mt-1">Devices Recycled</p>
            </div>
            <div className="text-center p-4">
              <p className="text-3xl font-bold text-primary">{metrics.devicesRefurbished}</p>
              <p className="text-sm text-foreground-muted mt-1">Devices Refurbished</p>
            </div>
            <div className="text-center p-4">
              <p className="text-3xl font-bold text-primary">{formatNumber(metrics.rawMaterialsRecoveredKg)} kg</p>
              <p className="text-sm text-foreground-muted mt-1">Materials Recovered</p>
            </div>
            <div className="text-center p-4">
              <p className="text-3xl font-bold text-primary">{formatNumber(metrics.landfillDivertedKg)} kg</p>
              <p className="text-sm text-foreground-muted mt-1">Landfill Diverted</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
