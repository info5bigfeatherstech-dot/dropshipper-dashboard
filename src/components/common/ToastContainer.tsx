import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200/80 dark:border-emerald-800/60',
    error: 'border-rose-200/80 dark:border-rose-800/60',
    warning: 'border-amber-200/80 dark:border-amber-800/60',
    info: 'border-indigo-200/80 dark:border-indigo-800/60'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            layout
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-soft-lg text-slate-800 dark:text-slate-100 ${
              borders[toast.type]
            }`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
