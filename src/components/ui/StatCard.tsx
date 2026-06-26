import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  delay?: number;
  className?: string;
  iconColor?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, delay = 0, className, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn('glass-card p-5 glass-card-hover', className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground-muted">{title}</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-xs text-foreground-subtle mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn('text-xs font-medium', trend.positive ? 'text-primary' : 'text-red-400')}>
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-foreground-subtle">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg bg-primary/10', iconColor)}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}
