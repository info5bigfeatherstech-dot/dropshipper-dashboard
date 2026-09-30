import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
  Truck,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FormErrors {
  product?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export const CreateOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    selectedProductForCreate,
    setSelectedProductForCreate,
    createOrder,
    addToast
  } = useStore();

  // Form state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    selectedProductForCreate || products[0] || null
  );
  const [quantity, setQuantity] = useState(1);

  // Customer state
  const [salutation, setSalutation] = useState('Ms.');
  const [customerName, setCustomerName] = useState('Sarah Jenkins');
  const [customerEmail, setCustomerEmail] = useState('sarah.jenkins@example.com');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 349-8821');

  // Address state
  const [line1, setLine1] = useState('452 Market Street');
  const [line2, setLine2] = useState('Apt 12C');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [postalCode, setPostalCode] = useState('94105');
  const [country, setCountry] = useState('United States');

  // Shipping & Fulfillment state (using shadcn Select dropdowns)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');
  const [warehouseHub, setWarehouseHub] = useState('us-west');
  const [priorityTier, setPriorityTier] = useState('normal');

  const [notes, setNotes] = useState('Handle with care. Leave at package locker if unavailable.');

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);

  // Sync if pre-selected product changes from store
  useEffect(() => {
    if (selectedProductForCreate) {
      setSelectedProduct(selectedProductForCreate);
    }
  }, [selectedProductForCreate]);

  // Shipping cost mapping
  const shippingFees = {
    standard: 0.00,
    express: 4.99,
    overnight: 9.99
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!selectedProduct) {
      errs.product = 'Please select a valid in-stock product.';
    }

    if (!customerName.trim()) {
      errs.customerName = 'Customer full name is required.';
    }

    if (!customerEmail.trim()) {
      errs.customerEmail = 'Customer email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      errs.customerEmail = 'Please enter a valid email address.';
    }

    if (!customerPhone.trim()) {
      errs.customerPhone = 'Contact phone number is required.';
    }

    if (!line1.trim()) {
      errs.line1 = 'Shipping address line 1 is required.';
    }

    if (!city.trim()) {
      errs.city = 'City is required.';
    }

    if (!state.trim()) {
      errs.state = 'State / Province is required.';
    }

    if (!postalCode.trim()) {
      errs.postalCode = 'Postal / Zip code is required.';
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

    // Simulate 600ms API saving delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newOrder = createOrder(
      {
        product: selectedProduct!,
        quantity,
        customer: {
          name: `${salutation} ${customerName.trim()}`,
          email: customerEmail.trim(),
          phone: customerPhone.trim()
        },
        shippingAddress: {
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim()
        },
        notes: notes.trim()
          ? `${notes.trim()} [Method: ${shippingMethod.toUpperCase()}, Hub: ${warehouseHub.toUpperCase()}, Priority: ${priorityTier.toUpperCase()}]`
          : undefined
      },
      isDraft
    );

    setIsSubmitting(false);
    setSubmittedOrder(newOrder);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    addToast({
      type: 'success',
      title: 'Order Submitted Successfully',
      message: `Order ${newOrder.orderNumber} placed. Queued for admin verification.`,
      duration: 5000
    });
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
    setQuantity(1);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setLine1('');
    setLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setNotes('');
  };

  // Quick Template Fillers
  const fillSampleTemplate = (type: 'us' | 'ca' | 'uk') => {
    if (type === 'us') {
      setSalutation('Ms.');
      setCustomerName('Sarah Jenkins');
      setCustomerEmail('sarah.jenkins@example.com');
      setCustomerPhone('+1 (555) 349-8821');
      setLine1('452 Market Street');
      setLine2('Apt 12C');
      setCity('San Francisco');
      setState('CA');
      setPostalCode('94105');
      setCountry('United States');
      setShippingMethod('standard');
      setWarehouseHub('us-west');
      setPriorityTier('normal');
    } else if (type === 'ca') {
      setSalutation('Mr.');
      setCustomerName('Liam Vance');
      setCustomerEmail('liam.vance@vancetech.ca');
      setCustomerPhone('+1 (416) 555-0199');
      setLine1('100 King Street West');
      setLine2('Suite 2400');
      setCity('Toronto');
      setState('ON');
      setPostalCode('M5X 1A9');
      setCountry('Canada');
      setShippingMethod('express');
      setWarehouseHub('us-east');
      setPriorityTier('urgent');
    } else if (type === 'uk') {
      setSalutation('Dr.');
      setCustomerName('Emma Watson');
      setCustomerEmail('emma.watson@oxfordalumni.org');
      setCustomerPhone('+44 20 7946 0912');
      setLine1('221B Baker Street');
      setLine2('Flat 2');
      setCity('London');
      setState('Greater London');
      setPostalCode('NW1 6XE');
      setCountry('United Kingdom');
      setShippingMethod('express');
      setWarehouseHub('eu-central');
      setPriorityTier('normal');
    }
    addToast({
      type: 'info',
      title: 'Template Populated',
      message: `Form filled with ${type.toUpperCase()} test customer data.`
    });
  };

  // Calculations for live order summary
  const unitDropshipPrice = selectedProduct?.dropshipPrice || 0;
  const unitMSRP = selectedProduct?.suggestedRetailPrice || 0;
  const productSubtotal = +(unitDropshipPrice * quantity).toFixed(2);
  const shippingFee = shippingFees[shippingMethod];
  const totalCost = +(productSubtotal + shippingFee).toFixed(2);
  const estimatedRevenue = +(unitMSRP * quantity).toFixed(2);
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
          Order <strong className="text-slate-900 font-mono">{submittedOrder.orderNumber}</strong> has been forwarded to the supplier dispatch queue and is waiting for admin approval.
        </p>

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
      {/* Top Banner highlighting shadcn components */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-brand-50/80 via-white to-indigo-50/50 border border-brand-200/70 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-ping" />
          <span className="text-xs font-bold text-brand-900">
            shadcn/ui Form & Dropdown System
          </span>
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <Badge variant="outline" className="text-[10px] bg-white border-brand-200 text-brand-700 font-medium">
              shadcn Select
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-white border-brand-200 text-brand-700 font-medium">
              shadcn FormItem
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-white border-brand-200 text-brand-700 font-medium">
              shadcn DropdownMenu
            </Badge>
          </div>
        </div>

        {/* Quick Template DropdownMenu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" type="button" className="h-8 gap-1.5 bg-white text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
              <span>⚡ Quick Templates</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 shadow-soft-lg">
            <DropdownMenuLabel>Auto-Fill Test Customer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => fillSampleTemplate('us')}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              <span>United States (San Francisco)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fillSampleTemplate('ca')}>
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              <span>Canada (Toronto, ON)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fillSampleTemplate('uk')}>
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
              <span>United Kingdom (London)</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleResetForm} className="text-rose-600 focus:text-rose-700">
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              <span>Reset All Fields</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Product Selection using shadcn Select */}
          <Card className="p-5 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Product Selection & Units
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select catalog item to dispatch to customer
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">
                shadcn Select
              </Badge>
            </div>

            {/* Product Picker using shadcn Select */}
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Select Catalog Product *</FormLabel>
                <FormControl>
                  <Select
                    value={selectedProduct?.id || ''}
                    onValueChange={(val) => {
                      const found = products.find((p) => p.id === val);
                      if (found) setSelectedProduct(found);
                    }}
                  >
                    <SelectTrigger className={`w-full ${errors.product ? 'border-rose-500' : ''}`}>
                      <SelectValue placeholder="Choose a product to dropship..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {products.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          disabled={p.stockStatus === 'out_of_stock'}
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <span className="font-medium text-slate-900 truncate">
                              {p.name}
                            </span>
                            <span className="text-xs font-bold text-brand-600 shrink-0">
                              {formatCurrency(p.dropshipPrice)}{' '}
                              <span className="text-[11px] font-normal text-slate-400">
                                ({p.stockStatus === 'out_of_stock' ? 'Out of stock' : `${p.stock} left`})
                              </span>
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                {errors.product && (
                  <FormMessage>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.product}</span>
                  </FormMessage>
                )}
              </FormItem>

              {/* Selected Product Card Preview */}
              {selectedProduct && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <img
                    src={selectedProduct.thumbnail}
                    alt={selectedProduct.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedProduct.sku}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {selectedProduct.name}
                    </h4>
                    <p className="text-xs text-brand-600 font-semibold mt-0.5">
                      Dropship Cost: {formatCurrency(selectedProduct.dropshipPrice)}{' '}
                      <span className="text-slate-400 font-normal">
                        (MSRP: {formatCurrency(selectedProduct.suggestedRetailPrice)})
                      </span>
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-7 w-7 rounded-lg"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setQuantity(Math.min(selectedProduct.stock || 99, quantity + 1))
                      }
                      className="h-7 w-7 rounded-lg"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Section 2: Customer Details using shadcn Form components & Select */}
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
              <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">
                shadcn Form
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Customer Salutation Dropdown (shadcn Select) */}
              <FormItem className="sm:col-span-3">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Select value={salutation} onValueChange={setSalutation}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Mx.">Mx.</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>

              {/* Full Name */}
              <FormItem className="sm:col-span-9">
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={errors.customerName ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.customerName && <FormMessage>{errors.customerName}</FormMessage>}
              </FormItem>

              {/* Email Address */}
              <FormItem className="sm:col-span-6">
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jane.doe@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={errors.customerEmail ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.customerEmail && <FormMessage>{errors.customerEmail}</FormMessage>}
              </FormItem>

              {/* Phone Number */}
              <FormItem className="sm:col-span-6">
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={errors.customerPhone ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.customerPhone && <FormMessage>{errors.customerPhone}</FormMessage>}
              </FormItem>
            </div>
          </Card>

          {/* Section 3: Shipping Address with Country Select dropdown */}
          <Card className="p-5 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Shipping Address & Destination
                  </h3>
                  <p className="text-xs text-slate-400">
                    Full destination address with validated country routing
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">
                shadcn Select + Input
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormItem className="sm:col-span-2">
                <FormLabel>Address Line 1 *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Street address or P.O. Box"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className={errors.line1 ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.line1 && <FormMessage>{errors.line1}</FormMessage>}
              </FormItem>

              <FormItem className="sm:col-span-2">
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g. San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={errors.city ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.city && <FormMessage>{errors.city}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>State / Province *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g. CA"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={errors.state ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.state && <FormMessage>{errors.state}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Postal / ZIP Code *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g. 94105"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className={errors.postalCode ? 'border-rose-500' : ''}
                  />
                </FormControl>
                {errors.postalCode && <FormMessage>{errors.postalCode}</FormMessage>}
              </FormItem>

              {/* Country Selection Dropdown using shadcn Select */}
              <FormItem>
                <FormLabel>Country / Region *</FormLabel>
                <FormControl>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">🇺🇸 United States</SelectItem>
                      <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                      <SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
                      <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
                      <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                      <SelectItem value="France">🇫🇷 France</SelectItem>
                      <SelectItem value="Netherlands">🇳🇱 Netherlands</SelectItem>
                      <SelectItem value="Japan">🇯🇵 Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                {errors.country && <FormMessage>{errors.country}</FormMessage>}
              </FormItem>
            </div>
          </Card>

          {/* Section 4: Shipping Method & Fulfillment Logistics (all shadcn Select dropdowns) */}
          <Card className="p-5 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Fulfillment Logistics & Shipping Service
                  </h3>
                  <p className="text-xs text-slate-400">
                    Choose carrier service tier and dispatch warehouse hub
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">
                shadcn Selects
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shipping Method Dropdown */}
              <FormItem className="sm:col-span-2">
                <FormLabel>Delivery Service Level *</FormLabel>
                <FormControl>
                  <Select
                    value={shippingMethod}
                    onValueChange={(val) => setShippingMethod(val as any)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose shipping method..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-medium text-slate-800">
                            🚚 Standard Ground (3–5 business days)
                          </span>
                          <span className="font-bold text-emerald-600 text-xs">
                            FREE
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="express">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-medium text-slate-800">
                            ✈️ Expedited Air Courier (2–3 business days)
                          </span>
                          <span className="font-bold text-brand-600 text-xs">
                            +$4.99
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="overnight">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-medium text-slate-800">
                            ⚡ Priority Overnight Dispatch (Next Morning)
                          </span>
                          <span className="font-bold text-brand-600 text-xs">
                            +$9.99
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>

              {/* Warehouse Hub Dropdown */}
              <FormItem>
                <FormLabel>Origin Fulfillment Hub</FormLabel>
                <FormControl>
                  <Select value={warehouseHub} onValueChange={setWarehouseHub}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-west">🏢 US-West Hub (Reno, NV)</SelectItem>
                      <SelectItem value="us-east">🏢 US-East Hub (Allentown, PA)</SelectItem>
                      <SelectItem value="eu-central">🏢 EU-Central Hub (Frankfurt, DE)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>

              {/* Order Priority Dropdown */}
              <FormItem>
                <FormLabel>Fulfillment Priority</FormLabel>
                <FormControl>
                  <Select value={priorityTier} onValueChange={setPriorityTier}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Standard Verification Queue</SelectItem>
                      <SelectItem value="urgent">🔥 Urgent Fast-Track (&lt; 2 hrs)</SelectItem>
                      <SelectItem value="bulk">Bulk Direct Container</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            </div>
          </Card>

          {/* Section 5: Notes / Instructions */}
          <Card className="p-5 sm:p-6 shadow-soft">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                5
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
              placeholder="e.g. Leave package in front porch box, no signature required."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900"
            />
          </Card>
        </div>

        {/* Right Sticky Column: Live Order Summary & Actions using shadcn Card & Button */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
          <Card className="p-5 shadow-soft">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
              Live Order Summary
            </h3>

            {selectedProduct ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProduct.thumbnail}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {selectedProduct.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {quantity} × {formatCurrency(unitDropshipPrice)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Product Subtotal:</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(productSubtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Shipping Service:</span>
                    <span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Turnaround Time:</span>
                    <span className="font-medium text-slate-800">
                      {selectedProduct.specs.fulfillmentTime}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Origin Hub:</span>
                    <span className="font-medium uppercase text-slate-800">
                      {warehouseHub}
                    </span>
                  </div>
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
                    Based on MSRP of {formatCurrency(unitMSRP)} per unit
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                Select a product to view financial summary
              </p>
            )}

            {/* Action Buttons using shadcn Button */}
            <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-100">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedProduct}
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
                    <span>Submit Dropship Order</span>
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
