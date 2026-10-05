import React, { useState, useEffect } from 'react';
import {
  ServiceabilityCheckResponse,
  ServiceabilityQuote,
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
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { formatCurrency, calculateDeliveryDate } from '../../utils/formatters';

export interface ServiceabilityQuotePickerProps {
  customerPincode: string;
  onCustomerPincodeChange?: (pin: string) => void;
  warehouses?: Array<{ pincode: string; name: string }>;
  warehousePincode?: string;
  onWarehousePincodeChange?: (pin: string) => void;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  orderAmount?: number;
  selectedPaymentMode: SelectedShippingPaymentMode;
  onSelectPaymentMode: (
    mode: SelectedShippingPaymentMode,
    quote: ServiceabilityQuote | null
  ) => void;
  onServiceabilityResult?: (result: ServiceabilityCheckResponse | null) => void;
  showCustomPackageFields?: boolean;
}

export const ServiceabilityQuotePicker: React.FC<ServiceabilityQuotePickerProps> = ({
  customerPincode,
  onCustomerPincodeChange,
  warehouses,
  warehousePincode = DEFAULT_WAREHOUSE_PINCODE,
  onWarehousePincodeChange,
  weightKg = 0.5,
  lengthCm = 10,
  widthCm = 10,
  heightCm = 5,
  orderAmount = 999,
  selectedPaymentMode: _selectedPaymentMode,
  onSelectPaymentMode,
  onServiceabilityResult,
  showCustomPackageFields = true
}) => {
  const [internalWarehousePin, setInternalWarehousePin] = useState(warehousePincode);
  const [pkgWeight, setPkgWeight] = useState(weightKg);
  const [pkgLength, setPkgLength] = useState(lengthCm);
  const [pkgWidth, setPkgWidth] = useState(widthCm);
  const [pkgHeight, setPkgHeight] = useState(heightCm);
  const [showPackageDetails, setShowPackageDetails] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [serviceabilityData, setServiceabilityData] =
    useState<ServiceabilityCheckResponse | null>(null);

  // Sync external warehouse pin
  useEffect(() => {
    setInternalWarehousePin(warehousePincode);
  }, [warehousePincode]);

  // Sync external dimensions
  useEffect(() => {
    setPkgWeight(weightKg);
    setPkgLength(lengthCm);
    setPkgWidth(widthCm);
    setPkgHeight(heightCm);
  }, [weightKg, lengthCm, widthCm, heightCm]);

  // Auto trigger when 6 digits are typed
  useEffect(() => {
    const clean = customerPincode.trim();
    if (/^\d{6}$/.test(clean)) {
      handleCheckServiceability();
    } else {
      setServiceabilityData(null);
      setErrorMsg(null);
      if (onServiceabilityResult) onServiceabilityResult(null);
    }
  }, [customerPincode, internalWarehousePin, pkgWeight]);

  const handleCheckServiceability = async () => {
    const cleanCustomerPin = customerPincode.trim();
    if (!/^\d{6}$/.test(cleanCustomerPin)) {
      setErrorMsg('Please enter a valid 6-digit delivery pincode.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await serviceabilityService.checkServiceability({
        customerPincode: cleanCustomerPin,
        warehousePincode: internalWarehousePin,
        weightKg: pkgWeight,
        lengthCm: pkgLength,
        widthCm: pkgWidth,
        heightCm: pkgHeight,
        paymentMode: 'prepaid',
        orderAmount
      });

      setServiceabilityData(response);
      if (onServiceabilityResult) {
        onServiceabilityResult(response);
      }

      // Always assign the prepaid quote (dropshipper orders are prepaid only)
      const quote = response.quotes?.prepaid || null;
      onSelectPaymentMode('prepaid', quote);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to check serviceability for this route.');
      setServiceabilityData(null);
      if (onServiceabilityResult) onServiceabilityResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isDeliverable = serviceabilityData?.isDeliverable;
  const quote = serviceabilityData?.quotes?.prepaid;
  const courierName = quote?.courierName || serviceabilityData?.shippingProvider || 'Express Courier';
  const shippingFee = quote?.deliveryCharges ?? serviceabilityData?.deliveryCharges ?? 0;
  
  // Clean estimated days string (avoid "3 Days Business Days")
  const rawDays = quote?.estimatedDays || serviceabilityData?.estimatedDays || '3–4 Days';
  const displayDays = rawDays.toLowerCase().includes('day') ? rawDays : `${rawDays} Days`;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Shipping & Courier Rates
            </h4>
            <p className="text-xs text-slate-500">
              Real-time courier deliverability, ETA & lowest freight rates
            </p>
          </div>
        </div>

        {showCustomPackageFields && (
          <button
            type="button"
            onClick={() => setShowPackageDetails(!showPackageDetails)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 px-2.5 py-1 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Package ({pkgWeight}kg)</span>
            {showPackageDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Package Specs Drawer (Collapsible) */}
      {showPackageDetails && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <span className="font-semibold text-slate-700 block">
            Custom Package Dimensions & Weight
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Weight (Kg)</label>
              <Input
                type="number"
                step="0.05"
                min="0.05"
                value={pkgWeight}
                onChange={(e) => setPkgWeight(Math.max(0.05, parseFloat(e.target.value) || 0.5))}
                className="h-8 text-xs font-mono bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Length (cm)</label>
              <Input
                type="number"
                min="1"
                value={pkgLength}
                onChange={(e) => setPkgLength(Math.max(1, parseInt(e.target.value, 10) || 10))}
                className="h-8 text-xs font-mono bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Width (cm)</label>
              <Input
                type="number"
                min="1"
                value={pkgWidth}
                onChange={(e) => setPkgWidth(Math.max(1, parseInt(e.target.value, 10) || 10))}
                className="h-8 text-xs font-mono bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Height (cm)</label>
              <Input
                type="number"
                min="1"
                value={pkgHeight}
                onChange={(e) => setPkgHeight(Math.max(1, parseInt(e.target.value, 10) || 5))}
                className="h-8 text-xs font-mono bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pincode Input Row */}
      <div className={warehouses && warehouses.length > 0 ? 'grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1' : 'pt-1'}>
        {/* Origin Hub - Only displayed if provided dynamically from backend */}
        {warehouses && warehouses.length > 0 && (
          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Dispatch Warehouse</span>
            </label>
            <Select
              value={internalWarehousePin}
              onValueChange={(val) => {
                setInternalWarehousePin(val);
                if (onWarehousePincodeChange) onWarehousePincodeChange(val);
              }}
            >
              <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium">
                <SelectValue placeholder="Select warehouse hub" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl shadow-lg border-slate-200">
                {warehouses.map((hub) => (
                  <SelectItem key={hub.pincode} value={hub.pincode} className="text-xs">
                    {hub.pincode} — {hub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Customer Pincode Input */}
        <div className={warehouses && warehouses.length > 0 ? 'sm:col-span-6 space-y-1.5' : 'space-y-1.5'}>
          <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer Delivery Pincode</span>
            </span>
            <span className="text-[10px] text-slate-400">6 digits</span>
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              maxLength={6}
              placeholder="e.g. 110001"
              value={customerPincode}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
                if (onCustomerPincodeChange) onCustomerPincodeChange(cleaned);
              }}
              className="text-xs font-mono font-bold tracking-wider h-9 bg-slate-50 focus:bg-white flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCheckServiceability}
              disabled={isLoading || customerPincode.trim().length !== 6}
              className="h-9 px-4 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
            >
              {isLoading ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Check Rates</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-2.5 text-xs text-slate-600">
          <RotateCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Checking courier partner serviceability...</span>
        </div>
      )}

      {/* Results Card */}
      {!isLoading && serviceabilityData && (
        <div>
          {isDeliverable ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/40 border-2 border-emerald-300 shadow-xs space-y-3">
              {/* Deliverable verdict & ETA banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-emerald-200/70">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-emerald-950">
                        Delivery Available to {serviceabilityData.customerPincode}
                      </span>
                      <Badge className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider py-0">
                        Serviceable
                      </Badge>
                      <Badge variant="outline" className="bg-white/80 text-emerald-800 border-emerald-300 text-[10px] font-semibold py-0">
                        {courierName}
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-700 mt-0.5 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Direct courier fulfillment verified via {serviceabilityData.shippingProvider || 'Shipmozo Network'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:border-l sm:border-emerald-200/70 sm:pl-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                      Freight Charge
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(shippingFee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prominent Estimated Days & Expected Date Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                <div className="flex items-center gap-2.5 p-2.5 bg-white/90 rounded-xl border border-emerald-200/60 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                      Estimated Transit Time
                    </span>
                    <span className="text-sm font-black text-emerald-950">
                      {displayDays}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 bg-white/90 rounded-xl border border-emerald-200/60 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                      Expected Arrival
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      Arrives by {calculateDeliveryDate(rawDays)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 flex items-start gap-3 text-xs text-rose-900 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <XCircle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-rose-950">
                    Delivery Not Available to Pincode {serviceabilityData.customerPincode}
                  </span>
                  <Badge className="bg-rose-600 text-white text-[10px] py-0 px-1.5 uppercase font-mono">
                    Not Serviceable
                  </Badge>
                </div>
                <p className="text-rose-700 text-xs">
                  No active courier partner can deliver to this destination pincod from the selected origin warehouse.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
