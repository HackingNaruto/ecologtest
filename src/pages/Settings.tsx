import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  CheckCircle,
  Mail,
  Phone,
  Building2,
  MapPin,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: '',
    location: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || prev.full_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }

    if (user?.role === 'scraper') {
      supabase
        .from('scrapers')
        .select('address')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Fetch address error:", error);
          }
          if (data && data.address) {
            setFormData((prev) => ({ ...prev, location: data.address }));
          }
        });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
      });
      
      if (user?.role === 'scraper') {
        const { data: existing } = await supabase
          .from('scrapers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        let saveError = null;

        if (existing) {
          const { error } = await supabase
            .from('scrapers')
            .update({ address: formData.location })
            .eq('user_id', user.id);
          saveError = error;
        } else {
          const { error } = await supabase
            .from('scrapers')
            .insert({ user_id: user.id, address: formData.location, verification_status: 'pending' });
          saveError = error;
        }
          
        if (saveError) {
          console.error("Supabase update error:", saveError);
          alert("Error updating address: " + saveError.message);
          return;
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Error saving profile: " + err.message);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Manage your account preferences" icon={Settings} />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard>
                  <h3 className="text-lg font-semibold text-foreground mb-6">Profile Information</h3>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" size={16} />
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" size={16} />
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="input-field pl-10 opacity-50 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" size={16} />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label">Company</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" size={16} />
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="label">
                        {user?.role === 'scraper' ? 'Shop Address (Drop-off Location)' : 'Location'}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" size={16} />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                      {saved ? <><CheckCircle size={16} /> Saved</> : 'Save Changes'}
                    </button>
                    {saved && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-primary"
                      >
                        Profile updated successfully
                      </motion.span>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard>
                  <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Pickup confirmations', desc: 'Get notified when pickups are scheduled or updated', checked: true },
                      { label: 'Valuation updates', desc: 'Receive alerts when your device valuations change', checked: true },
                      { label: 'Impact reports', desc: 'Weekly summary of your environmental impact', checked: false },
                      { label: 'Marketing emails', desc: 'Product updates and sustainability news', checked: false },
                      { label: 'Security alerts', desc: 'Login attempts and security notifications', checked: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-surface-elevated/50">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-foreground-muted">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                          <div className="w-11 h-6 bg-surface-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard>
                  <h3 className="text-lg font-semibold text-foreground mb-6">Security Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Change Password</h4>
                      <div className="space-y-3">
                        <input type="password" placeholder="Current password" className="input-field" />
                        <input type="password" placeholder="New password" className="input-field" />
                        <input type="password" placeholder="Confirm new password" className="input-field" />
                      </div>
                      <button className="btn-primary mt-3">Update Password</button>
                    </div>
                    <div className="pt-6 border-t border-border">
                      <h4 className="text-sm font-medium text-foreground mb-3">Two-Factor Authentication</h4>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-surface-elevated/50">
                        <div>
                          <p className="text-sm font-medium text-foreground">Authenticator App</p>
                          <p className="text-xs text-foreground-muted">Use an authenticator app to generate codes</p>
                        </div>
                        <button className="btn-secondary text-sm py-2">Enable</button>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-border">
                      <h4 className="text-sm font-medium text-foreground mb-3">Active Sessions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50">
                          <div>
                            <p className="text-sm text-foreground">Chrome on macOS</p>
                            <p className="text-xs text-foreground-muted">San Francisco, CA &middot; Current session</p>
                          </div>
                          <span className="text-xs text-primary font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard>
                  <h3 className="text-lg font-semibold text-foreground mb-6">Billing & Payments</h3>
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-surface-elevated/50 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-primary">Free Plan</p>
                          <p className="text-xs text-foreground-muted">Basic e-waste management features</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">$0/mo</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Payment Methods</h4>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-surface-elevated/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 rounded bg-foreground/10 flex items-center justify-center text-xs text-foreground-muted">VISA</div>
                          <div>
                            <p className="text-sm text-foreground">&middot;&middot;&middot;&middot; 4242</p>
                            <p className="text-xs text-foreground-muted">Expires 12/25</p>
                          </div>
                        </div>
                        <span className="text-xs text-primary font-medium">Default</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Payout History</h4>
                      <div className="space-y-2">
                        {[
                          { date: 'Mar 10, 2024', amount: 550, status: 'Completed' },
                          { date: 'Feb 28, 2024', amount: 320, status: 'Completed' },
                          { date: 'Feb 15, 2024', amount: 180, status: 'Completed' },
                        ].map((payout, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50">
                            <div>
                              <p className="text-sm text-foreground">Device Credit</p>
                              <p className="text-xs text-foreground-muted">{payout.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-primary">+${payout.amount}</p>
                              <p className="text-xs text-foreground-muted">{payout.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
