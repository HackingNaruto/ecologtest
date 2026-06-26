import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, children, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8', className)}
    >
      <div>
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-primary" size={28} />}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{title}</h1>
        </div>
        {subtitle && <p className="text-foreground-muted mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </motion.div>
  );
}
