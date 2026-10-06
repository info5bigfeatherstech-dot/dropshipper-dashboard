import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AuthPageShell } from '../components/layout/AuthPageShell';
import {
  dropshipperAuthService,
  type DropshipperRegisterPayload,
  type RegistrationStatusResponse,
} from '../services/dropshipperAuthService';
import { loadRazorpayScript } from '../utils/razorpay';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Building2,
  UserCheck,
  Upload,
  FileImage,
} from 'lucide-react';

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
};

const PROOF_ACCEPT = 'image/jpeg,image/png,image/webp,image/jpg,application/pdf';
const PROOF_MAX_BYTES = 5 * 1024 * 1024;

function assertProofFile(file: File | null, label: string): string | null {
  if (!file) return `${label} is required`;
  if (file.size > PROOF_MAX_BYTES) return `${label} must be 5MB or smaller`;
  const okType =
    file.type === 'application/pdf' ||
    /^image\/(jpeg|jpg|png|webp)$/i.test(file.type) ||
    /\.(jpe?g|png|webp|pdf)$/i.test(file.name);
  if (!okType) return `${label} must be JPG, PNG, WEBP, or PDF`;
  return null;
}

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'status' ? 'status' : 'register';

  const [activeTab, setActiveTab] = useState<'register' | 'status'>(initialMode);
  const [settings, setSettings] = useState<{
    subscriptionAmountInr?: number;
    subscriptionYears?: number;
    registrationOpen?: boolean;
  } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [businessProofFile, setBusinessProofFile] = useState<File | null>(null);
  const [idProofPreview, setIdProofPreview] = useState<string | null>(null);
  const [businessProofPreview, setBusinessProofPreview] = useState<string | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ requestId?: string; message: string; email?: string; phone?: string } | null>(null);

  // Status check tab state
  const [statusRequestId, setStatusRequestId] = useState(searchParams.get('requestId') || '');
  const [statusIdentifier, setStatusIdentifier] = useState(searchParams.get('email') || searchParams.get('phone') || '');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusResult, setStatusResult] = useState<RegistrationStatusResponse | null>(null);

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

  const onPickProof = (
    kind: 'id' | 'business',
    file: File | null,
    setFile: (f: File | null) => void,
    previewUrl: string | null,
    setPreview: (url: string | null) => void
  ) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreview(null);
    if (!file) {
      setFile(null);
      return;
    }
    const err = assertProofFile(file, kind === 'id' ? 'ID proof' : 'Business address proof');
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setError('');
    setFile(file);
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (idProofPreview) URL.revokeObjectURL(idProofPreview);
      if (businessProofPreview) URL.revokeObjectURL(businessProofPreview);
    };
  }, [idProofPreview, businessProofPreview]);

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
    const idErr = assertProofFile(idProofFile, 'ID proof');
    if (idErr) {
      setError(idErr);
      return false;
    }
    const bizErr = assertProofFile(businessProofFile, 'Business address proof');
    if (bizErr) {
      setError(bizErr);
      return false;
    }
    return true;
  };

  const openRazorpay = (payData: any, applicantPayload: DropshipperRegisterPayload): Promise<any> =>
    new Promise(async (resolve, reject) => {
      const ok = await loadRazorpayScript();
      if (!ok || !(window as any).Razorpay) {
        reject(new Error('Could not load Razorpay Checkout script'));
        return;
      }
      const rz = payData?.razorpay || {};
      if (!rz.keyId || !rz.orderId) {
        reject(new Error('Payment order configuration missing from server'));
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: rz.keyId,
        amount: rz.amount,
        currency: rz.currency || 'INR',
        name: 'OfferwaleBaba Dropship',
        description: `Dropshipper subscription — ${years} year`,
        order_id: rz.orderId,
        prefill: {
          name: applicantPayload.fullName,
          email: applicantPayload.email,
          contact: applicantPayload.phone,
        },
        theme: { color: '#4F46E5' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verified = await dropshipperAuthService.verifyRegistrationPayment({
              requestId: payData.requestId || payData.request?.id,
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

      // Step 1: Pre-validate applicant & check fee preview (/auth/register/start)
      await dropshipperAuthService.startRegistration(payload);

      // Step 2: Multipart + Cloudinary proofs + Razorpay order
      const payData = await dropshipperAuthService.createRegistrationPayment(payload, {
        idProof: idProofFile!,
        businessAddressProof: businessProofFile!,
      });

      // Step 3: Open Razorpay & verify signature (/auth/register/verify-payment)
      const verified = await openRazorpay(payData, payload);
      const reqId = verified?.request?.id || payData.requestId || payData.request?.id;

      setDone({
        requestId: reqId,
        email: payload.email,
        phone: payload.phone,
        message:
          verified?.message ||
          'Payment verified successfully. Your application is now pending admin approval.',
      });
      setStatusRequestId(reqId || '');
      setStatusIdentifier(payload.email || payload.phone || '');
      setForm(EMPTY_FORM);
      setIdProofFile(null);
      setBusinessProofFile(null);
      setIdProofPreview((p) => {
        if (p) URL.revokeObjectURL(p);
        return null;
      });
      setBusinessProofPreview((p) => {
        if (p) URL.revokeObjectURL(p);
        return null;
      });
    } catch (err: any) {
      const msg = err?.message || 'Registration / payment failed';
      if (msg !== 'Payment cancelled') setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusError('');
    setStatusResult(null);

    const reqId = statusRequestId.trim();
    const idVal = statusIdentifier.trim();

    if (!reqId) {
      setStatusError('Please enter your Application / Request ID.');
      return;
    }
    if (!idVal) {
      setStatusError('Please enter your registered Email or Phone.');
      return;
    }

    const query: { email?: string; phone?: string } = {};
    if (idVal.includes('@')) query.email = idVal;
    else query.phone = idVal.replace(/\D/g, '').slice(-10);

    setStatusLoading(true);
    try {
      const res = await dropshipperAuthService.getRegistrationStatus(reqId, query);
      setStatusResult(res);
    } catch (err: any) {
      setStatusError(err?.message || 'Could not fetch application status. Verify your details.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3.5 h-3.5" /> Dropshipper Network
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeTab === 'register' ? 'Become a Verified Dropshipper' : 'Application Status'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeTab === 'register'
                ? `Join as an authorized dropshipper partner. Annual fee: ${
                    loadingSettings
                      ? '…'
                      : amount != null
                        ? `₹${Number(amount).toLocaleString('en-IN')} / ${years} year`
                        : 'Unavailable'
                  }`
                : 'Check the real-time review, payment, and approval status of your application.'}
            </p>
          </div>

          {/* Switch tabs button */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Apply Now
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('status');
                setError('');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'status'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Check Status
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400 flex items-start gap-3">
            <XCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        ) : null}

        {/* Status Check Tab */}
        {activeTab === 'status' ? (
          <div className="space-y-6">
            <form
              onSubmit={handleCheckStatus}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4"
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" />
                Track Application
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Request ID *
                  </label>
                  <Input
                    placeholder="e.g. 660f9e1234567890abcdef12"
                    value={statusRequestId}
                    onChange={(e) => setStatusRequestId(e.target.value)}
                    disabled={statusLoading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Registered Email or Phone *
                  </label>
                  <Input
                    placeholder="you@example.com or 10-digit phone"
                    value={statusIdentifier}
                    onChange={(e) => setStatusIdentifier(e.target.value)}
                    disabled={statusLoading}
                    required
                  />
                </div>
              </div>

              {statusError ? (
                <div className="p-3 rounded-lg bg-red-50 text-xs text-red-600 border border-red-200">
                  {statusError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={statusLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {statusLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Checking…
                    </>
                  ) : (
                    'Check Status'
                  )}
                </Button>
              </div>
            </form>

            {/* Status Display Card */}
            {statusResult?.request ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">
                      Request #{statusResult.request.id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {statusResult.request.fullName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {statusResult.request.email} • {statusResult.request.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {statusResult.nextStep === 'otp_and_password' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Approved by Admin
                      </span>
                    ) : statusResult.nextStep === 'rejected' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                        Pending Admin Approval
                      </span>
                    )}
                  </div>
                </div>

                {/* Workflow Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    className={`p-3.5 rounded-xl border ${
                      statusResult.request.payment?.status === 'paid'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      1. Payment Verified
                    </div>
                    <p className="text-[11px] text-slate-600">
                      ₹{statusResult.request.amountPaidInr || 800} paid via Razorpay
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border ${
                      statusResult.request.adminStatus === 'approved'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                        : statusResult.request.adminStatus === 'rejected'
                          ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                          : 'bg-amber-50/80 border-amber-200 text-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                      {statusResult.request.adminStatus === 'approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : statusResult.request.adminStatus === 'rejected' ? (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600" />
                      )}
                      2. Admin Verification
                    </div>
                    <p className="text-[11px]">
                      {statusResult.request.adminStatus === 'approved'
                        ? 'Documents & profile approved'
                        : statusResult.request.adminStatus === 'rejected'
                          ? statusResult.request.adminDecisionNote || 'Application rejected by team'
                          : 'Under verification by staff'}
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border ${
                      statusResult.nextStep === 'otp_and_password'
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      3. Account Activation
                    </div>
                    <p className="text-[11px]">
                      {statusResult.nextStep === 'otp_and_password'
                        ? 'Ready: verify OTP & create password'
                        : 'Unlocks after admin approval'}
                    </p>
                  </div>
                </div>

                {/* Next Step Action */}
                {statusResult.nextStep === 'otp_and_password' ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-950/40 dark:to-indigo-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        Ready to activate!
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Check your email for the activation OTP and set your password to begin selling.
                      </p>
                    </div>
                    <Link
                      to={`/activate?email=${encodeURIComponent(statusResult.request.email)}&phone=${encodeURIComponent(statusResult.request.phone)}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shrink-0 shadow-soft"
                    >
                      Activate Account Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Registration Flow */}
        {activeTab === 'register' && done ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-green-200 dark:border-green-900 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Payment Received &amp; Application Submitted!
                </h2>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  {done.message}
                </p>
              </div>
            </div>

            {done.requestId ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Application Request ID
                  </span>
                  <p className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 break-all select-all">
                    {done.requestId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(done.requestId || '');
                    alert('Request ID copied to clipboard');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline ml-2 shrink-0"
                >
                  Copy
                </button>
              </div>
            ) : null}

            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                What happens next?
              </h4>
              <ol className="text-xs text-slate-600 dark:text-slate-300 list-decimal pl-4 space-y-1">
                <li>Our admin team reviews your submitted documents and details.</li>
                <li>
                  Once approved, use{' '}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Check Status → Activate Account
                  </span>{' '}
                  with the OTP emailed to you.
                </li>
                <li>Set your password, then login — dashboard opens only after login.</li>
              </ol>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDone(null);
                  setActiveTab('status');
                  if (done.requestId) {
                    setStatusRequestId(done.requestId);
                    setStatusIdentifier(done.email || done.phone || '');
                  }
                }}
              >
                Track Status Now
              </Button>
              <p className="text-[11px] text-slate-500">
                Activate &amp; login links unlock after admin approval (check status).
              </p>
            </div>
          </div>
        ) : activeTab === 'register' ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xs"
          >
            {/* Section 1: Personal info */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Applicant Details
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <Input
                    placeholder="Enter full legal name"
                    value={form.fullName}
                    onChange={(e) => setField('fullName', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <Input
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    WhatsApp Number (10 digits) *
                  </label>
                  <Input
                    placeholder="9876543210"
                    value={form.whatsappNumber}
                    onChange={(e) => setField('whatsappNumber', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Business & Operations */}
            <section className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Business &amp; Operations
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Business / Store Name (Optional)
                  </label>
                  <Input
                    placeholder="Brand or Firm Name"
                    value={form.businessName}
                    onChange={(e) => setField('businessName', e.target.value)}
                    disabled={submitting || !registrationOpen}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Product Category *
                  </label>
                  <Input
                    placeholder="e.g. Sarees, Kurtis, Electronics"
                    value={form.productCategory}
                    onChange={(e) => setField('productCategory', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Monthly Estimated Purchase (₹) *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 50000"
                    value={form.monthlyEstimatedPurchase}
                    onChange={(e) => setField('monthlyEstimatedPurchase', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Selling Place From (State / City) *
                  </label>
                  <Input
                    placeholder="e.g. Gujarat / Surat"
                    value={form.sellingPlaceFrom}
                    onChange={(e) => setField('sellingPlaceFrom', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Target Selling Zone / City *
                  </label>
                  <Input
                    placeholder="e.g. All India / Metro cities"
                    value={form.sellingZoneCity}
                    onChange={(e) => setField('sellingZoneCity', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.haveShop}
                      onChange={(e) => setField('haveShop', e.target.checked)}
                      disabled={submitting || !registrationOpen}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    I operate a physical retail shop or showroom
                  </label>
                </div>
              </div>
            </section>

            {/* Section 3: Addresses */}
            <section className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  3. Address Verification
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Permanent Address *
                  </label>
                  <Input
                    placeholder="Street, City, State, PIN"
                    value={form.permanentAddress}
                    onChange={(e) => setField('permanentAddress', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Business Address *
                  </label>
                  <Input
                    placeholder="Office / Shop Address"
                    value={form.businessAddress}
                    onChange={(e) => setField('businessAddress', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Delivery / Warehouse Address *
                  </label>
                  <Input
                    placeholder="Default return or sample delivery address"
                    value={form.deliveryAddress}
                    onChange={(e) => setField('deliveryAddress', e.target.value)}
                    disabled={submitting || !registrationOpen}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Verification documents (Cloudinary upload) */}
            <section className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  4. Verification Documents *
                </h2>
              </div>
              <p className="text-[11px] text-slate-500">
                Upload clear images or PDF (max 5MB each). Files are stored securely on Cloudinary.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    ID Proof (Aadhaar / PAN) *
                  </label>
                  <label
                    className={`flex flex-col items-center justify-center gap-2 min-h-[120px] rounded-xl border-2 border-dashed px-3 py-4 cursor-pointer transition ${
                      idProofFile
                        ? 'border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300'
                    } ${submitting || !registrationOpen ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="file"
                      accept={PROOF_ACCEPT}
                      className="hidden"
                      disabled={submitting || !registrationOpen}
                      onChange={(e) =>
                        onPickProof(
                          'id',
                          e.target.files?.[0] || null,
                          setIdProofFile,
                          idProofPreview,
                          setIdProofPreview
                        )
                      }
                    />
                    {idProofPreview ? (
                      <img
                        src={idProofPreview}
                        alt="ID proof preview"
                        className="max-h-24 rounded-lg object-contain"
                      />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="text-xs text-slate-600 dark:text-slate-300 text-center flex items-center gap-1">
                      <FileImage className="w-3.5 h-3.5" />
                      {idProofFile ? idProofFile.name : 'Choose image or PDF'}
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Business Address Proof (GST / Bill) *
                  </label>
                  <label
                    className={`flex flex-col items-center justify-center gap-2 min-h-[120px] rounded-xl border-2 border-dashed px-3 py-4 cursor-pointer transition ${
                      businessProofFile
                        ? 'border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300'
                    } ${submitting || !registrationOpen ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="file"
                      accept={PROOF_ACCEPT}
                      className="hidden"
                      disabled={submitting || !registrationOpen}
                      onChange={(e) =>
                        onPickProof(
                          'business',
                          e.target.files?.[0] || null,
                          setBusinessProofFile,
                          businessProofPreview,
                          setBusinessProofPreview
                        )
                      }
                    />
                    {businessProofPreview ? (
                      <img
                        src={businessProofPreview}
                        alt="Business proof preview"
                        className="max-h-24 rounded-lg object-contain"
                      />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="text-xs text-slate-600 dark:text-slate-300 text-center flex items-center gap-1">
                      <FileImage className="w-3.5 h-3.5" />
                      {businessProofFile ? businessProofFile.name : 'Choose image or PDF'}
                    </span>
                  </label>
                </div>
              </div>
            </section>

            {/* Fee Summary & Payment CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Annual Dropshipper Subscription</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {amount != null ? `₹${Number(amount).toLocaleString('en-IN')}` : '₹800'}{' '}
                    <span className="text-xs font-normal text-slate-400">/ {years} Year</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Secure
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || !registrationOpen || loadingSettings}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-soft transition-all"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Uploading proofs &amp; launching Razorpay…
                  </>
                ) : (
                  `Pay ₹${amount != null ? Number(amount).toLocaleString('en-IN') : '800'} & Submit Application`
                )}
              </Button>
            </div>
          </form>
        ) : null}

        {/* Footer Navigation — no dashboard link; activate only after approval, then login */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-2">
          <p>
            Already approved by admin?{' '}
            <Link to="/activate" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Activate with OTP
            </Link>
            {' · '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Login
            </Link>
          </p>
          <p className="text-[10px] text-slate-400">
            Seller dashboard opens only after OTP activation and successful login.
          </p>
        </div>
      </div>
    </AuthPageShell>
  );
};

export default RegisterPage;
