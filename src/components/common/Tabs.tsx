import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pill' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill'
}) => {
  if (variant === 'pill') {
    return (
      <div className="inline-flex items-center p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200 flex items-center gap-2 z-10 ${
                isActive
                  ? 'text-brand-600 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                      : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-soft -z-10 border border-slate-200/60 dark:border-slate-700/60"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant
  return (
    <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative pb-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              isActive
                ? 'text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
