import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  dropshipperAuthService,
  type DropshipperRegisterPayload,
} from '../services/dropshipperAuthService';
import { loadRazorpayScript } from '../utils/razorpay';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  whatsappNumber: '',
  businessName: '',
  permanentAddress: '',
  haveShop: false,
  businessAddress: '',
  deliveryAddress: '',
  sellingPlaceFrom: '',
  sellingZoneCity: '',
  productCategory: '',
  monthlyEstimatedPurchase: '',
  idProofUrl: '',
  businessAddressProofUrl: '',
};

export const RegisterPage: React.FC = () => {
  const [settings, setSettings] = useState<{
    subscriptionAmountInr?: number;
    subscriptionYears?: number;
    registrationOpen?: boolean;
  } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ requestId?: string; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await dropshipperAuthService.getSubscriptionSettings();
        if (!cancelled) setSettings(data?.settings || null);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Could not load subscription settings');
      } finally {
        if (!cancelled) setLoadingSettings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (key: keyof typeof EMPTY_FORM, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const amount = settings?.subscriptionAmountInr;
  const years = settings?.subscriptionYears || 1;
  const registrationOpen = settings?.registrationOpen !== false;

  const buildPayload = (): DropshipperRegisterPayload => ({
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.replace(/\D/g, '').slice(-10),
    whatsappNumber: form.whatsappNumber.replace(/\D/g, '').slice(-10),
    businessName: form.businessName.trim() || undefined,
    permanentAddress: form.permanentAddress.trim(),
    haveShop: form.haveShop === true,
    businessAddress: form.businessAddress.trim(),
    deliveryAddress: form.deliveryAddress.trim(),
    sellingPlaceFrom: form.sellingPlaceFrom.trim(),
    sellingZoneCity: form.sellingZoneCity.trim(),
    productCategory: form.productCategory.trim(),
    monthlyEstimatedPurchase: form.monthlyEstimatedPurchase,
    idProofUrl: form.idProofUrl.trim() || undefined,
    businessAddressProofUrl: form.businessAddressProofUrl.trim() || undefined,
  });

  const validate = () => {
    const required: Array<[keyof typeof EMPTY_FORM, string]> = [
      ['fullName', 'Full name'],
      ['email', 'Email'],
      ['phone', 'Mobile number'],
      ['whatsappNumber', 'WhatsApp number'],
      ['permanentAddress', 'Permanent address'],
      ['businessAddress', 'Business address'],
      ['deliveryAddress', 'Delivery address'],
      ['sellingPlaceFrom', 'Selling place'],
      ['sellingZoneCity', 'Selling zone / city'],
      ['productCategory', 'Product category'],
      ['monthlyEstimatedPurchase', 'Monthly estimated purchase'],
    ];
    for (const [key, label] of required) {
      if (!String(form[key] ?? '').trim()) {
        setError(`${label} is required`);
        return false;
      }
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
      setError('Mobile must be a 10-digit Indian number');
      return false;
    }
    if (!/^\d{10}$/.test(form.whatsappNumber.replace(/\D/g, '').slice(-10))) {
      setError('WhatsApp must be a 10-digit Indian number');
      return false;
    }
    return true;
  };

  const openRazorpay = (payData: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        reject(new Error('Could not load Razorpay Checkout'));
        return;
      }
      const rz = payData?.razorpay || {};
      if (!rz.keyId || !rz.orderId) {
        reject(new Error('Payment order missing from server'));
        return;
      }

      const rzp = new window.Razorpay({
        key: rz.keyId,
        amount: rz.amount,
        currency: rz.currency || 'INR',
        name: 'OfferwaleBaba Dropship',
        description: `Dropshipper subscription — ${years} year`,
        order_id: rz.orderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone.replace(/\D/g, '').slice(-10),
        },
        theme: { color: '#4F46E5' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verified = await dropshipperAuthService.verifyRegistrationPayment({
              requestId: payData.requestId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            resolve(verified);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      });
      rzp.on('payment.failed', (resp: any) => {
        reject(new Error(resp?.error?.description || 'Payment failed'));
      });
      rzp.open();
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!registrationOpen) {
      setError('Registration is temporarily closed');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = buildPayload();
      const payData = await dropshipperAuthService.createRegistrationPayment(payload);
      const verified = await openRazorpay(payData);
      setDone({
        requestId: verified?.request?.id || payData.requestId,
        message:
          verified?.message ||
          'Payment received. Your application is pending admin approval.',
      });
      setForm(EMPTY_FORM);
    } catch (err: any) {
      const msg = err?.message || 'Registration / payment failed';
      if (msg !== 'Payment cancelled') setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Become a Dropshipper
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Same business details as wholesaler partners. Pay the annual fee to submit your
            application.
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {loadingSettings
              ? 'Loading fee…'
              : amount != null
                ? `Fee: ₹${Number(amount).toLocaleString('en-IN')} / ${years} year`
                : 'Fee unavailable'}
          </p>
        </div>

        {error ? (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {done ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-green-200 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
              Payment received — pending admin approval
            </h2>
            <p className="text-sm text-green-700 dark:text-green-400">{done.message}</p>
            {done.requestId ? (
              <p className="text-xs text-slate-500 break-all">Request ID: {done.requestId}</p>
            ) : null}
            <ol className="text-sm text-slate-600 dark:text-slate-300 list-decimal pl-5 space-y-1">
              <li>Wait for admin to accept your request (you cannot login yet).</li>
              <li>
                After approval, open{' '}
                <Link to="/activate" className="text-indigo-600 underline">
                  Activate account
                </Link>{' '}
                — email OTP + create password.
              </li>
              <li>Then login with email/phone and that password.</li>
            </ol>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="button" onClick={() => setDone(null)} variant="outline">
                Submit another
              </Button>
              <Link
                to="/activate"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium"
              >
                Activate (after approval)
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium"
              >
                Login (after activation)
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6"
          >
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                Personal
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Full name *"
                  value={form.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  disabled={submitting || !registrationOpen}
                />
                <Input
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  disabled={submitting || !registrationOpen}
                />
                <Input
                  placeholder="Mobile (10 digit) *"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  disabled={submitting || !registrationOpen}
                />
                <Input
                  placeholder="WhatsApp (10 digit) *"
                  value={form.whatsappNumber}
                  onChange={(e) => setField('whatsappNumber', e.target.value)}
                  disabled={submitting || !registrationOpen}
                />
                <Input
                  placeholder="Business name (optional)"
                  value={form.businessName}
                  onChange={(e) => setField('businessName', e.target.value)}
                  disabled={submitting || !registrationOpen}
                  className="sm:col-span-2"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                Addresses
              </h2>
              <textarea
                placeholder="Permanent address *"
                rows={2}
                value={form.permanentAddress}
                onChange={(e) => setField('permanentAddress', e.target.value)}
                disabled={submitting || !registrationOpen}
                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.haveShop}
                  onChange={(e) => setField('haveShop', e.target.checked)}
                  disabled={submitting || !registrationOpen}
                />
                I have a shop / physical store
              </label>
              <textarea
                placeholder="Business address *"
                rows={2}
                value={form.businessAddress}
                onChange={(e) => setField('businessAddress', e.target.value)}
                disabled={submitting || !registrationOpen}
                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <textarea
                placeholder="Delivery address *"
                rows={2}
                value={form.deliveryAddress}
                onChange={(e) => setField('deliveryAddress', e.target.value)}
                disabled={submitting || !registrationOpen}
                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                Business
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Selling place from *"
                  value={form.sellingPlaceFrom}
                  onChange={(e) => setField('sellingPlaceFrom', e.target.value)}
                  disabled={submitting || !registrationOpen}
                />
                <Input
                  placeholder="Selling zone / city *"
                  value={form.sellingZoneCity}
                  onChange={(e) => setField('sellingZoneCity', e.target.value)}
                  disabled={submitting || !registrationOpen}
                />
                <Input
                  placeholder="Product category *"
                  value={form.productCategory}
                  onChange={(e) => setField('productCategory', e.target.value)}
                  disabled={submitting || !registrationOpen}
                />
                <Input
                  placeholder="Monthly estimated purchase (₹) *"
                  value={form.monthlyEstimatedPurchase}
                  onChange={(e) => setField('monthlyEstimatedPurchase', e.target.value)}
                  disabled={submitting || !registrationOpen}
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                Documents (optional URLs)
              </h2>
              <Input
                placeholder="ID proof URL (https://…)"
                value={form.idProofUrl}
                onChange={(e) => setField('idProofUrl', e.target.value)}
                disabled={submitting || !registrationOpen}
              />
              <Input
                placeholder="Business address proof URL (https://…)"
                value={form.businessAddressProofUrl}
                onChange={(e) => setField('businessAddressProofUrl', e.target.value)}
                disabled={submitting || !registrationOpen}
              />
            </section>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
              <Link to="/login" className="text-sm text-indigo-600 hover:underline">
                Already registered? Login
              </Link>
              <Button
                type="submit"
                disabled={submitting || !registrationOpen || loadingSettings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting
                  ? 'Processing…'
                  : `Pay ₹${amount != null ? Number(amount).toLocaleString('en-IN') : '—'} & submit`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
