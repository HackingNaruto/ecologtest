import { cn } from '../../lib/utils';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'in_transit': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  valued: 'bg-primary/10 text-primary border-primary/20',
  'pickup_scheduled': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  collected: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  recycled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  excellent: 'bg-primary/10 text-primary border-primary/20',
  good: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  fair: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  poor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  broken: 'bg-red-500/10 text-red-400 border-red-500/20',
  assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'in_progress': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  received: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-surface-elevated text-foreground-muted border-border';
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize', style, className)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
