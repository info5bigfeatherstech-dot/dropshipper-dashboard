import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AuthPageShell } from '../components/layout/AuthPageShell';
import { dropshipperAuthService } from '../services/dropshipperAuthService';

function parseIdentifier(raw: string): { email?: string; phone?: string } {
  const value = String(raw || '').trim();
  if (!value) return {};
  if (value.includes('@')) return { email: value.toLowerCase() };
  const digits = value.replace(/\D/g, '').slice(-10);
  if (digits.length === 10) return { phone: digits };
  return {};
}

/**
 * After admin approves a paid registration:
 * 1) Enter email OR phone (one field)
 * 2) OTP + create password (shown even if OTP already emailed on approve)
 * 3) Login separately — no auto-login
 */
export const ActivatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preset =
    searchParams.get('email') || searchParams.get('phone') || '';

  const [identifier, setIdentifier] = useState(preset);
  const [step, setStep] = useState<'id' | 'otp'>('id');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sendOtp = async (opts?: { advanceOnlyOnSuccess?: boolean }) => {
    setError('');
    setSuccess('');
    setDebugOtp(null);

    const parsed = parseIdentifier(identifier);
    if (!parsed.email && !parsed.phone) {
      setError('Enter your registered email or 10-digit phone number.');
      return false;
    }

    setLoading(true);
    try {
      const data = await dropshipperAuthService.sendActivationOtp(parsed);
      setSuccess(data?.message || 'OTP sent to your registered email.');
      if (data?.debugOtp) setDebugOtp(String(data.debugOtp));
      setStep('otp');
      return true;
    } catch (err: any) {
      const msg =
        err?.message ||
        'Could not send OTP. Admin must approve your paid request first.';
      // OTP often already sent on admin approve — still open OTP entry UI
      const alreadyCooling =
        err?.status === 429 ||
        err?.code === 'OTP_RESEND_COOLDOWN' ||
        /wait|cooldown|already/i.test(String(msg));
      if (!opts?.advanceOnlyOnSuccess && alreadyCooling) {
        setSuccess('OTP was already sent. Enter it below (check your email).');
        setStep('otp');
        setError('');
        return true;
      }
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtp();
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsed = parseIdentifier(identifier);
    if (!parsed.email && !parsed.phone) {
      setError('Enter your registered email or phone.');
      return;
    }
    if (!otp.trim()) {
      setError('Enter the OTP from your email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await dropshipperAuthService.completeActivation({
        ...parsed,
        otp: otp.trim(),
        password,
        confirmPassword,
      });
      setSuccess(
        data?.message ||
          'Account activated. Your 1-year subscription has started. Please login.'
      );
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { email: parsed.email || '', phone: parsed.phone || '' },
        });
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell className="flex items-center">
      <div className="max-w-md mx-auto w-full space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Activate account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            After admin approval: verify OTP from email, then create your login password.
          </p>
        </div>

        {error ? (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            {success}
          </div>
        ) : null}
        {debugOtp ? (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
            Dev OTP: <strong>{debugOtp}</strong>
          </div>
        ) : null}

        {step === 'id' ? (
          <form className="space-y-4" onSubmit={handleContinue}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email or phone
              </label>
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or 9876543210"
                disabled={loading}
                autoComplete="username"
                required
              />
              <p className="mt-1 text-xs text-slate-400">
                Use the same email or mobile from registration.
              </p>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? 'Sending…' : 'Continue'}
            </Button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                const parsed = parseIdentifier(identifier);
                if (!parsed.email && !parsed.phone) {
                  setError('Enter your registered email or 10-digit phone number.');
                  return;
                }
                setError('');
                setSuccess('Enter the OTP you already received, then create a password.');
                setStep('otp');
              }}
              className="w-full text-sm text-indigo-600 hover:underline"
            >
              I already have an OTP
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleComplete}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email or phone
              </label>
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                OTP
              </label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP from email"
                disabled={loading}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Create password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                disabled={loading}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? 'Activating…' : 'Verify OTP & create login'}
            </Button>
            <div className="flex flex-col gap-2 text-center text-sm">
              <button
                type="button"
                disabled={loading}
                onClick={() => sendOtp({ advanceOnlyOnSuccess: true })}
                className="text-indigo-600 hover:underline"
              >
                Resend OTP
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setStep('id');
                  setError('');
                  setSuccess('');
                }}
                className="text-slate-500 hover:underline"
              >
                Change email / phone
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-sm text-slate-500 space-y-1">
          <p>Paid registration → admin approve → activate here → then login.</p>
          <p>
            <Link to="/login" className="text-indigo-600 hover:underline">
              Already activated? Login
            </Link>
            {' · '}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  );
};

export default ActivatePage;
