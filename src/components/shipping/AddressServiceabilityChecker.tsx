import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  serviceabilityService,
  WAREHOUSE_HUBS,
  DEFAULT_WAREHOUSE_PINCODE
} from '../../services/serviceabilityService';
import {
  ServiceabilityCheckResponse
} from '../../types/dropshipper';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  MapPin,
  CreditCard,
  Banknote,
  Package,
  ArrowRight,
  ShieldCheck,
  Check,
  Calendar,
  Sparkles,
  Navigation
} from 'lucide-react';
import { formatCurrency, calculateDeliveryDate } from '../../utils/formatters';

export interface AddressServiceabilityCheckerProps {
  showBanner?: boolean;
}

const QUICK_TEST_PINCODES = [
  { pincode: '110001', city: 'New Delhi', state: 'Delhi', address: 'Connaught Place' },
  { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', address: 'Fort, South Mumbai' },
  { pincode: '560001', city: 'Bangalore', state: 'Karnataka', address: 'MG Road, Central' },
  { pincode: '700001', city: 'Kolkata', state: 'West Bengal', address: 'BBD Bagh' },
  { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', address: 'George Town' }
];

export const AddressServiceabilityChecker: React.FC<AddressServiceabilityCheckerProps> = ({
  showBanner = false
}) => {
  const navigate = useNavigate();

  // Form State
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');

  const [warehousePincode, setWarehousePincode] = useState(DEFAULT_WAREHOUSE_PINCODE);
  const [weightKg, setWeightKg] = useState<number>(0.5);
  const [lengthCm, setLengthCm] = useState<number>(10);
  const [widthCm, setWidthCm] = useState<number>(10);
  const [heightCm, setHeightCm] = useState<number>(5);
  const [orderAmount, setOrderAmount] = useState<number>(999);

  // Selected payment quote preview tab ('prepaid' | 'cod')
  const [selectedQuoteType, setSelectedQuoteType] = useState<'prepaid' | 'cod'>('prepaid');

  // Network & Result State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ServiceabilityCheckResponse | null>(null);

  const handleCheckServiceability = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanPin = customerPincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setErrorMsg('Please enter a valid 6-digit customer destination pincode (e.g. 110001).');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await serviceabilityService.checkServiceability({
        customerPincode: cleanPin,
        warehousePincode,
        weightKg: Math.max(0.05, Number(weightKg) || 0.5),
        lengthCm: Math.max(1, Number(lengthCm) || 10),
        widthCm: Math.max(1, Number(widthCm) || 10),
        heightCm: Math.max(1, Number(heightCm) || 5),
        paymentMode: 'both',
        orderAmount: Math.max(1, Number(orderAmount) || 999)
      });

      setResult(response);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to check route serviceability. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically check serviceability with debounce whenever a valid 6-digit pincode is entered
  useEffect(() => {
    const cleanPin = customerPincode.trim();
    if (/^\d{6}$/.test(cleanPin)) {
      const timer = setTimeout(() => {
        handleCheckServiceability();
      }, 350);
      return () => clearTimeout(timer);
    } else {
      if (cleanPin.length === 0) {
        setResult(null);
        setErrorMsg(null);
      }
    }
  }, [customerPincode, warehousePincode, weightKg, lengthCm, widthCm, heightCm, orderAmount]);

  const handleQuickFill = (preset: typeof QUICK_TEST_PINCODES[0]) => {
    setCustomerPincode(preset.pincode);
    setCity(preset.city);
    setStateName(preset.state);
    if (!addressLine) setAddressLine(preset.address);
  };

  const isDeliverable = result?.isDeliverable;
  const prepaidQuote = result?.quotes?.prepaid;
  const codQuote = result?.quotes?.cod;
  const selectedQuote = selectedQuoteType === 'prepaid' ? prepaidQuote : codQuote;
  const estimatedDays = result?.estimatedDays || selectedQuote?.estimatedDays || '3 Days';
  const expectedDeliveryDate = calculateDeliveryDate(estimatedDays);

  const selectedWarehouse = WAREHOUSE_HUBS.find((h) => h.pincode === warehousePincode);

  const fullAddressString = [
    addressLine.trim(),
    city.trim(),
    stateName.trim(),
    customerPincode.trim() ? `PIN: ${customerPincode.trim()}` : ''
  ]
    .filter(Boolean)
    .join(', ');

  const handleProceedToCreateOrder = () => {
    navigate('/orders/create', {
      state: {
        prefillPincode: customerPincode,
        prefillWarehouse: warehousePincode,
        prefillAddress: addressLine,
        prefillCity: city,
        prefillState: stateName,
        prefillWeight: weightKg,
        prefillSelectedQuote: selectedQuoteType === 'prepaid' ? prepaidQuote : codQuote
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Informative Header Banner */}
      {showBanner && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Customer Location & Serviceability Checker
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check whether the product can be delivered to the customer address and view estimated delivery days.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Input Form (Customer Address + Warehouse Specs) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-4 sm:p-5 border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  1. Customer Delivery Location
                </h4>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Step 1 of 2</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Customer Street Address / Area
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Flat 302, Green Avenue, Connaught Place"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    City
                  </label>
                  <Input
                    type="text"
                    placeholder="New Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    State
                  </label>
                  <Input
                    type="text"
                    placeholder="Delhi"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Pincode *
                  </label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="110001"
                    value={customerPincode}
                    onChange={(e) => setCustomerPincode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                    className="text-xs font-mono font-bold tracking-wider"
                    required
                  />
                </div>
              </div>

              {/* Live Deliverability Pill under Pincode */}
              <div className="pt-0.5">
                {isLoading && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking courier deliverability for pincode {customerPincode}...</span>
                  </div>
                )}
                {!isLoading && result && isDeliverable && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Delivery Available • Est. Delivery in {estimatedDays}</span>
                  </div>
                )}
                {!isLoading && result && !isDeliverable && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Delivery Not Available to Pincode {customerPincode}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  2. Warehouse & Package Specifications
                </h4>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Step 2 of 2</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Origin Fulfillment Warehouse
                </label>
                <Select
                  value={warehousePincode}
                  onValueChange={(val) => setWarehousePincode(val)}
                >
                  <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-slate-50 border-slate-200 text-slate-800 font-medium">
                    <SelectValue placeholder="Select warehouse hub" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg border-slate-200">
                    {WAREHOUSE_HUBS.map((hub) => (
                      <SelectItem key={hub.pincode} value={hub.pincode} className="text-xs">
                        {hub.pincode} — {hub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1 font-medium">Weight (Kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.05"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0.5)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1 font-medium">Length (cm)</label>
                  <Input
                    type="number"
                    min="1"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(parseInt(e.target.value, 10) || 10)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1 font-medium">Width (cm)</label>
                  <Input
                    type="number"
                    min="1"
                    value={widthCm}
                    onChange={(e) => setWidthCm(parseInt(e.target.value, 10) || 10)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1 font-medium">Height (cm)</label>
                  <Input
                    type="number"
                    min="1"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 5)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Estimated Order Value (₹) — Used for COD fee calculation
                </label>
                <Input
                  type="number"
                  min="1"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(parseFloat(e.target.value) || 999)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={() => handleCheckServiceability()}
              disabled={isLoading || customerPincode.trim().length !== 6}
              className="w-full mt-2 h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Checking Carrier Coverage & Calculating Rates...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Check Location Serviceability & Rates</span>
                </>
              )}
            </Button>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Live Deliverability Status & Estimated Days */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {!result && !isLoading && (
            <Card className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 border-dashed border-2 border-slate-200/90 text-center space-y-4 bg-slate-50/50 min-h-[380px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                <Navigation className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Check Delivery Availability & Estimated Days
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Enter the customer delivery address and 6-digit destination pincode on the left to verify courier deliverability and calculate the exact estimated delivery days.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2 w-full max-w-md">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Quick Test Common Pincodes:
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_TEST_PINCODES.map((preset) => (
                    <button
                      key={preset.pincode}
                      type="button"
                      onClick={() => handleQuickFill(preset)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 font-medium text-slate-700 transition-all shadow-xs"
                    >
                      {preset.pincode} ({preset.city})
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {isLoading && (
            <Card className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 border-slate-200 text-center space-y-3 min-h-[380px]">
              <RotateCw className="w-9 h-9 text-indigo-600 animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">
                Checking Deliverability to {customerPincode}...
              </h4>
              <p className="text-xs text-slate-400">
                Querying carrier logistics engine for route {warehousePincode} ➔ {customerPincode}
              </p>
            </Card>
          )}

          {result && !isLoading && (
            <div className="space-y-4 animate-in fade-in-50">
              {/* Deliverability Status Verdict Card */}
              {isDeliverable ? (
                <div className="rounded-2xl border-2 border-emerald-400/80 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/30 p-5 shadow-xs space-y-4">
                  {/* Top Status Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-emerald-950">
                            Delivery Available to this Address
                          </h3>
                          <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-2 uppercase font-mono font-bold">
                            Serviceable
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          {fullAddressString || `Pincode: ${result.customerPincode}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block">
                        Verified Carrier Route
                      </span>
                    </div>
                  </div>

                  {/* Prominent Estimated Days & ETA Highlight Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white/90 rounded-xl border border-emerald-200/80 shadow-xs">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        Estimated Delivery
                      </span>
                      <div className="text-2xl font-black text-emerald-900 tracking-tight">
                        {estimatedDays}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium block">
                        Standard Courier Transit
                      </span>
                    </div>

                    <div className="space-y-0.5 sm:border-l sm:border-slate-100 sm:pl-3">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        Expected Arrival
                      </span>
                      <div className="text-lg font-black text-slate-900 tracking-tight">
                        {expectedDeliveryDate}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Direct Doorstep Dispatch
                      </span>
                    </div>

                    <div className="space-y-0.5 sm:border-l sm:border-slate-100 sm:pl-3">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-500" />
                        Courier Partner
                      </span>
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {prepaidQuote?.courierName || result.shippingProvider}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Surface / Air Express
                      </span>
                    </div>
                  </div>

                  {/* Visual Route Progress Timeline */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between text-slate-700 font-semibold mb-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        Origin: {selectedWarehouse?.name || warehousePincode}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                        Destination: {city || 'Customer'} ({result.customerPincode})
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative flex items-center justify-between px-2 pt-2">
                      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-emerald-200 -z-0" />
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          1
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 font-medium">Warehouse</span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 font-medium">In Transit</span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 font-medium">Delivered ({estimatedDays})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3.5 text-xs text-rose-900 shadow-xs">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <XCircle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-rose-950">
                        Delivery Not Available to this Address
                      </h4>
                      <Badge className="bg-rose-600 text-white text-[10px] py-0 px-2 uppercase font-mono">
                        Not Serviceable
                      </Badge>
                    </div>
                    <p className="text-rose-700 text-xs leading-relaxed">
                      {result.message || `No courier partner is able to fulfill delivery to destination pincode ${result.customerPincode} from origin warehouse ${warehousePincode}.`}
                    </p>
                    <p className="text-[11px] text-rose-600 pt-1 font-medium">
                      Tip: Please verify the pincode or select a different fulfillment warehouse from the dropdown.
                    </p>
                  </div>
                </div>
              )}

              {/* Side-by-Side Quote Comparison: Prepaid vs COD */}
              {isDeliverable && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Rate Comparison: Prepaid vs Cash on Delivery (COD)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Click option to select
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Prepaid Quote Card */}
                    {prepaidQuote && (
                      <div
                        onClick={() => setSelectedQuoteType('prepaid')}
                        className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                          selectedQuoteType === 'prepaid'
                            ? 'bg-indigo-50/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        } ${!prepaidQuote.isDeliverable ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {selectedQuoteType === 'prepaid' && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Prepaid Shipping
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                              Lowest Cost
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-xl font-black text-slate-900">
                              {formatCurrency(prepaidQuote.deliveryCharges)}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">total rate</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {prepaidQuote.estimatedDays}
                          </span>
                        </div>

                        <div className="mt-2.5 text-[11px] text-slate-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Base Freight:</span>
                            <span className="font-mono">{formatCurrency(prepaidQuote.freightInr)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>COD Fee:</span>
                            <span className="font-mono text-emerald-600">₹0 (Free)</span>
                          </div>
                          {prepaidQuote.courierName && (
                            <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                              <span>Courier:</span>
                              <span className="font-medium text-slate-700 truncate max-w-[130px]">{prepaidQuote.courierName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. COD Quote Card */}
                    {codQuote && (
                      <div
                        onClick={() => setSelectedQuoteType('cod')}
                        className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                          selectedQuoteType === 'cod'
                            ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        } ${!codQuote.isDeliverable ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {selectedQuoteType === 'cod' && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Banknote className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Cash on Delivery (COD)
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              Pay on Delivery
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-xl font-black text-slate-900">
                              {formatCurrency(codQuote.deliveryCharges)}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">total rate</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {codQuote.estimatedDays}
                          </span>
                        </div>

                        <div className="mt-2.5 text-[11px] text-slate-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Base Freight:</span>
                            <span className="font-mono">{formatCurrency(codQuote.freightInr)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>COD Collection Fee:</span>
                            <span className="font-mono text-amber-700">{formatCurrency(codQuote.codFeeInr)}</span>
                          </div>
                          {codQuote.courierName && (
                            <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                              <span>Courier:</span>
                              <span className="font-medium text-slate-700 truncate max-w-[130px]">{codQuote.courierName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Proceed to Create Order with this Location */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handleProceedToCreateOrder}
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl gap-2 shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Proceed to Create Order for this Address ({selectedQuoteType.toUpperCase()})</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified destination address, route, and rate will be transferred directly to Order Fulfillment.</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressServiceabilityChecker;
