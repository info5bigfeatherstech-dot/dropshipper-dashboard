import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Product } from '../types';
import { StockBadge } from '../components/common/StatusBadge';
import { ProductCard } from '../components/common/ProductCard';
import { formatCurrency, calculateMargin } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Box,
  CheckCircle2,
  Copy,
  Sparkles,
  Star,
  ArrowUpRight,
  Package,
  Layers,
  Clock,
  RotateCcw,
  Check,
  Share2
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    products,
    setSelectedProductForCreate,
    addToast
  } = useStore();

  const product = useMemo(() => {
    return products.find((p) => p.id === id) || null;
  }, [products, id]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [calculatorQty, setCalculatorQty] = useState(1);
  const [copiedSku, setCopiedSku] = useState(false);

  // If product not found
  if (!product) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested catalog product with ID "{id}" could not be located in active inventory.
        </p>
        <Button onClick={() => navigate('/products')} className="rounded-xl shadow-soft">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Return to Catalog</span>
        </Button>
      </div>
    );
  }

  const { profit, percentage } = calculateMargin(
    product.dropshipPrice,
    product.suggestedRetailPrice
  );

  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  const activeImage = images[selectedImageIndex] || product.thumbnail;

  // Simulator calculations
  const totalDropshipCost = +(product.dropshipPrice * calculatorQty).toFixed(2);
  const totalSuggestedRevenue = +(product.suggestedRetailPrice * calculatorQty).toFixed(2);
  const totalEstimatedProfit = +(totalSuggestedRevenue - totalDropshipCost).toFixed(2);

  const handleCreateOrderClick = () => {
    setSelectedProductForCreate(product);
    navigate('/orders/create');
  };

  const handleCopySku = () => {
    navigator.clipboard.writeText(product.sku);
    setCopiedSku(true);
    addToast({
      type: 'info',
      title: 'SKU Copied',
      message: `${product.sku} copied to clipboard.`
    });
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast({
      type: 'info',
      title: 'Link Copied',
      message: 'Product URL copied to clipboard.'
    });
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sourcing Catalog</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Products</span>
            <span>/</span>
            <span className="text-slate-600 font-medium">{product.category}</span>
            <span>/</span>
            <span className="font-mono text-slate-500">{product.sku}</span>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLink}
            className="rounded-xl text-xs font-medium h-9"
            title="Share Product"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>Share</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySku}
            className="rounded-xl text-xs font-mono h-9"
            title="Copy SKU code"
          >
            {copiedSku ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span>{product.sku}</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleCreateOrderClick}
            disabled={product.stockStatus === 'out_of_stock'}
            className="rounded-xl text-xs font-semibold shadow-soft h-9"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            <span>Create Order</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Gallery & Logistics (Left) vs Pricing & Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): High-res Gallery & Technical Specifications */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Visual Display */}
          <Card className="p-4 sm:p-5 shadow-soft overflow-hidden">
            <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Badges on Hero Image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-white/95 text-slate-900 shadow-md backdrop-blur border-none font-semibold text-xs px-3 py-1">
                  {product.category}
                </Badge>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white text-[11px] font-semibold backdrop-blur shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Supplier Batch</span>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <StockBadge status={product.stockStatus} count={product.stock} />
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-brand-600 ring-4 ring-brand-500/20 scale-95'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Product Overview & Features */}
          <Card className="p-6 shadow-soft space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Product Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Feature Bullets */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Key Specifications & Value Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logistics & Supplier Specifications Table */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Logistics & Carrier Compliance
              </h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-white">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Truck className="w-4 h-4 text-brand-600" /> Dispatch Turnaround
                  </span>
                  <span className="font-semibold text-slate-900">
                    {product.specs.fulfillmentTime}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50/60">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Box className="w-4 h-4 text-brand-600" /> Fulfillment Origin Hub
                  </span>
                  <span className="font-semibold text-slate-900">
                    {product.specs.origin}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white">
                  <span className="text-slate-500 font-medium">Parcel Dimensions</span>
                  <span className="font-semibold text-slate-900">
                    {product.specs.dimensions}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50/60">
                  <span className="text-slate-500 font-medium">Gross Weight</span>
                  <span className="font-semibold text-slate-900">
                    {product.specs.weight}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white">
                  <span className="text-slate-500 font-medium">Material Composition</span>
                  <span className="font-semibold text-slate-900">
                    {product.specs.material}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50/60">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Supplier Warranty
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {product.specs.warranty}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Financial Margin Breakdown & Live Simulator */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <Card className="p-6 shadow-soft space-y-6">
            {/* Title & Metadata */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {product.sku}
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Wholesale Pricing & Margin Banner */}
            <div className="bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 p-5 rounded-2xl border border-indigo-100 shadow-soft space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-indigo-100/80">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Wholesale Dropship
                  </span>
                  <p className="text-3xl font-black text-brand-600 mt-0.5">
                    {formatCurrency(product.dropshipPrice)}
                  </p>
                  <span className="text-[11px] text-slate-500">Locked Supplier Cost</span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Suggested MSRP
                  </span>
                  <p className="text-3xl font-bold text-slate-800 mt-0.5">
                    {formatCurrency(product.suggestedRetailPrice)}
                  </p>
                  <span className="text-[11px] text-slate-500">Recommended Retail</span>
                </div>
              </div>

              {/* Profit Callout */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    Estimated Net Margin
                  </span>
                  <p className="text-xl font-black text-emerald-600 mt-0.5">
                    +{formatCurrency(profit)}
                  </p>
                </div>
                <Badge variant="outline" className="bg-white border-emerald-300 text-emerald-700 font-bold px-3 py-1">
                  {percentage}% Return
                </Badge>
              </div>
            </div>

            {/* Live Interactive Profit Simulator */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Order Volume Simulator
                </span>
                <span className="text-xs text-slate-400">Scale your revenue</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Simulate Units:</span>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalculatorQty(Math.max(1, calculatorQty - 1))}
                      className="h-7 w-7 rounded-lg"
                      title="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {calculatorQty}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalculatorQty(Math.min(product.stock || 50, calculatorQty + 1))}
                      className="h-7 w-7 rounded-lg"
                      title="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Wholesale Dropship Outlay:</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(totalDropshipCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Customer Retail Revenue:</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(totalSuggestedRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold pt-1.5 border-t border-slate-200/80">
                    <span>Your Total Estimated Profit:</span>
                    <span className="text-sm font-extrabold text-emerald-600">
                      +{formatCurrency(totalEstimatedProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleCreateOrderClick}
                disabled={product.stockStatus === 'out_of_stock'}
                className="w-full py-3.5 h-auto rounded-xl text-sm font-bold shadow-soft"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span>Create Order with this Product</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/products')}
                className="w-full py-2.5 h-auto rounded-xl text-xs font-semibold"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span>Browse More Sourcing Products</span>
              </Button>
            </div>

            {/* Wholesale Buyer Protection Policy */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Supplier Wholesale Protection</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Orders placed through this portal are direct-to-consumer drop-shipped in blind generic packaging with zero middleman supplier branding.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Related Sourcing Opportunities
              </h3>
              <p className="text-xs text-slate-500">
                Other in-stock items in {product.category} with verified margins
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/products')}
              className="text-xs font-semibold"
            >
              <span>View All in Catalog</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onViewDetails={(item) => navigate(`/products/${item.id}`)}
                onCreateOrder={(item) => {
                  setSelectedProductForCreate(item);
                  navigate('/orders/create');
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
