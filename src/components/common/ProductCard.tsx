import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types';
import { StockBadge } from './StatusBadge';
import { formatCurrency, calculateMargin } from '../../utils/formatters';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Eye,
  PlusCircle,
  ArrowUpRight,
  MoreVertical,
  Download,
  Images,
  Layers,
  FileText,
  MessageCircle,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { useStore } from '../../store/useStore';
import {
  downloadProductImage,
  downloadAllProductImages,
  downloadProductPDF
} from '../../utils/exportUtils';
import { shareProductToWhatsApp } from '../../utils/whatsappShare';
import { ProductImageDownloadModal } from '../products/ProductImageDownloadModal';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onViewDetails: (product: Product) => void;
  onCreateOrder: (product: Product) => void;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  viewMode = 'grid',
  onViewDetails,
  onCreateOrder
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const addToast = useStore((state) => state.addToast);

  const dropshipPrice = Number(product.dropshipPrice || 0);
  const suggestedRetailPrice = Number(
    product.suggestedRetailPrice ||
      (dropshipPrice > 0 ? Math.round(dropshipPrice * 1.5) : 0)
  );
  const categoryLabel =
    typeof product.category === 'object' && product.category !== null
      ? (product.category as any)?.name || (product.category as any)?.slug || 'General'
      : product.category || 'General';

  const fulfillmentTime = product.specs?.fulfillmentTime || '24-48 Hours';
  const thumbnail = product.thumbnail || DEFAULT_IMAGE;

  // Extract all unique product gallery images
  const rawImages = [
    ...(Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : []),
    thumbnail
  ].filter(Boolean) as string[];
  const productImages = Array.from(new Set(rawImages));

  const { profit, percentage } = calculateMargin(
    dropshipPrice,
    suggestedRetailPrice
  );

  const handleShareWhatsApp = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSharingWhatsApp) return;
    setIsSharingWhatsApp(true);
    try {
      addToast({
        type: 'info',
        title: 'Preparing WhatsApp Share',
        message: 'Fetching photo and formatting product details...'
      });
      await shareProductToWhatsApp(product, {
        onToast: (toast) => addToast(toast)
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Share Failed',
        message: err?.message || 'Could not initiate WhatsApp share.'
      });
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  const handleDownloadPDF = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      addToast({
        type: 'info',
        title: 'Generating PDF',
        message: `Creating ${product.sku} product PDF with image & details...`
      });
      const ok = await downloadProductPDF(product, { includePrice: false });
      if (ok) {
        addToast({
          type: 'success',
          title: 'PDF Downloaded',
          message: `${product.sku} product sheet saved to downloads (no price).`
        });
      } else {
        addToast({
          type: 'error',
          title: 'PDF Generation Failed',
          message: 'Could not generate product PDF.'
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'PDF Generation Failed',
        message: 'Network error while generating product PDF.'
      });
    }
  };

  const handleDownloadMainImage = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      addToast({
        type: 'info',
        title: 'Downloading Image',
        message: `Saving ${product.sku} primary image...`
      });
      const ok = await downloadProductImage(
        productImages[0],
        `${product.sku}_main`,
        thumbnail
      );
      if (ok) {
        addToast({
          type: 'success',
          title: 'Image Downloaded',
          message: `${product.sku} main image saved to your downloads.`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Download Failed',
          message: 'Could not download product image.'
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Network error while downloading image.'
      });
    }
  };

  const handleDownloadAllImages = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      addToast({
        type: 'info',
        title: 'Downloading All Images',
        message: `Starting download of ${productImages.length} images...`
      });
      const count = await downloadAllProductImages(product);
      if (count > 0) {
        addToast({
          type: 'success',
          title: 'All Images Downloaded',
          message: `Saved ${count} images for ${product.sku}.`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Download Failed',
          message: 'Could not download product images.'
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Network error while downloading images.'
      });
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-soft hover:shadow-soft-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              <img
                src={thumbnail}
                alt={product.name || 'Product'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge
                  variant="secondary"
                  className="font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-300"
                >
                  {categoryLabel}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  {product.sku || 'SKU-INVENTORY'}
                </span>
              </div>
              <h4
                onClick={() => onViewDetails(product)}
                className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {product.name || 'Untitled Product'}
              </h4>
              <div className="flex items-center gap-3 mt-1.5">
                <StockBadge
                  status={product.stockStatus || 'in_stock'}
                  count={product.stock ?? 10}
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">
                  Fulfillment: {fulfillmentTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="text-left sm:text-right">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Dropship Price
              </p>
              <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
                {formatCurrency(dropshipPrice)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                MSRP {formatCurrency(suggestedRetailPrice)}{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  (+{formatCurrency(profit)})
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(product)}
                title="View details"
                className="h-9 w-9 p-0 rounded-xl"
              >
                <Eye className="w-4 h-4" />
              </Button>

              {/* Three dots image menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Download images"
                    className="h-9 w-9 p-0 rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-1.5 z-50 shadow-soft-lg">

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadMainImage(e);
                    }}
                    className="flex items-center gap-2.5 py-2 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">
                        Download One Image
                      </p>
                      <p className="text-[10px] text-slate-400">Save primary main photo</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImageModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 py-2 cursor-pointer rounded-xl hover:bg-brand-50/60 dark:hover:bg-brand-950/30"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                      <Images className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">
                        Download Selected Images
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Select & pick specific photos ({productImages.length})
                      </p>
                    </div>
                  </DropdownMenuItem>

                  {productImages.length > 1 && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadAllImages(e);
                      }}
                      className="flex items-center gap-2.5 py-2 cursor-pointer rounded-xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-slate-900 dark:text-white">
                          Download All Images
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Save all {productImages.length} gallery photos
                        </p>
                      </div>
                    </DropdownMenuItem>
                  )}

                  {/* Option: Download Product PDF (Details & Image, No Prices) */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPDF(e);
                    }}
                    className="flex items-center gap-2.5 py-2 cursor-pointer rounded-xl hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">
                        Download Product PDF
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Photo & specs sheet (no prices)
                      </p>
                    </div>
                  </DropdownMenuItem>

                  {/* Option: Share to WhatsApp (Photo + Details, No Prices) */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareWhatsApp(e);
                    }}
                    disabled={isSharingWhatsApp}
                    className="flex items-center gap-2.5 py-2 cursor-pointer rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      {isSharingWhatsApp ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Share to WhatsApp</span>
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                          Image + Specs
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Send photo & customer description
                      </p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShareWhatsApp}
                disabled={isSharingWhatsApp}
                title="Share Product with Photo & Specs to WhatsApp"
                className="rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-2xs gap-1"
              >
                {isSharingWhatsApp ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <MessageCircle className="w-3.5 h-3.5" />
                )}
                <span>Share</span>
              </Button>

              <Button
                size="sm"
                onClick={() => onCreateOrder(product)}
                disabled={product.stockStatus === 'out_of_stock'}
                className="rounded-xl shadow-soft"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                <span>Create Order</span>
              </Button>
            </div>
          </div>
        </motion.div>

        <ProductImageDownloadModal
          product={product}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
        />
      </>
    );
  }

  // Grid view card
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg flex flex-col justify-between"
      >
        <div>
          {/* Image Container with zoom */}
          <div
            onClick={() => onViewDetails(product)}
            className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
          >
            <img
              src={thumbnail}
              alt={product.name || 'Product'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
              }}
            />

            {/* Top Left: Stock Status Badge */}
            <div className="absolute top-3 left-3 z-20">
              <StockBadge
                status={product.stockStatus || 'in_stock'}
                count={product.stock ?? 10}
              />
            </div>

            {/* Top Right: Three Dots Action Menu */}
            <div
              className="absolute top-3 right-3 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-850 shadow-xs backdrop-blur-md flex items-center justify-center transition-all border border-black/5 dark:border-white/10 cursor-pointer"
                    title="Download options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-1.5 z-50 shadow-soft-lg">

                  {/* Option 1: Download One Image */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadMainImage(e);
                    }}
                    className="flex items-center gap-2.5 py-2 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">
                        Download One Image
                      </p>
                      <p className="text-[10px] text-slate-400">Save primary main photo</p>
                    </div>
                  </DropdownMenuItem>

                  {/* Option 2: Download Selected Images */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImageModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 py-2 cursor-pointer rounded-xl hover:bg-brand-50/60 dark:hover:bg-brand-950/30"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                      <Images className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">
                        Download Selected Images
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Select & pick specific photos ({productImages.length})
                      </p>
                    </div>
                  </DropdownMenuItem>

                  {/* Option 3: Download All (if more than 1) */}
                  {productImages.length > 1 && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadAllImages(e);
                      }}
                      className="flex items-center gap-2.5 py-2 cursor-pointer rounded-xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-slate-900 dark:text-white">
                          Download All Images
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Save all {productImages.length} gallery photos
                        </p>
                      </div>
                    </DropdownMenuItem>
                  )}

                  {/* Option: Download Product PDF (Details & Image, No Prices) */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPDF(e);
                    }}
                    className="flex items-center gap-2.5 py-2 cursor-pointer rounded-xl hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">
                        Download Product PDF
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Photo & specs sheet (no prices)
                      </p>
                    </div>
                  </DropdownMenuItem>

                  {/* Option: Share to WhatsApp (Photo + Details, No Prices) */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareWhatsApp(e);
                    }}
                    disabled={isSharingWhatsApp}
                    className="flex items-center gap-2.5 py-2 cursor-pointer rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      {isSharingWhatsApp ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Share to WhatsApp</span>
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                          Image + Specs
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Send photo & customer description
                      </p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Subtle hover quick view indicator */}
            <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-xs font-semibold text-slate-800 dark:text-white backdrop-blur shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <Eye className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                Quick Preview
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            {/* Category Badge & SKU */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <Badge
                variant="secondary"
                title={categoryLabel}
                className="font-semibold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/50 dark:border-brand-900/50 truncate max-w-[170px]"
              >
                {categoryLabel}
              </Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono shrink-0">
                {product.sku || 'SKU-INVENTORY'}
              </span>
            </div>

            <h3
              onClick={() => onViewDetails(product)}
              className="text-base font-semibold text-slate-900 dark:text-white line-clamp-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
              title={product.name}
            >
              {product.name || 'Untitled Product'}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 mb-4 leading-relaxed">
              {product.description || 'Verified supplier catalog inventory.'}
            </p>

            {/* Pricing Highlight */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Dropship Price
                  </span>
                  <div className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                    {formatCurrency(dropshipPrice)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400">MSRP</span>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 line-through">
                    {formatCurrency(suggestedRetailPrice)}
                  </div>
                </div>
              </div>

              {/* Margin highlight */}
              <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  Your Margin
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(profit)} ({percentage}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Actions using shadcn Buttons */}
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(product)}
            className="flex-1 text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>Details</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareWhatsApp}
            disabled={isSharingWhatsApp}
            title="Share Product with Photo & Specs to WhatsApp"
            className="px-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-300 transition-colors shadow-2xs"
          >
            {isSharingWhatsApp ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MessageCircle className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline ml-1 font-medium">Share</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onCreateOrder(product)}
            disabled={product.stockStatus === 'out_of_stock'}
            className="flex-1 text-xs font-semibold"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            <span>Order</span>
          </Button>
        </div>
      </motion.div>

      <ProductImageDownloadModal
        product={product}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </>
  );
});

