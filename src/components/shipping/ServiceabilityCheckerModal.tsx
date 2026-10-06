import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ServiceabilityCheckResponse,
  SelectedShippingPaymentMode
} from '../../types/dropshipper';
import {
  serviceabilityService,
  DEFAULT_WAREHOUSE_PINCODE
} from '../../services/serviceabilityService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Truck,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  KeyRound,
  CreditCard,
  Banknote,
  Code2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ServiceabilityCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerPincode?: string;
  defaultWeightKg?: number;
  defaultOrderAmount?: number;
}

export const ServiceabilityCheckerModal: React.FC<ServiceabilityCheckerModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerPincode = '110001',
  defaultWeightKg = 0.5,
  defaultOrderAmount = 999
}) => {
  const [customerPin, setCustomerPin] = useState(defaultCustomerPincode);
  const [warehousePin, setWarehousePin] = useState(DEFAULT_WAREHOUSE_PINCODE);
  const [weightKg, setWeightKg] = useState(defaultWeightKg);
  const [lengthCm, setLengthCm] = useState(10);
  const [widthCm, setWidthCm] = useState(10);
  const [heightCm, setHeightCm] = useState(5);
  const [orderAmount, setOrderAmount] = useState(defaultOrderAmount);
  const [storefront, setStorefront] = useState<'ecomm' | 'wholesale'>('ecomm');

  const [staffToken, setStaffToken] = useState(() => serviceabilityService.getStaffToken());
  const [showTokenBar, setShowTokenBar] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ServiceabilityCheckResponse | null>(null);
  const [selectedQuoteMode, setSelectedQuoteMode] = useState<SelectedShippingPaymentMode>('prepaid');

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRunCheck = async () => {
    if (!/^\d{6}$/.test(customerPin.trim())) {
      setErrorMsg('Customer pincode must be exactly 6 digits.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const resp = await serviceabilityService.checkServiceability({
        customerPincode: customerPin.trim(),
        warehousePincode: warehousePin.trim(),
        weightKg,
        lengthCm,
        widthCm,
        heightCm,
        paymentMode: 'both',
        orderAmount,
        storefront
      });

      setResult(resp);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to check serviceability.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToken = () => {
    serviceabilityService.setStaffToken(staffToken);
    setShowTokenBar(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-soft-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-soft">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dropshipper Route Serviceability
              </h3>
              <p className="text-xs text-slate-400">
                Check warehouse to customer courier deliverability, ETA SLA, and shipping rates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Staff Auth Token Bar */}
          {showTokenBar && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <label className="font-medium text-slate-700 dark:text-slate-300 block">
                Staff Bearer Token (admin / product_manager / inventory_manager)
              </label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Paste JWT token here..."
                  value={staffToken}
                  onChange={(e) => setStaffToken(e.target.value)}
                  className="text-xs font-mono h-8"
                />
                <Button size="sm" onClick={handleSaveToken} className="h-8 px-3 text-xs">
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Pincode */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Customer Delivery Pincode *
              </label>
              <Input
                type="text"
                maxLength={6}
                placeholder="e.g. 110001"
                value={customerPin}
                onChange={(e) => setCustomerPin(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                className="font-mono font-bold tracking-wider"
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                <span className="text-slate-400">Try:</span>
                {[
                  { pin: '110001', label: 'Delhi' },
                  { pin: '400001', label: 'Mumbai' },
                  { pin: '560001', label: 'Bangalore' },
                  { pin: '999999', label: 'Undeliverable' }
                ].map((item) => (
                  <button
                    key={item.pin}
                    type="button"
                    onClick={() => setCustomerPin(item.pin)}
                    className="font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {item.pin} ({item.label})
                  </button>
                ))}
              </div>
            </div>

            {/* Warehouse Pincode */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Warehouse Pickup Pincode *
              </label>
              <Input
                type="text"
                maxLength={6}
                value={warehousePin}
                onChange={(e) => setWarehousePin(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                placeholder="e.g. 421004"
                className="font-mono text-xs"
              />
            </div>

            {/* Weight (Kg) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Weight (Kg)
              </label>
              <Input
                type="number"
                step="0.05"
                min="0.05"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(0.05, parseFloat(e.target.value) || 0.5))}
                className="font-mono"
              />
            </div>

            {/* Declared Order Amount (₹) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Order Value (₹) — for COD fees
              </label>
              <Input
                type="number"
                min="0"
                value={orderAmount}
                onChange={(e) => setOrderAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="font-mono"
              />
            </div>

            {/* Dimensions */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Package Dimensions (L × W × H in cm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Length"
                  min="1"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Math.max(1, parseInt(e.target.value, 10) || 10))}
                  className="font-mono text-xs"
                />
                <Input
                  type="number"
                  placeholder="Width"
                  min="1"
                  value={widthCm}
                  onChange={(e) => setWidthCm(Math.max(1, parseInt(e.target.value, 10) || 10))}
                  className="font-mono text-xs"
                />
                <Input
                  type="number"
                  placeholder="Height"
                  min="1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(1, parseInt(e.target.value, 10) || 5))}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleRunCheck}
            disabled={isLoading || customerPin.trim().length !== 6}
            className="w-full h-11 gap-2 font-bold shadow-soft"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Checking Route Serviceability...</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>Check Delivery & Get Quotes</span>
              </>
            )}
          </Button>

          {/* Results View */}
          {result && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in-50">
              {/* Deliverable Alert */}
              {result.isDeliverable ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                        Route Serviceable ({result.warehousePincode} ➔ {result.customerPincode})
                      </span>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        {result.message} via {result.shippingProvider.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1.5 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>ETA: {result.estimatedDays} Business Days</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-950 dark:text-rose-200">
                      Destination Not Serviceable
                    </span>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400">{result.message}</p>
                  </div>
                </div>
              )}

              {/* Quote Cards */}
              {result.isDeliverable && result.quotes && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Carrier Rate Quotes Comparison
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Prepaid Quote */}
                    {result.quotes.prepaid && (
                      <div
                        onClick={() => setSelectedQuoteMode('prepaid')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedQuoteMode === 'prepaid'
                            ? 'bg-brand-50/50 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20'
                            : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            Prepaid Delivery
                          </span>
                          {selectedQuoteMode === 'prepaid' && (
                            <Badge className="bg-brand-600 text-white text-[10px]">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {formatCurrency(result.quotes.prepaid.deliveryCharges)}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Freight:</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(result.quotes.prepaid.freightInr)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>COD Fee:</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">₹0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Courier:</span>
                            <span className="font-medium truncate max-w-[120px] text-slate-800 dark:text-slate-200">
                              {result.quotes.prepaid.courierName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>ETA:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{result.quotes.prepaid.estimatedDays} Days</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COD Quote */}
                    {result.quotes.cod && (
                      <div
                        onClick={() => setSelectedQuoteMode('cod')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedQuoteMode === 'cod'
                            ? 'bg-brand-50/50 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20'
                            : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            Cash on Delivery (COD)
                          </span>
                          {selectedQuoteMode === 'cod' && (
                            <Badge className="bg-brand-600 text-white text-[10px]">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {formatCurrency(result.quotes.cod.deliveryCharges)}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Freight:</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(result.quotes.cod.freightInr)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>COD Fee:</span>
                            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                              +{formatCurrency(result.quotes.cod.codFeeInr)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Courier:</span>
                            <span className="font-medium truncate max-w-[120px] text-slate-800 dark:text-slate-200">
                              {result.quotes.cod.courierName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>ETA:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{result.quotes.cod.estimatedDays} Days</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* JSON Viewer Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showRawJson ? 'Hide API Response JSON' : 'Inspect API Response JSON'}</span>
                  {showRawJson ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showRawJson && (
                  <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs dark:border-slate-700 dark:text-slate-300">
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
