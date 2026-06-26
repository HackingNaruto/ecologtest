import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Redirect AFTER user is loaded
  useEffect(() => {
    if (!user) return;

    const role = user.role;

    if (role === 'scraper') {
      navigate('/dealer-dashboard');
    } else if (role === 'recycler') {
      navigate('/recycler-dashboard');
    } else if (role === 'dealer') {
      navigate('/dealer-dashboard');
    } else {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in to your account</p>
      </div>

      {error && (
        <motion.div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label>Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {isLoading ? 'Loading...' : (
            <>
              Sign In <ArrowRight size={16} />
            </>
          )}
        </button>

      </form>

      <div className="mt-4 text-center text-sm">
        <Link to="/register" className="text-blue-500">
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
}