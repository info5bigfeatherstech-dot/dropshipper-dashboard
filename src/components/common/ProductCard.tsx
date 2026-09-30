import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types';
import { StockBadge } from './StatusBadge';
import { formatCurrency, calculateMargin } from '../../utils/formatters';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, PlusCircle, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onViewDetails: (product: Product) => void;
  onCreateOrder: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
  onViewDetails,
  onCreateOrder
}) => {
  const { profit, percentage } = calculateMargin(
    product.dropshipPrice,
    product.suggestedRetailPrice
  );

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-soft hover:shadow-soft-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="secondary" className="font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-300">
                {product.category}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                {product.sku}
              </span>
            </div>
            <h4
              onClick={() => onViewDetails(product)}
              className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {product.name}
            </h4>
            <div className="flex items-center gap-3 mt-1.5">
              <StockBadge status={product.stockStatus} count={product.stock} />
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">
                Fulfillment: {product.specs.fulfillmentTime}
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
              {formatCurrency(product.dropshipPrice)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              MSRP {formatCurrency(product.suggestedRetailPrice)}{' '}
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
              className="h-9 w-9 p-0"
            >
              <Eye className="w-4 h-4" />
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
    );
  }

  // Grid view card
  return (
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
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
            }}
          />

          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 backdrop-blur-md shadow-xs border-white/20">
              {product.category}
            </Badge>
          </div>

          <div className="absolute top-3 right-3">
            <StockBadge status={product.stockStatus} count={product.stock} />
          </div>

          {/* Subtle hover quick view indicator */}
          <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-xs font-semibold text-slate-800 dark:text-white backdrop-blur shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <Eye className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Quick Preview
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span>{product.sku}</span>
            <span>★ {product.rating}</span>
          </div>

          <h3
            onClick={() => onViewDetails(product)}
            className="text-base font-semibold text-slate-900 dark:text-white line-clamp-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 mb-4 leading-relaxed">
            {product.description}
          </p>

          {/* Pricing Highlight */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Dropship Price
                </span>
                <div className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                  {formatCurrency(product.dropshipPrice)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400">MSRP</span>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 line-through">
                  {formatCurrency(product.suggestedRetailPrice)}
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
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(product)}
          className="w-full text-xs font-semibold"
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <span>Details</span>
        </Button>

        <Button
          size="sm"
          onClick={() => onCreateOrder(product)}
          disabled={product.stockStatus === 'out_of_stock'}
          className="w-full text-xs font-semibold"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1" />
          <span>Order</span>
        </Button>
      </div>
    </motion.div>
  );
};
