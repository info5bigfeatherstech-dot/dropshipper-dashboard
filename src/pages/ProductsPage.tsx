import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product, SortOption } from '../types';
import { productsService } from '../services/productsService';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeletons';
import { EmptyState } from '../components/common/EmptyState';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Search,
  LayoutGrid,
  List,
  PackageSearch
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    setSelectedProductForModal,
    setSelectedProductForCreate,
    setActiveOrderTab
  } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [stockFilter, setStockFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load categories and initial products via productsService
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          productsService.getCategories(),
          productsService.getProducts({
            search,
            category: selectedCategory,
            sort: sortBy,
            stockStatus: stockFilter
          })
        ]);
        if (isMounted) {
          setCategories(cats);
          setProducts(prods);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [search, selectedCategory, sortBy, stockFilter]);

  const handleCreateOrder = (product: Product) => {
    setSelectedProductForCreate(product);
    setActiveOrderTab('create');
    navigate('/orders/create');
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setStockFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Sourcing Catalog
            </h2>
            <Badge variant="secondary" className="font-semibold text-brand-700 bg-brand-50 border-brand-200">
              {products.length} Products
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Supplier verified items ready for on-demand dispatch with guaranteed dropship wholesale pricing.
          </p>
        </div>

        {/* View mode toggle using shadcn Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`h-8 w-8 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={`h-8 w-8 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar using shadcn Card, Input, and Select */}
      <Card className="p-4 shadow-soft space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input using shadcn Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search product name, SKU or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter using shadcn Select */}
          <div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full capitalize">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock Filter using shadcn Select */}
          <div>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="in_stock">In Stock Only</SelectItem>
                <SelectItem value="low_stock">Low Stock Alerts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Dropdown using shadcn Select */}
          <div>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest Arrival</SelectItem>
                <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                <SelectItem value="margin_desc">Highest Margin ($)</SelectItem>
                <SelectItem value="name_asc">Product Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Popular:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-lg shrink-0 transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Product Grid / List Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="w-8 h-8 text-brand-600" />}
          title="No Products Found"
          description="We couldn't find any products matching your active filters. Try searching with different keywords or clearing filters."
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
              : 'space-y-3'
          }
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              onViewDetails={(p) => navigate(`/products/${p.id}`)}
              onCreateOrder={handleCreateOrder}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ProductsPage;
