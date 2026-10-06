/**
 * Scrollable shell for public auth pages.
 * Dashboard Layout keeps #root overflow:hidden — these pages sit outside Layout
 * and must scroll their own viewport without changing the panel shell.
 */
import React from 'react';

export const AuthPageShell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`fixed inset-0 z-0 overflow-y-auto overscroll-contain bg-slate-50 dark:bg-slate-900 ${className}`}
  >
    <div className="min-h-full w-full px-4 py-8 sm:py-10">{children}</div>
  </div>
);

export default AuthPageShell;
