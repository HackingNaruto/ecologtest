import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Smartphone,
  Truck,
  Route,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  User,
  Home,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const getNavItems = (role?: string) => {
  const base = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['customer', 'admin'] },
    { label: 'Device Valuation', path: '/valuation', icon: Smartphone, roles: ['customer', 'admin'] },
    { label: 'Pickup Requests', path: '/pickups', icon: Truck, roles: ['customer', 'scraper', 'admin'] },
    { label: 'Supply Chain', path: '/supply-chain', icon: Route, roles: ['customer', 'admin'] },
    { label: 'Impact Analytics', path: '/impact', icon: BarChart3, roles: ['customer', 'recycler', 'admin'] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: ['customer', 'scraper', 'recycler', 'admin'] },
  ];

const scraperItems = [
  { label: 'Dashboard', path: '/dealer-dashboard', icon: LayoutDashboard, roles: ['scraper', 'admin'] },
  { label: 'Pickup Requests', path: '/scraper-dashboard', icon: Truck, roles: ['scraper', 'admin'] }, // ← fixed
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['scraper', 'admin'] },
];

  const recyclerItems = [
    { label: 'Dashboard', path: '/recycler-dashboard', icon: LayoutDashboard, roles: ['recycler', 'admin'] },
    { label: 'Impact Analytics', path: '/impact', icon: BarChart3, roles: ['recycler', 'admin'] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: ['recycler', 'admin'] },
  ];

  const adminItems = [
    { label: 'Admin Panel', path: '/admin', icon: ShieldCheck, roles: ['admin'] },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { label: 'Pickup Requests', path: '/pickups', icon: Truck, roles: ['admin'] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
  ];

  if (role === 'scraper') return scraperItems.filter((i) => i.roles.includes(role));
  if (role === 'recycler') return recyclerItems.filter((i) => i.roles.includes(role));
  if (role === 'admin') return adminItems.filter((i) => i.roles.includes(role));
  return base.filter((i) => i.roles.includes(role || 'customer'));
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = getNavItems(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed h-screen border-r border-border bg-surface/80 backdrop-blur-glass z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Leaf className="text-primary" size={18} />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">EcoLog</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.03]'
                )}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {active && <ChevronRight className="ml-auto" size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="text-primary" size={16} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-foreground-subtle truncate capitalize">{user?.role}</p>
              </div>
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-full left-0 right-0 mb-2 glass-card p-2 space-y-1"
                >
                  <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-white/[0.03]">
                    <Settings size={14} /> Settings
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10">
                    <LogOut size={14} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-[280px] bg-surface border-r border-border z-50 lg:hidden flex flex-col"
            >
              <div className="p-5 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Leaf className="text-primary" size={18} />
                  </div>
                  <span className="text-lg font-semibold text-foreground">EcoLog</span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.05]">
                  <X size={20} className="text-foreground-muted" />
                </button>
              </div>
              <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.03]'
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-border">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-surface/80 backdrop-blur-glass border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/[0.05]">
              <Menu size={20} className="text-foreground-muted" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="text-primary" size={18} />
              <span className="font-semibold text-foreground">EcoLog</span>
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/[0.05] text-red-400">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Top Bar (Desktop) */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-foreground-subtle">
            <Link to="/" className="hover:text-foreground transition-colors"><Home size={14} /></Link>
            <ChevronRight size={14} />
            <span className="text-foreground capitalize">{location.pathname.slice(1).replace(/-/g, ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="relative p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
              <Bell size={18} className="text-foreground-muted" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </Link>
            <Link to="/settings" className="flex items-center gap-2 pl-4 border-l border-border hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="text-primary" size={16} />
              </div>
              <span className="text-sm font-medium text-foreground">{user?.full_name}</span>
            </Link>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
