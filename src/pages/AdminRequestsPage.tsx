import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminDropshipperService,
  getStaffToken,
  setStaffToken,
  type AdminDropshipperRequest,
} from '../services/adminDropshipperService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  ExternalLink,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<AdminDropshipperRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Staff token config modal/bar
  const [staffTokenInput, setStaffTokenInput] = useState(getStaffToken());
  const [showTokenSettings, setShowTokenSettings] = useState(false);
  const [tokenSavedMsg, setTokenSavedMsg] = useState('');

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AdminDropshipperRequest | null>(null);
  const [noteModal, setNoteModal] = useState<{
    type: 'approve' | 'reject';
    requestId: string;
    applicantName: string;
  } | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminDropshipperService.listRequests({
        adminStatus: activeTab,
        q: searchQuery,
      });
      setRequests(res.requests || []);
    } catch (err: any) {
      setError(
        err?.message ||
          'Failed to load dropshipper requests. Ensure backend is running and valid staff token is configured.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffToken(staffTokenInput.trim());
    setTokenSavedMsg('Staff token saved to local session!');
    setTimeout(() => setTokenSavedMsg(''), 3000);
    fetchRequests();
  };

  const handleApprove = async (id: string, note?: string) => {
    setActionLoadingId(id);
    setError('');
    try {
      await adminDropshipperService.approveRequest(id, note);
      setNoteModal(null);
      setDecisionNote('');
      await fetchRequests();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    setActionLoadingId(id);
    setError('');
    try {
      await adminDropshipperService.rejectRequest(id, reason);
      setNoteModal(null);
      setDecisionNote('');
      await fetchRequests();
    } catch (err: any) {
      setError(err?.message || 'Failed to reject request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const pendingCount = requests.filter((r) => r.adminStatus === 'pending').length;
  const approvedCount = requests.filter((r) => r.adminStatus === 'approved').length;
  const rejectedCount = requests.filter((r) => r.adminStatus === 'rejected').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Staff Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dropshipper Applications &amp; Approvals
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review paid registration requests, approve/reject applicants, and verify fee receipts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowTokenSettings(!showTokenSettings)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              Staff Token
            </button>
            <Button
              onClick={fetchRequests}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Staff Token Panel */}
        {showTokenSettings && (
          <form
            onSubmit={handleSaveToken}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" /> Staff JWT Token Configuration
              </h3>
              <span className="text-[11px] text-slate-400">
                Required for <code>/api/admin/dropshipper/*</code> routes
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={staffTokenInput}
                onChange={(e) => setStaffTokenInput(e.target.value)}
                className="font-mono text-xs flex-1"
              />
              <Button type="submit" size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                Save Token
              </Button>
            </div>
            {tokenSavedMsg && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {tokenSavedMsg}
              </p>
            )}
          </form>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{error}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Tip: Check your Staff JWT Token configuration above or verify that the backend is running on port 8081.
              </p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Filtered</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{requests.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 shadow-xs">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Pending Review</span>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-1">{pendingCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 shadow-xs">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Approved</span>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">{approvedCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 shadow-xs">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Rejected</span>
            <p className="text-2xl font-bold text-rose-900 dark:text-rose-300 mt-1">{rejectedCount}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab === 'all' ? 'All Requests' : tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 min-w-[280px]">
            <Input
              placeholder="Search name, phone, email, ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-9"
            />
            <Button type="submit" size="sm" variant="outline" className="h-9 px-3">
              <Search className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Loading dropshipper requests…
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              No requests found in this view
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no {activeTab !== 'all' ? activeTab : ''} dropshipper requests matching your search.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline"
            >
              Submit a test registration <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isPaid = req.payment?.status === 'paid';
              return (
                <div
                  key={req.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {req.fullName}
                        </h3>
                        {req.businessName && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                            {req.businessName}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">
                          #{req.id.slice(-6)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {req.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {req.phone}
                        </span>
                        {req.whatsappNumber && (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            WA: {req.whatsappNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {req.adminStatus === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
                        </span>
                      ) : req.adminStatus === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Pending Approval
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Application Details Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 font-medium">Category</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {req.application?.productCategory || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Monthly Estimate</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {req.application?.monthlyEstimatedPurchase
                          ? `₹${Number(req.application.monthlyEstimatedPurchase).toLocaleString('en-IN')}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Fee Paid</span>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{req.amountPaidInr || 800} (1 Year)
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Payment ID</span>
                      <p className="font-mono text-slate-700 dark:text-slate-300 truncate" title={req.payment?.razorpayPaymentId}>
                        {req.payment?.razorpayPaymentId || 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Decision Note (if approved/rejected) */}
                  {req.adminDecisionNote && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                      <strong>Admin Note:</strong> {req.adminDecisionNote}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(req)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Full Application Form
                    </button>

                    <div className="flex items-center gap-2">
                      {req.adminStatus === 'pending' ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            disabled={actionLoadingId === req.id}
                            onClick={() =>
                              setNoteModal({
                                type: 'reject',
                                requestId: req.id,
                                applicantName: req.fullName,
                              })
                            }
                            variant="outline"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs h-8"
                          >
                            Reject
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={actionLoadingId === req.id}
                            onClick={() =>
                              setNoteModal({
                                type: 'approve',
                                requestId: req.id,
                                applicantName: req.fullName,
                              })
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-xs"
                          >
                            {actionLoadingId === req.id ? 'Approving…' : 'Approve Application'}
                          </Button>
                        </>
                      ) : req.adminStatus === 'approved' ? (
                        <Link
                          to={`/activate?email=${encodeURIComponent(req.email)}&phone=${encodeURIComponent(req.phone)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100"
                        >
                          Test Activation <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Approve / Reject Note Modal */}
        {noteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {noteModal.type === 'approve'
                  ? `Approve Application for ${noteModal.applicantName}`
                  : `Reject Application for ${noteModal.applicantName}`}
              </h3>
              <p className="text-xs text-slate-500">
                {noteModal.type === 'approve'
                  ? 'Approving marks this dropshipper ready for OTP activation and 1-year subscription.'
                  : 'Please state the reason for rejecting this dropshipper application.'}
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Decision Note {noteModal.type === 'reject' ? '(Required)' : '(Optional)'}
                </label>
                <Input
                  placeholder={
                    noteModal.type === 'approve'
                      ? 'e.g. Verified Surat textile distributor'
                      : 'e.g. Incomplete business address proof'
                  }
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  className="text-xs"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNoteModal(null);
                    setDecisionNote('');
                  }}
                >
                  Cancel
                </Button>
                {noteModal.type === 'approve' ? (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApprove(noteModal.requestId, decisionNote)}
                  >
                    Confirm Approval
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    onClick={() => handleReject(noteModal.requestId, decisionNote)}
                  >
                    Confirm Rejection
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full Application Drawer / Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Application Details — {selectedRequest.fullName}
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <div>
                    <span className="text-slate-400">Email</span>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone</span>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">WhatsApp</span>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRequest.whatsappNumber || 'Same'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Selling Territory</span>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRequest.application?.sellingZoneCity || 'All India'}</p>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Permanent Address</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedRequest.application?.permanentAddress || 'N/A'}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Business Address</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedRequest.application?.businessAddress || 'N/A'}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Delivery / Return Address</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedRequest.application?.deliveryAddress || 'N/A'}</p>
                </div>

                {selectedRequest.application?.idProofUrl && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">ID Proof Link</span>
                    <p>
                      <a
                        href={selectedRequest.application.idProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 underline"
                      >
                        {selectedRequest.application.idProofUrl}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequestsPage;
