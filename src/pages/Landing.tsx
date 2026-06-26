import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf,
  ArrowRight,
  Smartphone,
  Truck,
  Route,
  BarChart3,
  ShieldCheck,
  Recycle,
  ChevronRight,
  Zap,
  Globe,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Smart Valuation',
    description: 'AI-powered device assessment with real-time market data and condition analysis.',
  },
  {
    icon: Truck,
    title: 'Seamless Pickup',
    description: 'Schedule doorstep collection with verified scrap dealers in your area.',
  },
  {
    icon: Route,
    title: 'Chain Transparency',
    description: 'Track every device from collection through recycling with blockchain-verified records.',
  },
  {
    icon: BarChart3,
    title: 'Impact Analytics',
    description: 'Measure your environmental contribution with detailed CO2, water, and energy savings.',
  },
];

const stats = [
  { value: '12,400+', label: 'Devices Recycled', icon: Recycle },
  { value: '$2.8M', label: 'Value Recovered', icon: Zap },
  { value: '847 Tons', label: 'CO2 Prevented', icon: Globe },
  { value: '98.5%', label: 'Material Recovery', icon: Award },
];

const steps = [
  { step: '01', title: 'Register Device', desc: 'Upload details and photos of your e-waste' },
  { step: '02', title: 'Get Valuation', desc: 'Receive an instant AI-powered market estimate' },
  { step: '03', title: 'Schedule Pickup', desc: 'Book a convenient collection time' },
  { step: '04', title: 'Track Impact', desc: 'Follow your device and see your environmental impact' },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Leaf className="text-primary" size={18} />
              </div>
              <span className="text-lg font-semibold text-foreground">EcoLog</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-foreground-muted hover:text-foreground transition-colors">How It Works</a>
              <a href="#impact" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Impact</a>
              <Link to="/login" className="btn-secondary text-sm py-2">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
            </div>
            <div className="md:hidden">
              <Link to="/login" className="btn-primary text-sm py-2 px-4">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary/3 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
                <ShieldCheck size={14} /> Trusted businesses
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
                Turn E-Waste Into{' '}
                <span className="text-primary glow-text">Environmental Impact</span>
              </h1>
              <p className="mt-6 text-lg text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                The intelligent platform connecting businesses, scrap dealers, and recyclers. 
                Value devices, schedule pickups, and track your contribution to a circular economy.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                  Start Recycling <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3">
                  View Demo
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 lg:mt-20"
          >
            <div className="glass-card p-2 lg:p-4 gradient-border">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                {[
                  { label: 'Devices', value: '5', sub: 'Registered', icon: Smartphone },
                  { label: 'Total Value', value: '$1,735', sub: 'Estimated', icon: Zap },
                  { label: 'Pickups', value: '2', sub: 'Scheduled', icon: Truck },
                  { label: 'CO2 Saved', value: '42kg', sub: 'This month', icon: Globe },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="p-4 lg:p-6 rounded-xl bg-surface-elevated/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon size={16} className="text-primary" />
                        <span className="text-xs text-foreground-muted">{item.label}</span>
                      </div>
                      <p className="text-xl lg:text-2xl font-bold text-foreground">{item.value}</p>
                      <p className="text-xs text-foreground-subtle mt-1">{item.sub}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="impact" className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                    <Icon className="text-primary" size={20} />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-foreground-muted mt-1">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Everything You Need to <span className="text-primary">Close the Loop</span>
            </h2>
            <p className="mt-4 text-foreground-muted">
              A complete ecosystem for responsible e-waste management from valuation to verified recycling.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 glass-card-hover"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="text-primary" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              How <span className="text-primary">EcoLog</span> Works
            </h2>
            <p className="mt-4 text-foreground-muted">
              Four simple steps to turn your e-waste into value and environmental impact.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="glass-card p-6 h-full">
                  <span className="text-4xl font-bold text-primary/20">{step.step}</span>
                  <h3 className="text-lg font-semibold text-foreground mt-3 mb-2">{step.title}</h3>
                  <p className="text-sm text-foreground-muted">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="text-foreground-subtle" size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 lg:p-16 gradient-border"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Ready to Make an <span className="text-primary glow-text">Impact?</span>
            </h2>
            <p className="mt-4 text-foreground-muted max-w-xl mx-auto">
              Join thousands of businesses and individuals already diverting e-waste from landfills 
              and contributing to a sustainable future.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Leaf className="text-primary" size={14} />
              </div>
              <span className="font-semibold text-foreground">EcoLog</span>
            </div>
            <p className="text-sm text-foreground-subtle">
              Building the circular economy, one device at a time.
            </p>
            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
