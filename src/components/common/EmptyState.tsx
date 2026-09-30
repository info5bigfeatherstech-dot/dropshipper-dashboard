import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl my-6">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
