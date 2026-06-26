import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Factory, ShieldCheck, CheckCircle, ArrowRight, Upload } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { registerRecycler } from '../services/supabaseApi';

export function RecyclerRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    address: '',
    cpcbNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await registerRecycler({
        user_id: user.id,
        company_name: form.companyName,
        address: form.address,
        cpcb_registration_number: form.cpcbNumber,
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
            <h2 className="text-xl font-bold text-foreground">Registration Submitted</h2>
            <p className="text-sm text-foreground-muted mt-2">
              Your recycler application is pending admin approval. You'll be notified once verified.
            </p>
            <button onClick={() => navigate('/recycler-dashboard')} className="btn-primary mt-6">
              Go to Dashboard
            </button>
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Recycler Registration" subtitle="Register your recycling facility with CPCB verification" icon={Factory} />

      <div className="max-w-2xl">
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="text-primary" size={18} />
            <span className="text-sm text-foreground-muted">CPCB registration is mandatory for all recyclers</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="input-field"
                placeholder="EcoRecycle Pvt Ltd"
                required
              />
            </div>

            <div>
              <label className="label">Facility Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field min-h-[80px] resize-none"
                placeholder="Full address of your recycling facility"
                required
              />
            </div>

            <div>
              <label className="label">CPCB Registration Number</label>
              <input
                type="text"
                value={form.cpcbNumber}
                onChange={(e) => setForm({ ...form, cpcbNumber: e.target.value })}
                className="input-field"
                placeholder="CPCB/REC/XXXX/20XX"
                required
              />
            </div>

            <div className="p-4 rounded-lg bg-surface-elevated/50 border border-border">
              <div className="flex items-center gap-3">
                <Upload className="text-foreground-subtle" size={20} />
                <div>
                  <p className="text-sm text-foreground">License Upload</p>
                  <p className="text-xs text-foreground-muted">Upload CPCB license (PDF/Image)</p>
                </div>
              </div>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-2 w-full text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/15" />
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
                  Submit Registration <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
