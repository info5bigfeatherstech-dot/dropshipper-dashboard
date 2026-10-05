import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '../ui/form';
import {
  FileEdit,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Plus,
  Minus,
  ShieldCheck,
  RotateCcw,
  Clock,
  Search,
  Barcode,
  Hash,
  Trash2,
  ShoppingBag,
  PackageSearch,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ServiceabilityQuote,
  ServiceabilityCheckResponse,
  SelectedShippingPaymentMode
} from '../../types/dropshipper';
import { ServiceabilityQuotePicker } from '../shipping/ServiceabilityQuotePicker';
import { DEFAULT_WAREHOUSE_PINCODE } from '../../services/serviceabilityService';
import { ordersService, OrderQuoteResponse } from '../../services/ordersService';
import { productsService } from '../../services/productsService';
import { openRazorpayCheckout } from '../../utils/razorpay';

export interface SelectedOrderItem {
  product: Product;
  quantity: number;
}

interface FormErrors {
  product?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  buildingNo?: string;
  streetName?: string;
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const CreateOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    selectedProductForCreate,
    setSelectedProductForCreate,
    createOrder,
    setActiveOrderTab,
    addToast
  } = useStore();

  // Multi-product order state - starts empty unless explicitly passed via selectedProductForCreate
  const [orderItems, setOrderItems] = useState<SelectedOrderItem[]>(() => {
    return selectedProductForCreate ? [{ product: selectedProductForCreate, quantity: 1 }] : [];
  });

  // Single unified product search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Customer state - starts empty
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const location = useLocation();
  const prefill = (location.state as any) || {};

  // Address state (prefilled only if navigated from Serviceability tab)
  const [buildingNo, setBuildingNo] = useState(() => prefill.prefillBuilding || prefill.prefillAddress || '');
  const [streetName, setStreetName] = useState(() => prefill.prefillStreet || '');
  const [landmark, setLandmark] = useState(() => prefill.prefillLandmark || '');
  const [city, setCity] = useState(() => prefill.prefillCity || '');
  const [state, setState] = useState(() => prefill.prefillState || '');
  const [postalCode, setPostalCode] = useState(() => prefill.prefillPincode || '');
  const [country, setCountry] = useState('India');

  // Dropshipper Serviceability & Carrier Shipping State
  const [warehousePincode, setWarehousePincode] = useState(() => prefill.prefillWarehouse || DEFAULT_WAREHOUSE_PINCODE);
  const [selectedShippingPaymentMode, setSelectedShippingPaymentMode] =
    useState<SelectedShippingPaymentMode>('prepaid');
  const [selectedShippingQuote, setSelectedShippingQuote] =
    useState<ServiceabilityQuote | null>(() => prefill.prefillSelectedQuote || null);
  const [serviceabilityResponse, setServiceabilityResponse] =
    useState<ServiceabilityCheckResponse | null>(null);

  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);

  // ── Live Quote (POST /orders/quote) ───────────────────────────
  const [liveQuote, setLiveQuote] = useState<OrderQuoteResponse | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const quoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper: extract bare product code from SKU (e.g. "SKU-2928-1" → "2928-1")
  const extractProductCode = (sku: string): string => sku.replace(/^SKU-/i, '');

  // Sync if pre-selected product changes from store
  useEffect(() => {
    if (selectedProductForCreate) {
      setOrderItems((prev) => {
        const exists = prev.some((it) => it.product.id === selectedProductForCreate.id);
        if (exists) return prev;
        return [...prev, { product: selectedProductForCreate, quantity: 1 }];
      });
      // Clear from store so it does not persist on subsequent visits
      setSelectedProductForCreate(null);
    }
  }, [selectedProductForCreate, setSelectedProductForCreate]);

  // Load real catalog products if not yet loaded in store
  useEffect(() => {
    if (products.length === 0) {
      productsService.getProducts();
    }
  }, [products.length]);

  // ── Debounced POST /orders/quote ─────────────────────────────
  // Fires 600ms after items or pincode change if pincode is a valid 6-digit code.
  useEffect(() => {
    if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);

    const pincode = postalCode.trim();
    const hasItems = orderItems.length > 0;
    const validPin = /^\d{6}$/.test(pincode);

    if (!hasItems || !validPin) {
      setLiveQuote(null);
      return;
    }

    quoteTimerRef.current = setTimeout(async () => {
      setIsQuoteLoading(true);
      try {
        const quotePayload = {
          items: orderItems.map((it) => ({
            productCode: extractProductCode(it.product.sku),
            quantity: it.quantity
          })),
          customerPincode: pincode,
          warehousePincode: warehousePincode
        };
        const quote = await ordersService.getOrderQuote(quotePayload);
        setLiveQuote(quote);
      } catch (err) {
        console.warn('Quote fetch failed, using local calculation:', err);
        setLiveQuote(null);
      } finally {
        setIsQuoteLoading(false);
      }
    }, 600);

    return () => { if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current); };
  }, [orderItems, postalCode, warehousePincode]);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Filter products by Name, Product Code, or SKU
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const cleanQ = q.replace(/^sku-?/i, '');

    return products.filter((p) => {
      const catName = typeof p.category === 'object' && p.category !== null ? (p.category as any)?.name || '' : (p.category || '');
      const matchesName =
        (p.name || '').toLowerCase().includes(q) ||
        catName.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesCode =
        (p.sku || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(cleanQ) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p._id || '').toLowerCase().includes(q);

      return matchesName || matchesCode;
    });
  }, [products, searchQuery]);

  // Product selection & cart handlers
  const handleAddProduct = (product: Product, qty: number = 1) => {
    if (product.stockStatus === 'out_of_stock') {
      addToast({
        type: 'warning',
        title: 'Product Out of Stock',
        message: `${product.name} is currently out of stock.`
      });
      return;
    }

    setOrderItems((prev) => {
      const idx = prev.findIndex((it) => it.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        const maxStock = product.stock || 99;
        const newQty = Math.min(maxStock, updated[idx].quantity + qty);
        updated[idx] = { ...updated[idx], quantity: newQty };
        addToast({
          type: 'info',
          title: 'Quantity Updated',
          message: `Increased quantity for ${product.name} to ${newQty}.`
        });
        return updated;
      }

      addToast({
        type: 'success',
        title: 'Product Added to Order',
        message: `${product.name} (${product.sku}) added.`
      });
      return [...prev, { product, quantity: qty }];
    });

    setSearchQuery('');
    setIsSearchOpen(false);
    if (errors.product) {
      setErrors((prev) => ({ ...prev, product: undefined }));
    }
  };

  const handleManualAdd = () => {
    if (filteredProducts.length > 0) {
      handleAddProduct(filteredProducts[0], 1);
    } else {
      const term = searchQuery.trim();
      addToast({
        type: 'warning',
        title: 'No Matching Product',
        message: term
          ? `Could not find any catalog item matching "${term}".`
          : 'Please enter a product name, ID, or SKU code to search.'
      });
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setOrderItems((prev) => {
      const target = prev.find((item) => item.product.id === productId);
      if (!target) return prev;

      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        addToast({
          type: 'info',
          title: 'Product Removed',
          message: `${target.product.name} removed from order.`
        });
        return prev.filter((item) => item.product.id !== productId);
      }

      const maxStock = target.product.stock || 99;
      return prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(maxStock, newQty) }
          : item
      );
    });
  };

  const handleRemoveItem = (productId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.product.id !== productId));
    addToast({
      type: 'info',
      title: 'Item Removed',
      message: 'Product removed from this order.'
    });
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (orderItems.length === 0) {
      errs.product = 'Please add at least one product to the order.';
    }

    const trimmedName = customerName.trim();
    if (!trimmedName) {
      errs.customerName = 'Customer full name is required.';
    } else {
      const words = trimmedName.split(/\s+/).filter(Boolean);
      if (words.length < 2) {
        errs.customerName = 'Please enter at least First Name and Last Name (Middle Name is optional).';
      } else if (trimmedName.length > 50) {
        errs.customerName = `Full name cannot exceed 50 characters (currently ${trimmedName.length} characters).`;
      } else if (words.length > 50) {
        errs.customerName = 'Full name cannot exceed 50 words.';
      } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
        errs.customerName = 'Full name can only contain letters, spaces, hyphens, and periods.';
      }
    }

    const trimmedEmail = customerEmail.trim();
    if (!trimmedEmail) {
      errs.customerEmail = 'Customer email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errs.customerEmail = 'Please enter a valid email address (e.g. name@example.com).';
    }

    const trimmedPhone = customerPhone.trim();
    const phoneDigits = trimmedPhone.replace(/[^\d]/g, '');
    const localDigits = phoneDigits.startsWith('91') && phoneDigits.length === 12
      ? phoneDigits.slice(2)
      : phoneDigits;

    if (!trimmedPhone || localDigits.length === 0) {
      errs.customerPhone = 'Indian mobile phone number is required.';
    } else if (localDigits.length !== 10) {
      errs.customerPhone = 'Indian mobile number must be exactly 10 digits (+91).';
    } else if (!/^[6-9]/.test(localDigits)) {
      errs.customerPhone = 'Indian mobile number must start with 6, 7, 8, or 9.';
    }

    if (!buildingNo.trim()) {
      errs.buildingNo = 'Flat / House / Building number is required.';
    }

    if (!streetName.trim()) {
      errs.streetName = 'Street number or road name is required.';
    }

    if (!city.trim()) {
      errs.city = 'City is required.';
    }

    if (!state.trim()) {
      errs.state = 'State / Province is required.';
    }

    if (!postalCode.trim()) {
      errs.postalCode = 'Postal / Pincode is required.';
    } else if (!/^\d{6}$/.test(postalCode.trim())) {
      errs.postalCode = 'Please enter a valid 6-digit Indian delivery pincode (e.g. 110001).';
    } else if (serviceabilityResponse && !serviceabilityResponse.isDeliverable) {
      errs.postalCode = 'Destination pincode is not serviceable by courier partners.';
    }

    if (!country.trim()) {
      errs.country = 'Country is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();

    if (!validate()) {
      addToast({
        type: 'warning',
        title: 'Missing Required Fields',
        message: 'Please resolve highlighted form errors before proceeding.'
      });
      return;
    }

    setIsSubmitting(true);

    const finalShippingCharge = selectedShippingQuote ? selectedShippingQuote.deliveryCharges : 0;

    const cleanPhone = customerPhone.replace(/[^\d]/g, '').slice(-10);
    const line1Combined = [buildingNo.trim(), streetName.trim()].filter(Boolean).join(', ');
    const addressLine1 = line1Combined.length >= 10 ? line1Combined : `${line1Combined}, ${city.trim()}`;
    const addressLine2 = landmark.trim() || undefined;

    try {
      // 1. Prepare backend payload matching POST /api/dropshipper/orders
      const orderPayload = {
        items: orderItems.map((item) => ({
          productCode: extractProductCode(item.product.sku), // backend needs "2928-1" not "SKU-2928-1"
          sku: item.product.sku,
          quantity: item.quantity
        })),
        customer: {
          fullName: customerName.trim(),
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: cleanPhone,
          addressLine1,
          addressLine2
        },
        addressLine1,
        addressLine2,
        address: {
          fullName: customerName.trim(),
          phone: cleanPhone,
          houseNumber: buildingNo.trim() || '1',
          building: buildingNo.trim() || '',
          area: streetName.trim() || landmark.trim() || city.trim(),
          landmark: landmark.trim() || undefined,
          addressLine1,
          addressLine2,
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim() || 'India'
        },
        shippingAddress: {
          fullName: customerName.trim(),
          phone: cleanPhone,
          addressLine1,
          addressLine2,
          line1: addressLine1,
          line2: addressLine2,
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim() || 'India'
        },
        customerPincode: postalCode.trim(),
        warehousePincode: warehousePincode,
        paymentMethod: 'online' as const,
        notes: notes.trim() || undefined
      };

      // 2. Call backend POST /api/dropshipper/orders
      let backendResponse;
      try {
        backendResponse = await ordersService.createOrder(orderPayload);
      } catch (err: any) {
        setIsSubmitting(false);
        addToast({
          type: 'error',
          title: 'Order Creation Failed',
          message: err?.message || 'Server rejected order creation. Please check recipient address and details.'
        });
        return;
      }

      // 3. Launch Razorpay Checkout Modal for the backend order
      if (backendResponse?.razorpay) {
        addToast({
          type: 'info',
          title: 'Opening Razorpay Checkout',
          message: 'Complete the payment to confirm your order.'
        });

        await openRazorpayCheckout({
          keyId: backendResponse.razorpay.keyId,
          orderId: backendResponse.razorpay.orderId,
          internalOrderId: backendResponse.orderId || backendResponse.orderNumber || '',
          amount: backendResponse.razorpay.amount,
          currency: backendResponse.razorpay.currency || 'INR',
          name: 'OWB Dropship Fulfillment',
          description: `Payment for Order ${backendResponse.orderNumber || backendResponse.orderId}`,
          prefill: {
            name: customerName.trim(),
            email: customerEmail.trim(),
            contact: cleanPhone || customerPhone.trim()
          },
          onSuccess: (verification) => {
            setIsSubmitting(false);
            const newOrder = createOrder(
              {
                items: orderItems,
                customer: {
                  name: customerName.trim(),
                  email: customerEmail.trim(),
                  phone: cleanPhone
                },
                shippingAddress: {
                  line1: [buildingNo.trim(), streetName.trim()].filter(Boolean).join(', '),
                  line2: landmark.trim() || undefined,
                  city: city.trim(),
                  state: state.trim(),
                  postalCode: postalCode.trim(),
                  country: country.trim()
                },
                shippingCharges: finalShippingCharge,
                shippingPaymentMode: 'prepaid',
                estimatedDeliveryDays: selectedShippingQuote?.estimatedDays || '3–5',
                warehousePincode: warehousePincode,
                shippingProvider: selectedShippingQuote?.shippingProvider || 'shipmozo',
                notes: notes.trim() || undefined
              },
              false
            );

            if (backendResponse.orderNumber || backendResponse.orderId) {
              newOrder.orderNumber = backendResponse.orderNumber || backendResponse.orderId;
            }
            newOrder.status = 'approved';

            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            } catch {}

            addToast({
              type: 'success',
              title: 'Payment Successful & Order Placed',
              message: `Order ${newOrder.orderNumber} confirmed! Redirecting to All Orders...`,
              duration: 5000
            });

            // Redirect immediately to All Orders page where GET /orders is hit
            setActiveOrderTab('all');
            navigate('/orders', { replace: true, state: { newlyCreatedOrderId: newOrder.orderNumber } });
          },
          onError: (err) => {
            setIsSubmitting(false);
            addToast({
              type: 'error',
              title: 'Payment Failed / Incomplete',
              message: err?.message || 'Payment was not completed. Please try again.'
            });
          }
        });
      } else {
        setIsSubmitting(false);
        addToast({
          type: 'error',
          title: 'Payment Order Missing',
          message: 'Server did not return a Razorpay order. Please retry.'
        });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      addToast({
        type: 'error',
        title: 'Order Submission Error',
        message: err?.message || 'Failed to place order.'
      });
    }
  };

  const handleSaveDraft = () => {
    addToast({
      type: 'info',
      title: 'Draft Saved Locally',
      message: 'Your current order parameters have been saved to local workspace.'
    });
  };

  const handleResetForm = () => {
    setSubmittedOrder(null);
    setSelectedProductForCreate(null);
    setOrderItems([]);
    setSearchQuery('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setBuildingNo('');
    setStreetName('');
    setLandmark('');
    setCity('');
    setState('');
    setPostalCode('');
    setNotes('');
    setErrors({});
  };

  // Volumetric weight calculation based on items
  const computedWeightKg = useMemo(() => {
    let weight = 0;
    for (const item of orderItems) {
      const rawWeight = item.product.specs?.weight || '';
      let itemWeightKg = 0.5;
      if (rawWeight.toLowerCase().endsWith('kg')) {
        itemWeightKg = parseFloat(rawWeight) || 0.5;
      } else if (rawWeight.toLowerCase().endsWith('g')) {
        itemWeightKg = (parseFloat(rawWeight) || 500) / 1000;
      }
      weight += itemWeightKg * item.quantity;
    }
    return Math.max(0.05, Math.round(weight * 100) / 100);
  }, [orderItems]);

  // Calculations for live order summary
  const totalQuantity = orderItems.reduce((acc, it) => acc + it.quantity, 0);
  const productSubtotal = +orderItems
    .reduce((acc, it) => acc + it.product.dropshipPrice * it.quantity, 0)
    .toFixed(2);
  const shippingCharges = selectedShippingQuote ? selectedShippingQuote.deliveryCharges : 0;
  const totalCost = +(productSubtotal + shippingCharges).toFixed(2);
  const estimatedRevenue = +orderItems
    .reduce((acc, it) => acc + it.product.suggestedRetailPrice * it.quantity, 0)
    .toFixed(2);
  const estimatedProfit = Math.max(0, +(estimatedRevenue - totalCost).toFixed(2));

  // If submitted, show clean Confirmation Screen
  if (submittedOrder) {
    return (
      <Card className="rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-soft my-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-soft">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <Badge variant="warning" className="px-3 py-1 font-bold">
          Status: Pending Approval
        </Badge>

        <h3 className="text-2xl font-bold text-slate-900 mt-4 mb-2">
          Your order has been submitted!
        </h3>

        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
          Order <strong className="text-slate-900 font-mono">{submittedOrder.orderNumber}</strong> has been forwarded to the supplier dispatch queue with {totalQuantity} item(s) and is waiting for admin approval.
        </p>

        {/* Ordered items preview in confirmation */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 mb-6 text-left max-h-56 overflow-y-auto space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Dispatched Products ({orderItems.length})
          </p>
          {orderItems.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200/50 last:border-b-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={item.product.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{item.product.sku}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-slate-900">{item.quantity} × {formatCurrency(item.product.dropshipPrice)}</span>
                <span className="block text-[11px] font-semibold text-brand-600">{formatCurrency(item.product.dropshipPrice * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Auto-Admin Notice */}
        <div className="bg-brand-50/60 border border-brand-200/80 rounded-2xl p-4 text-xs text-brand-800 max-w-md mx-auto mb-8 flex items-start gap-3 text-left">
          <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Interactive Demo Notice</p>
            <p className="mt-0.5 text-slate-600">
              The automated admin simulation will verify inventory and update this order to Approved or Rejected in approximately 10 seconds.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => navigate('/orders')}
            className="w-full sm:w-auto px-6 py-2.5 h-auto text-sm"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <Button
            variant="outline"
            onClick={handleResetForm}
            className="w-full sm:w-auto px-5 py-2.5 h-auto text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            <span>Create Another Order</span>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Product Selection & Multi-Product Cart */}
          <Card className="p-5 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Products in Order
                  </h3>
                  <p className="text-xs text-slate-400">
                    Search by product name, product ID, or SKU code to add items
                  </p>
                </div>
              </div>

              {/* Reset Form Button */}
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleResetForm}
                className="h-8 gap-1.5 bg-white text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-rose-600"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </Button>
            </div>

            {/* Single Unified Product Search Bar */}
            <div className="space-y-4">
              <div className="relative" ref={searchContainerRef}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Single Search Input */}
                  <div className="sm:col-span-10 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-brand-600" />
                      <span>Product Search (Name, Product ID or SKU)</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search product name, product code or SKU (e.g. Toothbrush, 2928-1, SKU-2928-1)..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleManualAdd();
                          }
                        }}
                        className="pl-9 pr-3 text-xs sm:text-sm bg-white border-slate-200 focus:border-brand-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Add Product Button */}
                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      onClick={handleManualAdd}
                      className="w-full h-10 gap-1.5 font-bold shadow-soft"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </Button>
                  </div>
                </div>

                {/* Live Autocomplete Suggestions Dropdown */}
                {isSearchOpen && searchQuery.trim() && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-soft-xl overflow-hidden max-h-80 overflow-y-auto animate-in fade-in-50 zoom-in-95">
                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Matching Products ({filteredProducts.length})</span>
                      <span className="text-[10px] text-slate-400">Click item or press Add</span>
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        <PackageSearch className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">No matching products found</p>
                        <p className="mt-0.5 text-slate-400">Try searching with a different product name or SKU code</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredProducts.map((p) => {
                          const inCart = orderItems.find((it) => it.product.id === p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleAddProduct(p)}
                              className="flex items-center justify-between gap-3 p-3 hover:bg-brand-50/50 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={p.thumbnail}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-slate-900 group-hover:text-brand-600 truncate">
                                      {p.name}
                                    </span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                      {p.sku}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                    <span className="font-bold text-brand-600">
                                      {formatCurrency(p.dropshipPrice)}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {p.stockStatus === 'out_of_stock' ? 'Out of stock' : `${p.stock} in stock`}
                                    </span>
                                    <span>•</span>
                                    <span className="text-slate-400 capitalize">{p.category}</span>
                                  </div>
                                </div>
                              </div>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs font-semibold gap-1 shrink-0 border-slate-200 group-hover:border-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddProduct(p);
                                }}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{inCart ? `Add More (${inCart.quantity})` : 'Add'}</span>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>


              {errors.product && (
                <div className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold mt-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.product}</span>
                </div>
              )}

              {/* Selected Products Cart List */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Products in this Order ({orderItems.length})
                  </span>
                  {orderItems.length > 0 && (
                    <span className="font-semibold text-brand-600">
                      {totalQuantity} {totalQuantity === 1 ? 'unit' : 'units'} total • {formatCurrency(productSubtotal)}
                    </span>
                  )}
                </div>

                {orderItems.length === 0 ? (
                  <div className="py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No products added yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Search by product name, product code, or SKU above to add products to this order.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {orderItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 bg-white"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">
                                {item.product.sku}
                              </span>
                              <span className="text-[10px] text-slate-400 capitalize">
                                {typeof item.product.category === 'object' && item.product.category !== null ? (item.product.category as any)?.name : item.product.category}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-brand-600 font-semibold mt-0.5">
                              Dropship: {formatCurrency(item.product.dropshipPrice)}{' '}
                              <span className="text-slate-400 font-normal">
                                (MSRP: {formatCurrency(item.product.suggestedRetailPrice)})
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Quantity controls + Total + Remove */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                          {/* Stepper */}
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.product.id, -1)}
                              className={`h-7 w-7 rounded-lg transition-colors ${
                                item.quantity === 1
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                              title={item.quantity === 1 ? 'Remove from order' : 'Decrease quantity'}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <span className="w-8 text-center text-xs font-bold text-slate-900">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.product.id, 1)}
                              className="h-7 w-7 rounded-lg"
                              title="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[70px]">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Total</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {formatCurrency(item.product.dropshipPrice * item.quantity)}
                            </span>
                          </div>

                          {/* Remove Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                            title="Remove from order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Section 2: Customer Details */}
          <Card className="p-5 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Customer Details
                  </h3>
                  <p className="text-xs text-slate-400">
                    Recipient contact information for shipping status alerts
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Full Name */}
              <FormItem className="sm:col-span-12">
                <div className="flex items-center justify-between">
                  <FormLabel>Full Name *</FormLabel>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {customerName.length}/50 chars • {customerName.trim() ? customerName.trim().split(/\s+/).filter(Boolean).length : 0} words
                  </span>
                </div>
                <FormControl>
                  <Input
                    type="text"
                    maxLength={50}
                    placeholder="Enter recipient full name"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) {
                        setErrors((prev) => ({ ...prev, customerName: undefined }));
                      }
                    }}
                    className={errors.customerName ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.customerName ? (
                  <FormMessage>{errors.customerName}</FormMessage>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter full recipient name: First Name, optional Middle Name, and Last Name.
                  </p>
                )}
              </FormItem>

              {/* Email Address */}
              <FormItem className="sm:col-span-6">
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomerEmail(val);
                      if (errors.customerEmail && EMAIL_REGEX.test(val.trim())) {
                        setErrors((prev) => ({ ...prev, customerEmail: undefined }));
                      }
                    }}
                    onBlur={() => {
                      const val = customerEmail.trim();
                      if (val && !EMAIL_REGEX.test(val)) {
                        setErrors((prev) => ({
                          ...prev,
                          customerEmail: 'Please enter a valid email address (e.g. name@domain.com).'
                        }));
                      }
                    }}
                    className={errors.customerEmail ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.customerEmail && <FormMessage>{errors.customerEmail}</FormMessage>}
              </FormItem>

              {/* Phone Number */}
              <FormItem className="sm:col-span-6">
                <div className="flex items-center justify-between">
                  <FormLabel>Phone Number *</FormLabel>
                  <span className="text-[10px] text-brand-600 font-semibold flex items-center gap-1">
                    <span>🇮🇳</span>
                    <span>India (+91) only</span>
                  </span>
                </div>
                <FormControl>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 top-0 bottom-0 px-3 bg-slate-100 border-r border-slate-200 rounded-l-xl flex items-center gap-1.5 text-xs font-bold text-slate-700 select-none z-10">
                      <span className="text-sm">🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="98765 43210"
                      maxLength={11}
                      value={(() => {
                        const digits = customerPhone.replace(/[^\d]/g, '').slice(0, 10);
                        if (digits.length > 5) {
                          return `${digits.slice(0, 5)} ${digits.slice(5)}`;
                        }
                        return digits;
                      })()}
                      onChange={(e) => {
                        let raw = e.target.value.replace(/[^\d]/g, '');
                        // If user pastes number with +91 country code or leading 0
                        if (raw.startsWith('91') && raw.length > 10) {
                          raw = raw.slice(2);
                        } else if (raw.startsWith('0') && raw.length > 10) {
                          raw = raw.slice(1);
                        }
                        const digits = raw.slice(0, 10);
                        setCustomerPhone(digits);

                        if (errors.customerPhone && digits.length === 10 && /^[6-9]/.test(digits)) {
                          setErrors((prev) => ({ ...prev, customerPhone: undefined }));
                        }
                      }}
                      onBlur={() => {
                        const digits = customerPhone.replace(/[^\d]/g, '');
                        if (digits && (digits.length !== 10 || !/^[6-9]/.test(digits))) {
                          setErrors((prev) => ({
                            ...prev,
                            customerPhone: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
                          }));
                        }
                      }}
                      className={`pl-20 text-xs sm:text-sm font-mono tracking-wide ${errors.customerPhone ? 'border-rose-500' : ''}`}
                    />
                  </div>
                </FormControl>
                {errors.customerPhone ? (
                  <FormMessage>{errors.customerPhone}</FormMessage>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter 10-digit Indian mobile number starting with 6, 7, 8, or 9.
                  </p>
                )}
              </FormItem>
            </div>
          </Card>

          {/* Section 3: Shipping Address */}
          <Card className="p-5 sm:p-6 shadow-soft">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Shipping Destination
                </h3>
                <p className="text-xs text-slate-400">
                  Complete delivery address for customs and courier label generation
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Building / House / Flat No */}
              <FormItem className="sm:col-span-6">
                <FormLabel>Building No. / House / Flat No. *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g. Flat 402, Building 3B, Sunshine Apts"
                    value={buildingNo}
                    onChange={(e) => {
                      setBuildingNo(e.target.value);
                      if (errors.buildingNo) {
                        setErrors((prev) => ({ ...prev, buildingNo: undefined }));
                      }
                    }}
                    className={errors.buildingNo ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.buildingNo && <FormMessage>{errors.buildingNo}</FormMessage>}
              </FormItem>

              {/* Street Number / Road / Area */}
              <FormItem className="sm:col-span-6">
                <FormLabel>Street Number / Road / Area *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g. Street No. 5, MG Road, Sector 14"
                    value={streetName}
                    onChange={(e) => {
                      setStreetName(e.target.value);
                      if (errors.streetName) {
                        setErrors((prev) => ({ ...prev, streetName: undefined }));
                      }
                    }}
                    className={errors.streetName ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.streetName && <FormMessage>{errors.streetName}</FormMessage>}
              </FormItem>

              {/* Landmark (Optional) */}
              <FormItem className="sm:col-span-12">
                <FormLabel>Nearby Landmark (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g. Near City Hospital, Opposite Metro Pillar 120"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </FormControl>
              </FormItem>

              {/* City */}
              <FormItem className="sm:col-span-4">
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={errors.city ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.city && <FormMessage>{errors.city}</FormMessage>}
              </FormItem>

              {/* State */}
              <FormItem className="sm:col-span-4">
                <FormLabel>State / Province *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="State / Province"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={errors.state ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.state && <FormMessage>{errors.state}</FormMessage>}
              </FormItem>

              {/* Postal Code */}
              <FormItem className="sm:col-span-4">
                <FormLabel>Zip / Postal Code *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="6-digit Pincode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className={errors.postalCode ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.postalCode && <FormMessage>{errors.postalCode}</FormMessage>}
              </FormItem>


              {/* Serviceability & Dual Quote Picker Sub-module */}
              <div className="sm:col-span-12 pt-3 border-t border-slate-100">
                <ServiceabilityQuotePicker
                  customerPincode={postalCode}
                  onCustomerPincodeChange={(pin) => {
                    setPostalCode(pin);
                    if (errors.postalCode) {
                      setErrors((prev) => ({ ...prev, postalCode: undefined }));
                    }
                  }}
                  warehousePincode={warehousePincode}
                  onWarehousePincodeChange={setWarehousePincode}
                  weightKg={computedWeightKg}
                  orderAmount={productSubtotal}
                  selectedPaymentMode={selectedShippingPaymentMode}
                  onSelectPaymentMode={(mode, quote) => {
                    setSelectedShippingPaymentMode(mode);
                    setSelectedShippingQuote(quote);
                  }}
                  onServiceabilityResult={(res) => {
                    setServiceabilityResponse(res);
                    if (res && !res.isDeliverable) {
                      setErrors((prev) => ({
                        ...prev,
                        postalCode: 'Destination pincode is not serviceable by courier partners.'
                      }));
                    } else {
                      setErrors((prev) => ({ ...prev, postalCode: undefined }));
                    }
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Section 4: Notes / Instructions */}
          <Card className="p-5 sm:p-6 shadow-soft">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Fulfillment Notes (Optional)
                </h3>
                <p className="text-xs text-slate-400">
                  Packaging directions, carrier remarks or gift messages
                </p>
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="Special delivery instructions, carrier remarks or landmark directions (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900"
            />
          </Card>
        </div>

        {/* Right Sticky Column: Live Order Summary & Actions */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
          <Card className="p-5 shadow-soft">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
              Live Order Summary
            </h3>

            {orderItems.length > 0 ? (
              <div className="space-y-4">
                {/* List of items in summary */}
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {orderItems.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img
                        src={item.product.thumbnail}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.quantity} × {formatCurrency(item.product.dropshipPrice)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-800 shrink-0">
                        {formatCurrency(item.product.dropshipPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Products Subtotal ({totalQuantity} units):</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(productSubtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span>Shipping Service:</span>
                      {selectedShippingQuote && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold py-0 px-1.5 ${
                            selectedShippingPaymentMode === 'cod'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {selectedShippingPaymentMode === 'cod' ? 'COD' : 'Prepaid'}
                        </Badge>
                      )}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedShippingQuote
                        ? formatCurrency(selectedShippingQuote.deliveryCharges)
                        : 'Select pincode'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Transit Turnaround:</span>
                    <span className="font-medium text-slate-800">
                      {selectedShippingQuote
                        ? `${selectedShippingQuote.estimatedDays} business days`
                        : '3–5 business days'}
                    </span>
                  </div>

                  {selectedShippingQuote && (
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Carrier Provider:</span>
                      <span className="font-medium text-slate-600 truncate max-w-[130px]">
                        {selectedShippingQuote.courierName || 'Shiprocket'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Cost */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">
                        Total Dropship Cost
                      </span>
                      <p className="text-2xl font-black text-brand-600">
                        {formatCurrency(totalCost)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seller Profit Preview */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-emerald-800">
                      Est. Retail Margin:
                    </span>
                    <span className="font-extrabold text-emerald-600">
                      +{formatCurrency(estimatedProfit)}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-0.5">
                    Based on catalog MSRP retail pricing
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                Add products above to view live financial summary
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-100">
              <Button
                type="submit"
                disabled={isSubmitting || orderItems.length === 0}
                className="w-full py-3 h-auto rounded-xl text-xs sm:text-sm shadow-soft"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    <span>Submit Dropship Order ({totalQuantity} Units)</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="w-full py-2.5 h-auto rounded-xl text-xs font-semibold"
              >
                <FileEdit className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span>Save as Draft</span>
              </Button>
            </div>
          </Card>

          {/* Supplier Guarantee Callout */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-500 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              Your order is protected by our guaranteed wholesale dropship contract. Unfulfilled orders receive an instant 100% refund.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateOrderForm;
