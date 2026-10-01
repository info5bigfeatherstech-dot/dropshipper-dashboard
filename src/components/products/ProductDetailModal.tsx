import React, { useState, useRef } from 'react';
import { Product } from '../../types';
import { Drawer } from '../common/Drawer';
import { StockBadge } from '../common/StatusBadge';
import { formatCurrency, calculateMargin } from '../../utils/formatters';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Box,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product: propProduct,
  isOpen,
  onClose,
  onCreateOrder
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Retain last product in ref so the Drawer can play its smooth slide-out exit animation
  const lastProductRef = useRef<Product | null>(propProduct);
  if (propProduct) {
    lastProductRef.current = propProduct;
  }
  const product = propProduct || lastProductRef.current;
  if (!product) return null;

  const { profit, percentage } = calculateMargin(
    product.dropshipPrice,
    product.suggestedRetailPrice
  );

  const images = product.images.length > 0 ? product.images : [product.thumbnail];
  const activeImage = images[selectedImageIndex] || product.thumbnail;

  const handleCreateOrderClick = () => {
    onCreateOrder(product);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen && Boolean(propProduct)}
      onClose={onClose}
      title={product.name}
      subtitle={`SKU: ${product.sku} • Sourced from ${product.specs.origin}`}
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Gallery Section */}
        <div className="space-y-3">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 group">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 right-3">
              <StockBadge status={product.stockStatus} count={product.stock} />
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-brand-600 dark:border-brand-400 scale-95 ring-2 ring-brand-500/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Margin Banner */}
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-slate-800/80 dark:via-slate-900 dark:to-indigo-950/30 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Dropship Price
              </span>
              <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-0.5">
                {formatCurrency(product.dropshipPrice)}
              </p>
              <span className="text-[11px] text-slate-400">Admin-Approved Cost</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Suggested Retail
              </span>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {formatCurrency(product.suggestedRetailPrice)}
              </p>
              <span className="text-[11px] text-slate-400">Recommended MSRP</span>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-center">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                Estimated Net Margin
              </span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-300 mt-0.5">
                +{formatCurrency(profit)}
              </p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {percentage}% Profit Return
              </span>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleCreateOrderClick}
          disabled={product.stockStatus === 'out_of_stock'}
          className="w-full py-3.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold shadow-soft hover:shadow-soft-indigo transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Create Order with this Product</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </button>

        {/* Description */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Product Overview
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Key Features */}
        {product.features && product.features.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Highlights & Features
            </h4>
            <ul className="grid grid-cols-1 gap-2.5">
              {product.features.map((feat, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Logistics & Specifications Table */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Fulfillment & Specifications
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-brand-600" /> Fulfillment Turnaround
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {product.specs.fulfillmentTime}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Box className="w-3.5 h-3.5 text-brand-600" /> Dispatch Warehouse
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {product.specs.origin}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900">
              <span className="text-slate-500 dark:text-slate-400">Dimensions</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {product.specs.dimensions}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-slate-500 dark:text-slate-400">Package Weight</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {product.specs.weight}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900">
              <span className="text-slate-500 dark:text-slate-400">Material</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {product.specs.material}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Supplier Warranty
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {product.specs.warranty}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
