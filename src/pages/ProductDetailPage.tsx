import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Product } from '../types';
import { StockBadge } from '../components/common/StatusBadge';
import { ProductCard } from '../components/common/ProductCard';
import { formatCurrency, calculateMargin } from '../utils/formatters';
import {
  downloadProductImage,
  downloadProductPDF,
  downloadProductCSV,
  downloadProductJSON,
  downloadProductText,
  downloadAllProductImages
} from '../utils/exportUtils';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
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
  Share2,
  Download,
  FileText,
  Table,
  FileCode,
  Images,
  ChevronDown
} from 'lucide-react';
import { ServiceabilityCheckerModal } from '../components/shipping/ServiceabilityCheckerModal';

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
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isDownloadingAllImages, setIsDownloadingAllImages] = useState(false);
  const [showServiceabilityModal, setShowServiceabilityModal] = useState(false);

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

  // Download Handlers
  const handleDownloadActiveImage = async () => {
    setIsDownloadingImage(true);
    addToast({
      type: 'info',
      title: 'Downloading Image',
      message: `Fetching image ${selectedImageIndex + 1} for ${product.name}...`
    });
    const ok = await downloadProductImage(
      activeImage,
      `${product.sku}_image_${selectedImageIndex + 1}`,
      product.thumbnail
    );
    setIsDownloadingImage(false);
    if (ok) {
      addToast({
        type: 'success',
        title: 'Image Downloaded',
        message: `${product.sku} image ${selectedImageIndex + 1} saved to your downloads.`
      });
    } else {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not fetch image file. Please try again.'
      });
    }
  };

  const handleDownloadSpecificImage = async (e: React.MouseEvent, imgUrl: string, idx: number) => {
    e.stopPropagation();
    addToast({
      type: 'info',
      title: 'Downloading Image',
      message: `Fetching image ${idx + 1}...`
    });
    const ok = await downloadProductImage(
      imgUrl,
      `${product.sku}_image_${idx + 1}`,
      product.thumbnail
    );
    if (ok) {
      addToast({
        type: 'success',
        title: 'Image Downloaded',
        message: `Image ${idx + 1} saved.`
      });
    }
  };

  const handleDownloadAllImages = async () => {
    setIsDownloadingAllImages(true);
    addToast({
      type: 'info',
      title: 'Downloading Gallery',
      message: `Downloading ${images.length} images for ${product.sku}...`
    });
    const count = await downloadAllProductImages(product);
    setIsDownloadingAllImages(false);
    addToast({
      type: 'success',
      title: 'Gallery Downloaded',
      message: `Successfully saved ${count} images to downloads.`
    });
  };

  const handleDownloadPDF = () => {
    try {
      downloadProductPDF(product);
      addToast({
        type: 'success',
        title: 'PDF Spec Sheet Downloaded',
        message: `${product.sku}_Product_Details.pdf generated.`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'PDF Export Failed',
        message: 'Could not generate product PDF document.'
      });
    }
  };

  const handleDownloadCSV = () => {
    try {
      downloadProductCSV(product);
      addToast({
        type: 'success',
        title: 'CSV File Downloaded',
        message: `${product.sku}_details.csv exported for store import.`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'CSV Export Failed',
        message: 'Could not export CSV.'
      });
    }
  };

  const handleDownloadJSON = () => {
    try {
      downloadProductJSON(product);
      addToast({
        type: 'success',
        title: 'JSON Data Downloaded',
        message: `${product.sku}_data.json saved.`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not export JSON.'
      });
    }
  };

  const handleDownloadText = () => {
    try {
      downloadProductText(product);
      addToast({
        type: 'success',
        title: 'Listing Copy Downloaded',
        message: `${product.sku}_listing.txt saved.`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not export text.'
      });
    }
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
        <div className="flex items-center flex-wrap gap-2">
          {/* Direct Download Active Image */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadActiveImage}
            disabled={isDownloadingImage}
            className="rounded-xl text-xs font-medium h-9 border-slate-200 hover:border-brand-300 hover:bg-brand-50/50"
            title="Download currently selected product photo"
          >
            {isDownloadingImage ? (
              <div className="w-3.5 h-3.5 mr-1.5 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
            )}
            <span>Download Image</span>
          </Button>

          {/* Download Product Details Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-semibold h-9 border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 text-slate-800"
                title="Download product specifications and marketing assets"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                <span>Download Details</span>
                <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Product Specification Downloads
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer gap-2 py-2">
                <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-xs text-slate-800">PDF Spec Sheet</span>
                  <span className="text-[10px] text-slate-400">Complete branded datasheet</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-brand-600 border-brand-200 bg-brand-50/50">
                  PDF
                </Badge>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleDownloadCSV} className="cursor-pointer gap-2 py-2">
                <Table className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-xs text-slate-800">CSV Spreadsheet</span>
                  <span className="text-[10px] text-slate-400">Shopify & store import format</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50/50">
                  CSV
                </Badge>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleDownloadText} className="cursor-pointer gap-2 py-2">
                <FileCode className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-xs text-slate-800">Listing Copy (.txt)</span>
                  <span className="text-[10px] text-slate-400">Title, description & specs</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50/50">
                  TXT
                </Badge>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleDownloadJSON} className="cursor-pointer gap-2 py-2">
                <FileCode className="w-4 h-4 text-slate-600 shrink-0" />
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-xs text-slate-800">Raw JSON Data</span>
                  <span className="text-[10px] text-slate-400">Complete API data structure</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-200 bg-slate-50">
                  JSON
                </Badge>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Photo Media Assets
              </DropdownMenuLabel>

              <DropdownMenuItem onClick={handleDownloadActiveImage} className="cursor-pointer gap-2 py-2">
                <Download className="w-4 h-4 text-brand-600 shrink-0" />
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-xs text-slate-800">Download Current Photo</span>
                  <span className="text-[10px] text-slate-400">Image {selectedImageIndex + 1} of {images.length}</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleDownloadAllImages} className="cursor-pointer gap-2 py-2">
                <Images className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-xs text-slate-800">Download All {images.length} Photos</span>
                  <span className="text-[10px] text-slate-400">Batch download gallery photos</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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

              {/* Floating Image Counter & Download Button on the Main Image */}
              <div className="absolute bottom-4 left-4">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 text-white text-[11px] font-medium backdrop-blur-md shadow-xs flex items-center gap-1.5">
                  <span>Photo {selectedImageIndex + 1} of {images.length}</span>
                </span>
              </div>

              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadActiveImage}
                  disabled={isDownloadingImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-md shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  title="Download this specific product image"
                >
                  {isDownloadingImage ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-brand-300" />
                  )}
                  <span>Download Image</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group/thumb shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all block ${
                        selectedImageIndex === idx
                          ? 'border-brand-600 ring-4 ring-brand-500/20 scale-95'
                          : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
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
                    {/* Hover download button on thumbnail */}
                    <button
                      type="button"
                      onClick={(e) => handleDownloadSpecificImage(e, img, idx)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-slate-900/80 hover:bg-brand-600 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-xs"
                      title={`Download image ${idx + 1}`}
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Quick Download All Thumbnails Button */}
                <button
                  type="button"
                  onClick={handleDownloadAllImages}
                  disabled={isDownloadingAllImages}
                  className="shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-xl border border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/50 text-slate-500 hover:text-brand-600 transition-all text-[11px] font-semibold gap-1 disabled:opacity-50"
                  title="Download all images in product gallery"
                >
                  {isDownloadingAllImages ? (
                    <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" />
                  ) : (
                    <Images className="w-4 h-4" />
                  )}
                  <span>Save All</span>
                </button>
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

          {/* Download & Media Assets Card */}
          <Card className="p-6 shadow-soft space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Download className="w-4 h-4 text-brand-600" />
                Download Product Assets & Details
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Save official marketing imagery and supplier compliance datasheets for your store catalog.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* PDF Spec Sheet */}
              <div
                onClick={handleDownloadPDF}
                className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-brand-500/80 bg-white hover:bg-brand-50/20 transition-all cursor-pointer group shadow-xs hover:shadow-soft"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 truncate">
                      PDF Spec Sheet
                    </span>
                    <Badge variant="outline" className="text-[10px] text-brand-600 border-brand-200 bg-brand-50/60 px-1.5 py-0">
                      PDF
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    Printable product specification datasheet with wholesale pricing & margins
                  </p>
                </div>
              </div>

              {/* CSV Spreadsheet */}
              <div
                onClick={handleDownloadCSV}
                className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500/80 bg-white hover:bg-emerald-50/20 transition-all cursor-pointer group shadow-xs hover:shadow-soft"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Table className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 truncate">
                      Store Import CSV
                    </span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50/60 px-1.5 py-0">
                      CSV
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    Structured tabular data formatted for Shopify, WooCommerce or Excel
                  </p>
                </div>
              </div>

              {/* Active High-Res Image */}
              <div
                onClick={handleDownloadActiveImage}
                className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500/80 bg-white hover:bg-indigo-50/20 transition-all cursor-pointer group shadow-xs hover:shadow-soft"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {isDownloadingImage ? (
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                      Current Product Photo
                    </span>
                    <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-200 bg-indigo-50/60 px-1.5 py-0">
                      JPG
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    High-res image file of Photo {selectedImageIndex + 1}
                  </p>
                </div>
              </div>

              {/* All Gallery Photos */}
              <div
                onClick={handleDownloadAllImages}
                className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-violet-500/80 bg-white hover:bg-violet-50/20 transition-all cursor-pointer group shadow-xs hover:shadow-soft"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {isDownloadingAllImages ? (
                    <div className="w-5 h-5 border-2 border-violet-400 border-t-violet-600 rounded-full animate-spin" />
                  ) : (
                    <Images className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-violet-600 truncate">
                      All Gallery Photos
                    </span>
                    <Badge variant="outline" className="text-[10px] text-violet-600 border-violet-200 bg-violet-50/60 px-1.5 py-0">
                      {images.length} FILES
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    Batch download all verified supplier product angles
                  </p>
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
                type="button"
                variant="outline"
                onClick={() => setShowServiceabilityModal(true)}
                className="w-full py-2.5 h-auto rounded-xl text-xs font-semibold border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/70 transition-colors"
              >
                <Truck className="w-3.5 h-3.5 mr-2 text-indigo-600" />
                <span>Check Delivery & Shipping Quotes</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/products')}
                className="w-full py-2.5 h-auto rounded-xl text-xs font-semibold"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span>Browse More Sourcing Products</span>
              </Button>

              {/* Download Product Details Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full py-2.5 h-auto rounded-xl text-xs font-semibold border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 text-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 mr-2 text-brand-600" />
                    <span>Download Product Details</span>
                    <ChevronDown className="w-3.5 h-3.5 ml-auto text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Format Options
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer gap-2 py-2">
                    <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                    <div className="flex flex-col flex-1">
                      <span className="font-semibold text-xs text-slate-800">PDF Spec Sheet</span>
                      <span className="text-[10px] text-slate-400">Complete branded datasheet</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-brand-600 border-brand-200 bg-brand-50/50">
                      PDF
                    </Badge>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleDownloadCSV} className="cursor-pointer gap-2 py-2">
                    <Table className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="flex flex-col flex-1">
                      <span className="font-semibold text-xs text-slate-800">CSV Spreadsheet</span>
                      <span className="text-[10px] text-slate-400">Shopify & store import format</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50/50">
                      CSV
                    </Badge>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleDownloadText} className="cursor-pointer gap-2 py-2">
                    <FileCode className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="flex flex-col flex-1">
                      <span className="font-semibold text-xs text-slate-800">Listing Copy (.txt)</span>
                      <span className="text-[10px] text-slate-400">Title, description & specs</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50/50">
                      TXT
                    </Badge>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleDownloadJSON} className="cursor-pointer gap-2 py-2">
                    <FileCode className="w-4 h-4 text-slate-600 shrink-0" />
                    <div className="flex flex-col flex-1">
                      <span className="font-semibold text-xs text-slate-800">Raw JSON Data</span>
                      <span className="text-[10px] text-slate-400">Complete API data structure</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-200 bg-slate-50">
                      JSON
                    </Badge>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDownloadActiveImage} className="cursor-pointer gap-2 py-2">
                    <Download className="w-4 h-4 text-brand-600 shrink-0" />
                    <div className="flex flex-col flex-1">
                      <span className="font-semibold text-xs text-slate-800">Download Current Photo</span>
                      <span className="text-[10px] text-slate-400">Photo {selectedImageIndex + 1} of {images.length}</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

      {/* Route Serviceability Modal */}
      <ServiceabilityCheckerModal
        isOpen={showServiceabilityModal}
        onClose={() => setShowServiceabilityModal(false)}
        defaultWeightKg={
          product.specs?.weight?.toLowerCase().endsWith('kg')
            ? parseFloat(product.specs.weight) || 0.5
            : product.specs?.weight?.toLowerCase().endsWith('g')
            ? (parseFloat(product.specs.weight) || 500) / 1000
            : 0.5
        }
        defaultOrderAmount={product.dropshipPrice}
      />
    </div>
  );
};

export default ProductDetailPage;
