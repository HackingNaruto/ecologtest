import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast } from '../../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'bg-primary/10 border-primary/20 text-primary',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-glass ${styles[toast.type]}`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{toast.message}</span>
              <button onClick={() => onRemove(toast.id)} className="ml-2 opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
