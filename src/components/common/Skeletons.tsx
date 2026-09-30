import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden p-4 shadow-soft animate-pulse">
      <div className="aspect-[4/3] rounded-xl bg-slate-200 dark:bg-slate-800 mb-4" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3 mb-2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mb-4" />
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-20" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-24" />
      </div>
    </div>
  );
};

export const OrderRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/80 animate-pulse">
      <div className="flex items-center gap-3 w-1/4">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-28" />
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-16" />
    </div>
  );
};
