import { Product, SortOption } from '../types';
import { mockProducts } from '../data/mockProducts';

// Simulated latency helper to mimic real network responses
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ProductFilterParams {
  search?: string;
  category?: string;
  sort?: SortOption;
  stockStatus?: string;
}

export const productsService = {
  /**
   * Fetch all products with optional client/server query filtering and sorting
   * To connect to a real backend, replace the body with:
   * return fetch('/api/v1/products?' + new URLSearchParams(params)).then(r => r.json());
   */
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    await delay(320); // Network simulation

    let results = [...mockProducts];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
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
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    await delay(200);
    const found = mockProducts.find((p) => p.id === id);
    return found ? { ...found } : null;
  },

  /**
   * Get unique product categories
   */
  async getCategories(): Promise<string[]> {
    await delay(100);
    const categories = Array.from(new Set(mockProducts.map((p) => p.category)));
    return ['all', ...categories];
  }
};
