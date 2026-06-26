import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, MapPin, CreditCard, User, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { registerScraper } from '../services/supabaseApi';
import { useGeolocation } from '../hooks/useGeolocation';

export function ScraperRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { requestLocation } = useGeolocation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    aadhaar: '',
    vehicleType: 'bike',
    serviceRadius: 10,
    bankAccount: '',
    upiId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const location = await requestLocation();
      await registerScraper({
        user_id: user.id,
        aadhaar_number: form.aadhaar,
        vehicle_type: form.vehicleType,
        service_radius: form.serviceRadius,
        bank_account: form.bankAccount,
        upi_id: form.upiId,
        current_latitude: location?.latitude || null,
        current_longitude: location?.longitude || null,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto mt-12">
          <GlassCard className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-primary" size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Application Submitted</h2>
            <p className="text-sm text-foreground-muted mt-2">
              Your scraper registration is under review. We'll notify you once approved.
            </p>
            <button onClick={() => navigate('/dealer-dashboard')} className="btn-primary mt-6">
              Go to Dashboard
            </button>
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Scraper Registration" subtitle="Complete your onboarding to start accepting pickups" icon={Truck} />

      <div className="max-w-2xl">
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="text-primary" size={18} />
            <span className="text-sm text-foreground-muted">All information is securely stored and verified</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Aadhaar Number</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" size={16} />
                <input
                  type="text"
                  value={form.aadhaar}
                  onChange={(e) => setForm({ ...form, aadhaar: e.target.value })}
                  className="input-field pl-10"
                  placeholder="XXXX XXXX XXXX"
                  required
                  maxLength={14}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Vehicle Type</label>
                <select
                  value={form.vehicleType}
                  onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                  className="input-field"
                >
                  <option value="bike">Bike</option>
                  <option value="auto">Auto</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              <div>
                <label className="label">Service Radius (km)</label>
                <input
                  type="number"
                  value={form.serviceRadius}
                  onChange={(e) => setForm({ ...form, serviceRadius: parseInt(e.target.value) })}
                  className="input-field"
                  min={1}
                  max={100}
                />
              </div>
            </div>

            <div>
              <label className="label">Bank Account Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" size={16} />
                <input
                  type="text"
                  value={form.bankAccount}
                  onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                  className="input-field pl-10"
                  placeholder="For receiving payments"
                />
              </div>
            </div>

            <div>
              <label className="label">UPI ID</label>
              <input
                type="text"
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                className="input-field"
                placeholder="yourname@upi"
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <MapPin className="text-primary" size={16} />
              <span className="text-sm text-foreground-muted">Your current location will be captured for nearby pickup matching</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  Submit Application <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
