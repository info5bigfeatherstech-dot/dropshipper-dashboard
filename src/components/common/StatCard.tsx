import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  accent?: 'indigo' | 'amber' | 'emerald' | 'blue' | 'rose';
  isActive?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accent = 'indigo',
  isActive = false,
  onClick
}) => {
  const accentClasses = {
    indigo: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      activeBorder: 'ring-2 ring-indigo-500 border-indigo-400 dark:border-indigo-600'
    },
    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      activeBorder: 'ring-2 ring-amber-500 border-amber-400 dark:border-amber-600'
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      activeBorder: 'ring-2 ring-emerald-500 border-emerald-400 dark:border-emerald-600'
    },
    blue: {
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
      activeBorder: 'ring-2 ring-blue-500 border-blue-400 dark:border-blue-600'
    },
    rose: {
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      activeBorder: 'ring-2 ring-rose-500 border-rose-400 dark:border-rose-600'
    }
  };

  const currentAccent = accentClasses[accent];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`relative bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-soft hover:shadow-soft-lg transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isActive
          ? currentAccent.activeBorder
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {value}
          </h3>
          {subtext && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${currentAccent.iconBg}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};
