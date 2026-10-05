import { Product, SortOption, ProductSpecs } from '../types';
import { apiFetch } from '../lib/api';
import { useStore } from '../store/useStore';
import { mockProducts } from '../data/mockProducts';

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  categoryId?: string;
  category?: string;
  inStockOnly?: boolean;
  sort?: SortOption | 'newest' | 'name_asc' | 'price_asc' | 'price_desc' | 'margin_desc';
  stockStatus?: string;
}

export interface CatalogVariantDetail {
  productCode: string;
  sku: string;
  name: string;
  dropshipPrice: number;
  suggestedRetailPrice: number;
  stock: number;
  images: string[];
  attributes?: Record<string, string>;
}

export interface DownloadPackResponse {
  productCode: string;
  images: string[];
  zipUrl?: string;
  title: string;
  description: string;
}

function asNumber(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function imageList(...sources: unknown[]): string[] {
  const out: string[] = [];
  for (const s of sources) {
    if (typeof s === 'string' && s.trim()) out.push(s.trim());
    else if (Array.isArray(s)) {
      for (const item of s) {
        if (typeof item === 'string' && item.trim()) out.push(item.trim());
        else if (item && typeof item === 'object') {
          const url = (item as any).url || (item as any).secure_url || (item as any).src;
          if (typeof url === 'string' && url.trim()) out.push(url.trim());
        }
      }
    }
  }
  return Array.from(new Set(out));
}

/**
 * Normalizes any backend or raw catalog payload into a type-safe Product object
 * that will never cause React render errors (e.g. objects as React children, undefined specs).
 */
export function normalizeProduct(raw: any): Product {
  if (!raw) return {} as Product;

  const variants = Array.isArray(raw.variants) ? raw.variants : [];
  const primaryVariant = variants[0] || {};

  // Extract category string safely
  let categoryName = 'General';
  let categoryId = '';

  if (typeof raw.category === 'object' && raw.category !== null) {
    categoryName = raw.category.name || raw.category.slug || 'General';
    categoryId = raw.category.id || raw.category._id || '';
  } else if (typeof raw.category === 'string' && raw.category.trim()) {
    categoryName = raw.category.trim();
    categoryId = raw.categoryId || '';
  } else if (typeof primaryVariant.category === 'object' && primaryVariant.category !== null) {
    categoryName = primaryVariant.category.name || primaryVariant.category.slug || 'General';
    categoryId = primaryVariant.category.id || primaryVariant.category._id || '';
  } else if (typeof primaryVariant.category === 'string' && primaryVariant.category.trim()) {
    categoryName = primaryVariant.category.trim();
  }

  // SKU
  const sku =
    raw.sku ||
    primaryVariant.sku ||
    primaryVariant.productCode ||
    raw.productCode ||
    (raw.id ? `SKU-${String(raw.id).slice(-6).toUpperCase()}` : 'SKU-INVENTORY');

  // Dropship price
  const dropshipPrice = Number(
    raw.dropshipPrice ??
    primaryVariant.dropshipPrice ??
    raw.dropshipPriceMin ??
    raw.dropshipPriceMax ??
    raw.costEstimate ??
    0
  );

  // Suggested Retail Price (MSRP)
  const suggestedRetailPrice = Number(
    raw.suggestedRetailPrice ??
    primaryVariant.suggestedRetailPrice ??
    (dropshipPrice > 0 ? Math.round(dropshipPrice * 1.5) : 0)
  );

  // Stock & Status
  const stock = Number(
    raw.stock ??
    primaryVariant.quantity ??
    primaryVariant.stock ??
    (raw.trackInventory === false ? 999 : 0)
  );

  let stockStatus = raw.stockStatus || primaryVariant.stockStatus;
  if (!stockStatus) {
    if (stock > 5) stockStatus = 'in_stock';
    else if (stock > 0) stockStatus = 'low_stock';
    else stockStatus = 'out_of_stock';
  }

  // Fallback image
  const fallbackImg =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const thumbnail =
    raw.thumbnail ||
    primaryVariant.thumbnail ||
    (Array.isArray(primaryVariant.images) && primaryVariant.images[0]) ||
    (Array.isArray(raw.images) && raw.images[0]) ||
    fallbackImg;

  let images: string[] = [];
  if (Array.isArray(raw.images) && raw.images.length > 0) {
    images = raw.images;
  } else if (Array.isArray(primaryVariant.images) && primaryVariant.images.length > 0) {
    images = primaryVariant.images;
  } else if (Array.isArray(primaryVariant.imageDetails) && primaryVariant.imageDetails.length > 0) {
    images = primaryVariant.imageDetails
      .map((img: any) => (typeof img === 'string' ? img : img?.url))
      .filter(Boolean);
  }
  if (images.length === 0) {
    images = [thumbnail];
  }

  // Shipping Specs
  const shippingInfo =
    primaryVariant.shipping || raw.shipping || primaryVariant.downloadPack?.shipping;
  const weightKg = shippingInfo?.weightKg ?? shippingInfo?.weight;
  const lengthCm = shippingInfo?.lengthCm ?? shippingInfo?.dimensions?.length;
  const widthCm = shippingInfo?.widthCm ?? shippingInfo?.dimensions?.width;
  const heightCm = shippingInfo?.heightCm ?? shippingInfo?.dimensions?.height;

  const weightStr =
    weightKg != null
      ? `${weightKg}kg`
      : raw.specs?.weight || '0.5kg';
  const dimensionsStr =
    lengthCm != null && widthCm != null && heightCm != null
      ? `${lengthCm} x ${widthCm} x ${heightCm} cm`
      : raw.specs?.dimensions || '15 x 10 x 5 cm';

  const specs: ProductSpecs = {
    weight: weightStr,
    dimensions: dimensionsStr,
    material: raw.specs?.material || 'Supplier Assured Grade',
    origin: raw.specs?.origin || 'India',
    fulfillmentTime: raw.specs?.fulfillmentTime || '24-48 Hours',
    warranty: raw.specs?.warranty || 'Supplier Assured'
  };

  const id = String(raw.id || raw._id || primaryVariant.productId || '');
  const slug = raw.slug || primaryVariant.productSlug || id;
  const name =
    raw.name ||
    raw.title ||
    primaryVariant.productName ||
    primaryVariant.title ||
    'Untitled Product';
  const description =
    raw.description ||
    primaryVariant.description ||
    raw.title ||
    primaryVariant.title ||
    'Supplier verified dropship inventory.';

  const features =
    Array.isArray(raw.features) && raw.features.length > 0
      ? raw.features
      : [
          'Factory Direct Dropship Pricing',
          'Verified Express Courier Dispatch',
          'Commercial Packaging & Protection',
          'Fast Dispatch from Warehouse'
        ];

  const tags =
    Array.isArray(raw.tags) && raw.tags.length > 0
      ? raw.tags
      : [categoryName.toLowerCase(), 'dropship', 'wholesale'];

  return {
    id,
    _id: id,
    slug,
    name,
    sku,
    category: categoryName,
    categoryId,
    dropshipPrice,
    suggestedRetailPrice,
    costEstimate: Number(raw.costEstimate || dropshipPrice),
    stock,
    stockStatus,
    images,
    thumbnail,
    description,
    features,
    specs,
    tags,
    rating: Number(raw.rating || 4.8),
    reviewCount: Number(raw.reviewCount || 18),
    createdAt: raw.createdAt || primaryVariant.createdAt || new Date().toISOString()
  };
}

export const productsService = {
  /**
   * Fetch dropshipping products from the backend catalog API
   * Normalizes every product and provides safe fallback
   */
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    const query = new URLSearchParams();

    // Page & Limit
    query.set('page', String(params?.page || 1));
    query.set('limit', String(params?.limit || 50));

    // Search query
    const searchQuery = (params?.q || params?.search)?.trim();
    if (searchQuery) {
      query.set('q', searchQuery);
    }

    // Only pass categoryId to backend if it is a 24-character hexadecimal ObjectId
    const categoryParam = params?.categoryId || params?.category;
    const isObjectId = typeof categoryParam === 'string' && /^[0-9a-fA-F]{24}$/.test(categoryParam);
    if (isObjectId) {
      query.set('categoryId', categoryParam);
    }

    // Stock availability
    if (params?.inStockOnly || params?.stockStatus === 'in_stock') {
      query.set('inStockOnly', 'true');
    }

    // Sort order
    if (params?.sort) {
      query.set('sort', params.sort);
    }

    const queryString = query.toString();
    const primaryUrl = `/catalog/products?${queryString}`;
    const fallbackUrl = `/api/dropshipper/catalog/products?${queryString}`;

    let rawList: any[] = [];

    try {
      let response = await apiFetch(primaryUrl);
      if (!response.ok) {
        response = await apiFetch(fallbackUrl);
      }

      if (response.ok) {
        const data = await response.json();
        rawList = Array.isArray(data)
          ? data
          : data.products || data.data || [];
      } else {
        console.warn('Backend catalog API responded with status:', response.status);
      }
    } catch (err) {
      console.warn('Failed to fetch from backend catalog API:', err);
    }

    // Normalize fetched products
    let items: Product[] = rawList.map(normalizeProduct);

    // If backend returned nothing (offline or empty DB), fall back to mockProducts
    if (items.length === 0) {
      items = mockProducts.map(normalizeProduct);
    }

    // Client-side category filtering if a name was provided (e.g. "Home & Kitchen")
    if (categoryParam && categoryParam !== 'all' && !isObjectId) {
      const lowerCat = categoryParam.toLowerCase();
      items = items.filter(
        (p) =>
          p.category.toLowerCase() === lowerCat ||
          p.categoryId === categoryParam
      );
    }

    // Client-side stock status filtering if needed
    if (params?.stockStatus && params.stockStatus !== 'all') {
      items = items.filter((p) => p.stockStatus === params.stockStatus);
    }

    // Client-side sorting fallback
    if (params?.sort) {
      switch (params.sort) {
        case 'price_asc':
          items.sort((a, b) => a.dropshipPrice - b.dropshipPrice);
          break;
        case 'price_desc':
          items.sort((a, b) => b.dropshipPrice - a.dropshipPrice);
          break;
        case 'margin_desc':
          items.sort(
            (a, b) =>
              b.suggestedRetailPrice -
              b.dropshipPrice -
              (a.suggestedRetailPrice - a.dropshipPrice)
          );
          break;
        case 'name_asc':
          items.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'newest':
        default:
          items.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }
    }

    // Sync normalized products into global store
    if (items.length > 0) {
      const storeSetProducts = useStore.getState().setProducts;
      if (storeSetProducts) {
        storeSetProducts(items);
      }
    }

    return items;
  },

  /**
   * GET /catalog/products/:slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(slug.trim());
    try {
      let response = await apiFetch(`/catalog/products/${cleanSlug}`);
      if (!response.ok) {
        response = await apiFetch(`/api/dropshipper/catalog/products/${cleanSlug}`);
      }
      if (response.ok) {
        const data = await response.json();
        const raw = data.product || data.data || data;
        if (raw) {
          return normalizeProduct(raw);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch product by slug from catalog API:', e);
    }

    // Fallback search in store products or mockProducts
    const storeProducts = useStore.getState().products;
    const pool = storeProducts.length > 0 ? storeProducts : mockProducts;
    const found = pool.find(
      (p) =>
        p.id === slug ||
        p.slug === slug ||
        p.sku.toLowerCase() === slug.toLowerCase()
    );

    return found ? normalizeProduct(found) : null;
  },

  /**
   * Compatibility alias for getProductById
   */
  async getProductById(id: string): Promise<Product | null> {
    return this.getProductBySlug(id);
  },

  /**
   * GET /catalog/variants/:productCode
   */
  async getVariant(productCode: string): Promise<CatalogVariantDetail | null> {
    if (!productCode) return null;
    const cleanCode = encodeURIComponent(productCode.trim());
    try {
      let response = await apiFetch(`/catalog/variants/${cleanCode}`);
      if (!response.ok) {
        response = await apiFetch(`/api/dropshipper/catalog/variants/${cleanCode}`);
      }
      if (response.ok) {
        const data = await response.json();
        const variant = data.variant || data.data || data;
        if (!variant || typeof variant !== 'object') return null;
        const v = variant as Record<string, unknown>;
        const images = imageList(v.images, v.thumbnail);
        return {
          productCode: String(v.productCode || productCode),
          sku: String(v.sku || v.productCode || productCode),
          name: String(v.title || v.name || ''),
          dropshipPrice: asNumber(v.dropshipPrice),
          suggestedRetailPrice: asNumber(v.suggestedRetailPrice ?? v.dropshipPrice),
          stock: asNumber(v.quantity ?? v.stock),
          images,
          attributes: undefined
        };
      }
    } catch (e) {
      console.warn('Failed to fetch variant details from catalog backend', e);
    }
    return null;
  },

  /**
   * GET /catalog/variants/:productCode/download-pack
   */
  async getDownloadPack(productCode: string): Promise<DownloadPackResponse | null> {
    if (!productCode) return null;
    const cleanCode = encodeURIComponent(productCode.trim());
    try {
      let response = await apiFetch(`/catalog/variants/${cleanCode}/download-pack`);
      if (!response.ok) {
        response = await apiFetch(`/api/dropshipper/catalog/variants/${cleanCode}/download-pack`);
      }
      if (response.ok) {
        const data = await response.json();
        const pack = data.pack || data.downloadPack || data;
        const images = imageList(pack.images || data.images);
        return {
          productCode: String(pack.productCode || productCode),
          images,
          zipUrl: pack.zipUrl,
          title: String(pack.title || pack.productName || ''),
          description: String(pack.description || '')
        };
      }
    } catch (e) {
      console.warn('Failed to fetch download-pack from catalog backend', e);
    }
    return null;
  },

  /**
   * Fetches unique product categories
   */
  async getCategories(): Promise<string[]> {
    try {
      let response = await apiFetch('/catalog/categories');
      if (!response.ok) {
        response = await apiFetch('/api/dropshipper/catalog/categories');
      }
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.categories || data.data || [];
        if (list.length > 0) {
          const names: string[] = list
            .map((c: any) =>
              typeof c === 'object' && c !== null ? String(c.name || c.slug || '') : String(c)
            )
            .filter((s: string): boolean => Boolean(s));
          const unique: string[] = Array.from(new Set(names));
          return unique.includes('all') ? unique : ['all', ...unique];
        }
      }
    } catch (e) {
      console.warn('Backend categories endpoint unavailable, extracting from products:', e);
    }

    // Extract dynamic categories from active products or mock
    const storeProducts = useStore.getState().products;
    const pool = storeProducts.length > 0 ? storeProducts : mockProducts;
    const names = pool
      .map((p) =>
        typeof p.category === 'object' ? (p.category as any)?.name : p.category
      )
      .filter((c): c is string => Boolean(c && typeof c === 'string'));

    const uniqueCategories = Array.from(new Set(names));
    return ['all', ...uniqueCategories];
  }
};
