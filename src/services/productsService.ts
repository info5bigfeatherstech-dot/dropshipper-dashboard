import { Product, SortOption } from '../types';
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
        const items = Array.isArray(data) ? data : data.products || data.data || [];
        if (items.length > 0) return items;
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
        return data.product || data.data || data;
      }
    } catch (e) {
      console.warn('Failed to fetch product by slug from backend', e);
    }
    const found = mockProducts.find((p) => p.id === slug || p.sku.toLowerCase() === slug.toLowerCase());
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
        return data.variant || data.data || data;
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
        return await response.json();
      }
    } catch (e) {
      console.warn('Failed to fetch download-pack from backend', e);
    }
    return null;
  },

  /**
   * Get unique product categories
   */
  async getCategories(): Promise<string[]> {
    const categories = Array.from(new Set(mockProducts.map((p) => p.category)));
    return ['all', ...categories];
  }
};
