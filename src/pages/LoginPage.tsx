import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { setDropshipperSession } from '../lib/api';
import { dropshipperAuthService } from '../services/dropshipperAuthService';

/**
 * Dropshipper portal login — email/phone + password created during activation.
 * Not staff/admin login. No credentials until admin approve → OTP → set password.
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { email?: string; phone?: string } };
  const from = (location as any)?.state?.from?.pathname || '/products';

  const [identifier, setIdentifier] = useState(
    location.state?.email || location.state?.phone || ''
  );
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const id = identifier.trim();
    if (!id || !password) {
      setError('Enter email/phone and password.');
      return;
    }

    const body: { email?: string; phone?: string; password: string } = { password };
    if (id.includes('@')) body.email = id;
    else body.phone = id.replace(/\D/g, '').slice(-10);

    setLoading(true);
    try {
      const data = await dropshipperAuthService.login(body);
      const accessToken =
        data.accessToken || data.data?.accessToken || data.token || null;
      const refreshToken = data.refreshToken || data.data?.refreshToken || null;

      if (!accessToken) {
        setError('Login succeeded but no access token returned.');
        return;
      }

      setDropshipperSession({
        accessToken,
        refreshToken,
        dropshipper: data.dropshipper || data.data?.dropshipper || data.user,
      });

      // If subscription expired, panel routes will return SUBSCRIPTION_EXPIRED (renew).
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err?.message ||
          'Login failed. Activate your account after admin approval first.'
      );
    } finally {
      setLoading(false);
    }
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
            Dropshipper Login
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Use email/phone + password created after admin approval &amp; OTP activation
          </p>
        </div>

        {error ? (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleLoginSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email or phone
            </label>
            <Input
              type="text"
              required
              autoComplete="username"
              placeholder="you@example.com or 9876543210"
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
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-center space-y-2 text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            Admin approved you?{' '}
            <Link to="/activate" className="text-indigo-600 font-medium hover:underline">
              Activate with OTP
            </Link>
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            New partner?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Register &amp; pay
            </Link>
            {' · '}
            <Link to="/register?mode=status" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline">
              Check Application Status
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
