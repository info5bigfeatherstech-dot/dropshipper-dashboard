import React from 'react';
import { OrderStatus, StockStatus } from '../../types';
import { Clock, CheckCircle2, Truck, PackageCheck, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIGS: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }>; dot: string }
> = {
  pending: {
    label: 'Pending Approval',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200/80 dark:border-amber-800/50',
    dot: 'bg-amber-500 animate-pulse',
    icon: Clock
  },
  approved: {
    label: 'Approved',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200/80 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
    icon: CheckCircle2
  },
  shipped: {
    label: 'Shipped',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200/80 dark:border-blue-800/50',
    dot: 'bg-blue-500',
    icon: Truck
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200/80 dark:border-teal-800/50',
    dot: 'bg-teal-500',
    icon: PackageCheck
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200/80 dark:border-rose-800/50',
    dot: 'bg-rose-500',
    icon: XCircle
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status, size = 'md' }) => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.pending;
  const IconComponent = config.icon;
  const iconClass = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <IconComponent className={iconClass} />
      <span>{config.label}</span>
    </span>
  );
});

export const StockBadge: React.FC<{ status: StockStatus; count?: number }> = React.memo(({ status, count }) => {
  switch (status) {
    case 'in_stock':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50/95 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>In Stock {count !== undefined && `(${count})`}</span>
        </span>
      );
    case 'low_stock':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50/95 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80 shadow-xs backdrop-blur-md">
          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Low Stock {count !== undefined && `(${count})`}</span>
        </span>
      );
    case 'out_of_stock':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50/95 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80 shadow-xs backdrop-blur-md">
          <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
          <span>Out of Stock</span>
        </span>
      );
  }
});
