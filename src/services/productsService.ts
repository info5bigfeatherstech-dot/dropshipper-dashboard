import { Product, SortOption, StockStatus } from '../types';
import { mockProducts } from '../data/mockProducts';
import { apiFetch } from '../lib/api';

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  categoryId?: string;
  category?: string;
  inStockOnly?: boolean;
  sort?: SortOption | 'newest' | 'name_asc' | 'price_asc' | 'price_desc';
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

const EMPTY_SPECS = {
  weight: '—',
  dimensions: '—',
  material: '—',
  origin: 'OWB Warehouse',
  fulfillmentTime: '24-72 Hours',
  warranty: '—'
};

/** API returns category as { id, name, slug } | null — UI expects a string. */
function categoryLabel(category: unknown): string {
  if (category == null) return '';
  if (typeof category === 'string') return category;
  if (typeof category === 'object' && 'name' in (category as object)) {
    const name = (category as { name?: unknown }).name;
    if (name != null && String(name).trim()) return String(name).trim();
  }
  return '';
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asStockStatus(raw: unknown, quantity: number): StockStatus {
  const s = String(raw || '').toLowerCase();
  if (s === 'in_stock' || s === 'low_stock' || s === 'out_of_stock') return s;
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= 5) return 'low_stock';
  return 'in_stock';
}

function imageList(raw: unknown, thumbnail?: unknown): string[] {
  const urls: string[] = [];
  if (Array.isArray(raw)) {
    for (const img of raw) {
      if (typeof img === 'string' && img) urls.push(img);
      else if (img && typeof img === 'object' && typeof (img as { url?: string }).url === 'string') {
        urls.push((img as { url: string }).url);
      }
    }
  }
  if (!urls.length && typeof thumbnail === 'string' && thumbnail) urls.push(thumbnail);
  return urls;
}

/**
 * Normalize backend catalog card/detail into UI Product.
 * - category object → category name string (fixes React child crash)
 * - id uses product slug so `/products/:id` hits GET /catalog/products/:slug
 * - prices/sku/stock taken from first (or cheapest) listed variant
 */
function mapApiCatalogToProducts(raw: unknown): Product[] {
  if (!raw || typeof raw !== 'object') return [];

  const item = raw as Record<string, unknown>;
  const category = categoryLabel(item.category);
  const productName = String(item.name || item.title || 'Product');
  const productId = String(item.id || item._id || item.slug || '');
  const slug = String(item.slug || productId);
  const description = String(item.description || '');
  const brand = item.brand != null ? String(item.brand) : '';

  const variants = Array.isArray(item.variants)
    ? (item.variants as Record<string, unknown>[]).filter((v) => v && typeof v === 'object')
    : [];

  let primary: Record<string, unknown> | null = variants[0] || null;
  if (variants.length > 1) {
    primary = variants.reduce((best, cur) => {
      const bp = asNumber(best.dropshipPrice, Number.POSITIVE_INFINITY);
      const cp = asNumber(cur.dropshipPrice, Number.POSITIVE_INFINITY);
      return cp < bp ? cur : best;
    }, variants[0]);
  }

  const dropshipPrice = asNumber(
    primary?.dropshipPrice ?? item.dropshipPriceMin ?? item.dropshipPrice
  );
  const suggestedRetailPrice = asNumber(
    primary?.suggestedRetailPrice ?? item.suggestedRetailPrice ?? dropshipPrice
  );
  const quantity = asNumber(
    primary?.quantity ?? primary?.stock ?? item.stock ?? item.quantity
  );
  const images = imageList(
    primary?.images ?? item.images,
    primary?.thumbnail || item.thumbnail
  );
  const sku = String(
    primary?.productCode || primary?.sku || item.sku || item.productCode || productId
  );

  return [
    {
      id: slug || productId,
      name: productName,
      sku,
      category,
      dropshipPrice,
      suggestedRetailPrice,
      stock: quantity,
      stockStatus: asStockStatus(primary?.stockStatus ?? item.stockStatus, quantity),
      images,
      thumbnail: String(primary?.thumbnail || item.thumbnail || images[0] || ''),
      description: String(primary?.description || description || ''),
      features: Array.isArray(item.features)
        ? (item.features as string[])
        : brand
          ? [brand]
          : [],
      specs:
        item.specs && typeof item.specs === 'object'
          ? { ...EMPTY_SPECS, ...(item.specs as object) }
          : { ...EMPTY_SPECS },
      tags: Array.isArray(item.tags)
        ? (item.tags as string[])
        : [brand, category].filter(Boolean),
      rating: asNumber(item.rating, 0),
      reviewCount: asNumber(item.reviewCount, 0),
      createdAt: String(item.createdAt || item.updatedAt || new Date().toISOString())
    }
  ];
}

function mapApiPayloadToProducts(payload: unknown): Product[] {
  const data = payload as Record<string, unknown> | unknown[];
  const items = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>)?.products)
      ? ((data as Record<string, unknown>).products as unknown[])
      : Array.isArray((data as Record<string, unknown>)?.data)
        ? ((data as Record<string, unknown>).data as unknown[])
        : data && typeof data === 'object' && (data as Record<string, unknown>).product
          ? [(data as Record<string, unknown>).product]
          : data && typeof data === 'object'
            ? [data]
            : [];

  return items.flatMap((item) => mapApiCatalogToProducts(item));
}

export const productsService = {
  /**
   * Fetch all products from /api/dropshipper/catalog/products
   * Supported query params: page, limit, q, categoryId, inStockOnly, sort
   * Falls back to mockProducts if API endpoint is not yet mounted in dev
   */
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.q || params?.search) query.set('q', (params.q || params.search)!.trim());
    if (params?.categoryId || (params?.category && params.category !== 'all')) {
      query.set('categoryId', (params.categoryId || params.category)!);
    }
    if (params?.inStockOnly) query.set('inStockOnly', 'true');
    if (params?.sort) query.set('sort', params.sort);

    try {
      const response = await apiFetch(`/api/dropshipper/catalog/products?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const mapped = mapApiPayloadToProducts(data);
        if (mapped.length > 0) {
          // Client-side stock filter (API supports inStockOnly boolean only)
          if (params?.stockStatus && params.stockStatus !== 'all') {
            return mapped.filter((p) => p.stockStatus === params.stockStatus);
          }
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Backend catalog API offline, falling back to mock catalog', err);
    }

    // Local fallback for offline/development mode
    let results = [...mockProducts];

    const searchStr = (params?.q || params?.search)?.toLowerCase().trim();
    if (searchStr) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(searchStr) ||
          p.sku.toLowerCase().includes(searchStr) ||
          p.category.toLowerCase().includes(searchStr) ||
          p.tags.some((t) => t.toLowerCase().includes(searchStr))
      );
    }

    if (params?.category && params.category !== 'all') {
      results = results.filter(
        (p) => p.category.toLowerCase() === params.category!.toLowerCase()
      );
    }

    if (params?.stockStatus && params.stockStatus !== 'all') {
      results = results.filter((p) => p.stockStatus === params.stockStatus);
    }

    if (params?.sort) {
      switch (params.sort) {
        case 'price_asc':
          results.sort((a, b) => a.dropshipPrice - b.dropshipPrice);
          break;
        case 'price_desc':
          results.sort((a, b) => b.dropshipPrice - a.dropshipPrice);
          break;
        case 'margin_desc':
          results.sort(
            (a, b) =>
              b.suggestedRetailPrice -
              b.dropshipPrice -
              (a.suggestedRetailPrice - a.dropshipPrice)
          );
          break;
        case 'name_asc':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'newest':
        default:
          results.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }
    }

    return results;
  },

  /**
   * GET /api/dropshipper/catalog/products/:slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await apiFetch(`/api/dropshipper/catalog/products/${slug}`);
      if (response.ok) {
        const data = await response.json();
        const mapped = mapApiPayloadToProducts(data);
        if (mapped.length > 0) return mapped[0];
      }
    } catch (e) {
      console.warn('Failed to fetch product by slug from backend', e);
    }
    const found = mockProducts.find(
      (p) => p.id === slug || p.sku.toLowerCase() === slug.toLowerCase()
    );
    return found ? { ...found } : null;
  },

  /**
   * Compatibility alias for getProductById
   */
  async getProductById(id: string): Promise<Product | null> {
    return this.getProductBySlug(id);
  },

  /**
   * GET /api/dropshipper/catalog/variants/:productCode
   */
  async getVariant(productCode: string): Promise<CatalogVariantDetail | null> {
    try {
      const response = await apiFetch(`/api/dropshipper/catalog/variants/${productCode}`);
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
      console.warn('Failed to fetch variant details from backend', e);
    }
    return null;
  },

  /**
   * GET /api/dropshipper/catalog/variants/:productCode/download-pack
   */
  async getDownloadPack(productCode: string): Promise<DownloadPackResponse | null> {
    try {
      const response = await apiFetch(`/api/dropshipper/catalog/variants/${productCode}/download-pack`);
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
      console.warn('Failed to fetch download-pack from backend', e);
    }
    return null;
  },

  /**
   * Get unique product categories (from live catalog when available)
   */
  async getCategories(): Promise<string[]> {
    try {
      const products = await this.getProducts({ limit: 100 });
      const fromApi = Array.from(
        new Set(products.map((p) => p.category).filter((c) => typeof c === 'string' && c.trim()))
      ).sort((a, b) => a.localeCompare(b));
      if (fromApi.length) return ['all', ...fromApi];
    } catch {
      // fall through to mock
    }
    const categories = Array.from(new Set(mockProducts.map((p) => p.category)));
    return ['all', ...categories];
  }
};
