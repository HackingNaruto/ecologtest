import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Route,
  Package,
  Truck,
  Factory,
  CheckCircle,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { mockApi } from '../services/mockApi';
import { formatDateTime } from '../lib/utils';
import type { SupplyChainEvent, Device } from '../types';

const eventIcons: Record<string, typeof Package> = {
  registered: Package,
  valued: CheckCircle,
  pickup_scheduled: Clock,
  collected: Truck,
  transport: Route,
  received: Factory,
  processed: Factory,
  recycled: CheckCircle,
  resold: CheckCircle,
};

const eventLabels: Record<string, string> = {
  registered: 'Device Registered',
  valued: 'Valuation Complete',
  pickup_scheduled: 'Pickup Scheduled',
  collected: 'Collected from User',
  transport: 'In Transit',
  received: 'Received at Facility',
  processed: 'Processing Started',
  recycled: 'Recycling Complete',
  resold: 'Refurbished & Resold',
};

export function SupplyChain() {
  const [selectedDevice, setSelectedDevice] = useState<string>('d4');
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getDevices('u1').then((d) => {
      setDevices(d);
      if (d.length > 0) {
        loadEvents(d[0].id);
      }
    });
  }, []);

  const loadEvents = async (deviceId: string) => {
    setLoading(true);
    setSelectedDevice(deviceId);
    const evts = await mockApi.getSupplyChain(deviceId);
    setEvents(evts);
    setLoading(false);
  };

  const selectedDeviceData = devices.find((d) => d.id === selectedDevice);

  return (
    <DashboardLayout>
      <PageHeader title="Supply Chain Tracker" subtitle="Transparent tracking from collection to recycling" icon={Route} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Device Selector */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="section-title">Select Device</h2>
          <div className="space-y-2">
            {devices.map((device) => (
              <button
                key={device.id}
                onClick={() => loadEvents(device.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedDevice === device.id
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-surface-elevated hover:border-primary/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{device.brand} {device.model}</p>
                    <p className="text-xs text-foreground-subtle capitalize">{device.type}</p>
                  </div>
                  <StatusBadge status={device.status} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <GlassCard>
            {selectedDeviceData && (
              <div className="mb-6 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedDeviceData.brand} {selectedDeviceData.model}</h3>
                    <p className="text-sm text-foreground-muted">Serial: {selectedDeviceData.serialNumber || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={selectedDeviceData.status} />
                    <p className="text-xs text-foreground-subtle mt-1">Current Status</p>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-center text-foreground-muted py-12">No supply chain data available for this device.</p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-6">
                  {events.map((event, i) => {
                    const Icon = eventIcons[event.eventType] || Package;
                      return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative flex gap-4"
                      >
                        {/* Icon */}
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          event.verified ? 'bg-primary/10' : 'bg-surface-elevated border border-border'
                        }`}>
                          <Icon className={event.verified ? 'text-primary' : 'text-foreground-subtle'} size={18} />
                          {event.verified && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-surface rounded-full flex items-center justify-center">
                              <ShieldCheck className="text-primary" size={12} />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">{eventLabels[event.eventType] || event.eventType}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-foreground-subtle">
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} /> {event.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> {formatDateTime(event.timestamp)}
                                </span>
                              </div>
                              <p className="text-xs text-foreground-muted mt-1">
                                By <span className="text-foreground">{event.actor}</span> ({event.actorRole})
                              </p>
                              {event.metadata && (
                                <div className="mt-2 p-2 rounded-lg bg-surface-elevated/50 text-xs text-foreground-muted">
                                  {JSON.stringify(event.metadata)}
                                </div>
                              )}
                            </div>
                            {event.verified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                <ShieldCheck size={10} /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
