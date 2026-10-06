import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../../types';
import { useStore } from '../../store/useStore';
import { downloadProductImage } from '../../utils/exportUtils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  X,
  Download,
  Check,
  RotateCw,
  Eye,
  CheckSquare,
  Square,
  Images,
  ExternalLink
} from 'lucide-react';

interface ProductImageDownloadModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export const ProductImageDownloadModal: React.FC<ProductImageDownloadModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const addToast = useStore((state) => state.addToast);

  // Extract unique valid image URLs
  const rawImages = product
    ? [
        ...(Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : []),
        product.thumbnail
      ].filter(Boolean)
    : [];

  // Deduplicate URLs
  const images = Array.from(new Set(rawImages));
  if (images.length === 0 && product) {
    images.push(DEFAULT_FALLBACK_IMAGE);
  }

  // Selected indices
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(() => {
    return new Set(images.map((_, idx) => idx));
  });

  // Downloading state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  // Lightbox preview for a single image
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Reset selected indices when product changes or modal opens
  useEffect(() => {
    if (isOpen && images.length > 0) {
      setSelectedIndices(new Set(images.map((_, idx) => idx)));
      setDownloadProgress(null);
      setIsDownloading(false);
      setPreviewImage(null);
    }
  }, [isOpen, product?.id]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
        } else {
          onClose();
        }
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, previewImage]);

  if (!isOpen || !product) return null;

  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIndices(new Set(images.map((_, idx) => idx)));
  };

  const handleDeselectAll = () => {
    setSelectedIndices(new Set());
  };

  // Download a single specific image
  const handleDownloadSingle = async (url: string, index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      addToast({
        type: 'info',
        title: 'Downloading Image',
        message: `Saving ${product.sku} image ${index + 1}...`
      });
      const success = await downloadProductImage(
        url,
        `${product.sku}_image_${index + 1}`,
        product.thumbnail || DEFAULT_FALLBACK_IMAGE
      );
      if (success) {
        addToast({
          type: 'success',
          title: 'Image Downloaded',
          message: `${product.sku} image ${index + 1} saved to your downloads.`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Download Failed',
          message: 'Could not download this image. Please try again.'
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

  // Download all currently selected images
  const handleDownloadSelected = async () => {
    if (selectedIndices.size === 0) return;

    setIsDownloading(true);
    const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);
    setDownloadProgress({ current: 0, total: sortedIndices.length });

    addToast({
      type: 'info',
      title: 'Downloading Images',
      message: `Starting download of ${sortedIndices.length} image(s)...`
    });

    let successCount = 0;
    for (let i = 0; i < sortedIndices.length; i++) {
      const idx = sortedIndices[i];
      setDownloadProgress({ current: i + 1, total: sortedIndices.length });

      const ok = await downloadProductImage(
        images[idx],
        `${product.sku}_image_${idx + 1}`,
        product.thumbnail || DEFAULT_FALLBACK_IMAGE
      );
      if (ok) successCount++;

      // Small delay so browser allows multiple sequential file downloads
      if (i < sortedIndices.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    setIsDownloading(false);
    setDownloadProgress(null);

    if (successCount > 0) {
      addToast({
        type: 'success',
        title: 'Download Complete',
        message: `Successfully saved ${successCount} product image(s).`
      });
      onClose();
    } else {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not download the selected images.'
      });
    }
  };

  // Download all images regardless of checkbox
  const handleDownloadAll = async () => {
    handleSelectAll();
    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: images.length });

    addToast({
      type: 'info',
      title: 'Downloading All Images',
      message: `Starting download of all ${images.length} images...`
    });

    let successCount = 0;
    for (let i = 0; i < images.length; i++) {
      setDownloadProgress({ current: i + 1, total: images.length });
      const ok = await downloadProductImage(
        images[i],
        `${product.sku}_image_${i + 1}`,
        product.thumbnail || DEFAULT_FALLBACK_IMAGE
      );
      if (ok) successCount++;
      if (i < images.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    setIsDownloading(false);
    setDownloadProgress(null);

    if (successCount > 0) {
      addToast({
        type: 'success',
        title: 'All Images Downloaded',
        message: `Successfully saved ${successCount} product images.`
      });
      onClose();
    }
  };

  const isAllSelected = selectedIndices.size === images.length;
  const isNoneSelected = selectedIndices.size === 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-soft-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-soft shrink-0">
              <Images className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  Download Product Images
                </h3>
                <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                  {product.sku}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {product.name} — Select the images you want to save
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Selection Controls */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {selectedIndices.size} of {images.length} images selected
            </span>
            {selectedIndices.size > 0 && (
              <Badge className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border-brand-200 text-[10px]">
                Ready to download
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={isAllSelected || isDownloading}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                isAllSelected
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Select All</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              disabled={isNoneSelected || isDownloading}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                isNoneSelected
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Deselect All</span>
            </button>
          </div>
        </div>

        {/* Scrollable Images Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((imgUrl, index) => {
              const isSelected = selectedIndices.has(index);
              const isPrimary = index === 0;

              return (
                <div
                  key={index}
                  onClick={() => !isDownloading && toggleSelect(index)}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-100 dark:bg-slate-800 ${
                    isSelected
                      ? 'border-brand-600 dark:border-brand-500 ring-2 ring-brand-500/20 shadow-soft'
                      : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Image Aspect Box */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                      }}
                    />

                    {/* Top-left: Selection Checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow-xs ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-white/90 dark:bg-slate-900/90 text-transparent border border-slate-300 dark:border-slate-600 backdrop-blur'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Bottom-left: Index / Main Image Badge */}
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                        {isPrimary ? 'Main Image' : `Image ${index + 1}`}
                      </span>
                    </div>

                    {/* Hover Actions: Quick Download Single & Preview */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(imgUrl);
                        }}
                        title="Preview larger"
                        className="w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white shadow-md flex items-center justify-center backdrop-blur transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDownloadSingle(imgUrl, index, e)}
                        title="Download this image only"
                        className="w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white shadow-md flex items-center justify-center backdrop-blur transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Click To Select Overlay */}
                    <div
                      className={`absolute inset-0 transition-colors pointer-events-none ${
                        isSelected
                          ? 'bg-brand-500/10'
                          : 'bg-black/10 group-hover:bg-transparent'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {images.length === 1 && (
            <p className="text-center text-xs text-slate-400 mt-4">
              This product currently has 1 catalog image available.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {downloadProgress ? (
              <span className="flex items-center gap-2 font-medium text-brand-600 dark:text-brand-400">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                Downloading {downloadProgress.current} of {downloadProgress.total}...
              </span>
            ) : (
              <span>
                {selectedIndices.size} file{selectedIndices.size === 1 ? '' : 's'} queued for download
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDownloading}
              className="rounded-xl text-xs dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>

            {images.length > 1 && (
              <Button
                variant="outline"
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="rounded-xl text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All ({images.length})</span>
              </Button>
            )}

            <Button
              onClick={handleDownloadSelected}
              disabled={isNoneSelected || isDownloading}
              className="rounded-xl text-xs gap-1.5 font-bold shadow-soft"
            >
              {isDownloading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Selected ({selectedIndices.size})</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4 animate-in fade-in-50"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-slate-950 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="High resolution preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => handleDownloadSingle(previewImage, 0)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur transition-colors"
                title="Download this image"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur transition-colors"
                title="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
