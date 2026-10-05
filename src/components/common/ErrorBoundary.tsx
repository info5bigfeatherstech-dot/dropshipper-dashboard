import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/products';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] p-4 font-sans">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400 shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              An unexpected error occurred while loading this view. You can reload the page or return to the product catalog.
            </p>

            {this.state.error && (
              <div className="mb-6 text-left bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <p className="text-xs font-mono font-medium text-rose-600 dark:text-rose-400 break-words">
                  {this.state.error.message || 'Unknown runtime error'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={this.handleReload}
                className="w-full sm:w-auto rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </Button>

              <Button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto rounded-xl flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white shadow-soft"
              >
                <Home className="w-4 h-4" />
                <span>Product Catalog</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
