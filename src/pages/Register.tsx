import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type ProfileRole = Database['public']['Tables']['profiles']['Row']['role'];

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<ProfileRole>('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // ✅ Added state to track successful signups

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      await register(email, password, name, role);
      setIsSuccess(true); // ✅ SUCCESS: Switch UI view instead of navigating to login instantly!
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const roles: { value: ProfileRole; label: string; icon: typeof User }[] = [
    { value: 'customer', label: 'Customer', icon: User },
    { value: 'scraper', label: 'Scraper', icon: Building2 },
    { value: 'recycler', label: 'Recycler', icon: Building2 },
  ];

  // ✅ New Verification UI state block
  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="text-center py-6 space-y-4">
          <div className="flex justify-center text-emerald-400">
            <CheckCircle2 size={48} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            We've sent a verification link to <span className="text-emerald-400 font-medium">{email}</span>. 
            Please check your inbox and confirm your email to activate your account.
          </p>
          <div className="pt-4">
            <Link to="/login" className="w-full btn-primary inline-flex items-center justify-center gap-2 px-6">
              Go to Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create account</h1>
        <p className="text-sm text-gray-500 mt-1">
          Join the circular economy revolution
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded bg-red-100 text-red-600 text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* FULL NAME */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field pl-10"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
              placeholder="you@company.com"
              required
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10"
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>
        </div>

        {/* ROLE SELECT */}
        <div>
          <label className="block text-sm font-medium mb-1">Account Type</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                    role === r.value
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-gray-800 bg-surface-elevated text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
          ) : (
            <>
              Create Account <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* LOGIN LINK */}
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Already have an account? </span>
        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}