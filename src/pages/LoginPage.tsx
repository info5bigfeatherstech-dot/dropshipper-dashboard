import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { setAuthToken } from '../lib/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'token'>('login');
  
  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Direct token state
  const [rawToken, setRawToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both Email/Phone and Password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim()
        })
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data) {
        // Extract JWT token from common response structures
        const token =
          data.accessToken ||
          data.data?.accessToken ||
          data.token ||
          data.data?.token ||
          data.jwt ||
          '';

        if (token && typeof token === 'string') {
          setAuthToken(token);
        }

        const user = data.user || data.data?.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        navigate('/', { replace: true });
      } else {
        const errorMsg =
          data?.errors?.[0]?.msg ||
          data?.message ||
          'Invalid credentials. Make sure you use an Admin / Staff account.';
        setError(errorMsg);
      }
    } catch (err: any) {
      setError(err?.message || 'Login request failed. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = rawToken.replace(/^Bearer\s+/i, '').trim();
    if (!clean) {
      setError('Please paste a valid JWT token.');
      return;
    }

    setAuthToken(clean);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dropshipper Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Staff Authentication (admin, product_manager, inventory_manager)
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 text-sm font-medium">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 pb-3 text-center border-b-2 transition-colors ${
              tab === 'login'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            OWB Staff Login
          </button>
          <button
            type="button"
            onClick={() => { setTab('token'); setError(''); }}
            className={`flex-1 pb-3 text-center border-b-2 transition-colors ${
              tab === 'token'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Paste Access Token
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email or Phone Number
              </label>
              <Input
                type="text"
                required
                autoComplete="username"
                placeholder="admin@dropshipper.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <Input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
            >
              {loading ? 'Authenticating...' : 'Sign In as Staff'}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleTokenSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                OWB Admin JWT Token
              </label>
              <textarea
                required
                rows={4}
                placeholder="Paste Bearer token copied from OWB admin dashboard..."
                value={rawToken}
                onChange={(e) => setRawToken(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Copied from your OWB admin session (localStorage / Network tab)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
            >
              Save Token & Continue
            </Button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-center">
          <p className="text-xs text-slate-400">
            Tip: In backend <code className="text-indigo-500">.env</code> set <code className="text-indigo-500">DROPSHIPPER_AUTH_BYPASS=true</code> for local dev without tokens.
          </p>
        </div>
      </div>
    </div>
  );
};
