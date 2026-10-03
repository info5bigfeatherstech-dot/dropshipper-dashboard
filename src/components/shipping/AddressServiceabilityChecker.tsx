import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  serviceabilityService,
  WAREHOUSE_HUBS,
  DEFAULT_WAREHOUSE_PINCODE
} from '../../services/serviceabilityService';
import {
  ServiceabilityCheckResponse,
  ServiceabilityQuote
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
  Building,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const AddressServiceabilityChecker: React.FC = () => {
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

  const isDeliverable = result?.isDeliverable;
  const prepaidQuote = result?.quotes?.prepaid;
  const codQuote = result?.quotes?.cod;

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
    <div className="space-y-6">
      {/* Informative Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Customer Location & Serviceability Checker
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check carrier delivery availability, calculate exact freight costs & compare Prepaid vs COD before placing orders.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto bg-slate-50 text-slate-700 text-xs px-3 py-1 font-mono">
            POST /api/dropshipper/serviceability/check
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (Customer Address + Warehouse Specs) */}
        <div className="lg:col-span-6 space-y-5">
          <Card className="p-5 border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">
                1. Customer Delivery Location
              </h4>
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
            </div>
          </Card>

          <Card className="p-5 border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">
                2. Warehouse & Package Specifications
              </h4>
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

        {/* Right Column: Live Rates & Deliverability Comparison */}
        <div className="lg:col-span-6 space-y-4">
          {!result && !isLoading && (
            <Card className="p-8 border-dashed border-2 border-slate-200/90 text-center space-y-3 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <Building className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Ready to Check Serviceability
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Fill in the customer delivery pincode and package details on the left, then click <strong>"Check Location Serviceability"</strong> to view real-time courier quotes and transit times.
              </p>
            </Card>
          )}

          {isLoading && (
            <Card className="p-8 border-slate-200 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">
                Querying Logistics Network...
              </h4>
              <p className="text-xs text-slate-400">
                Querying Shipmozo rate engine for route {warehousePincode} ➔ {customerPincode}
              </p>
            </Card>
          )}

          {result && !isLoading && (
            <div className="space-y-4 animate-in fade-in-50">
              {/* Deliverability Status Header */}
              {isDeliverable ? (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <span>Delivery Serviceable to Pincode {result.customerPincode}</span>
                        <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5 uppercase font-mono">
                          {result.shippingProvider}
                        </Badge>
                      </h4>
                      <p className="text-[11px] text-emerald-700">
                        {result.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100/70 px-3 py-1.5 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Est. Delivery: {result.estimatedDays}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="font-bold">Not Serviceable to Pincode {result.customerPincode}</h4>
                    <p className="text-rose-600 text-[11px] mt-0.5">
                      {result.message || 'No courier partner is able to fulfill delivery to this destination pincode.'}
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
                      <span>Create Order for this Location ({selectedQuoteType.toUpperCase()})</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Address and verified rates will be transferred directly to Order Fulfillment.</span>
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
