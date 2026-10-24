/**
 * Catalog data-access layer.
 *
 * Every page reads data through these async functions — never from the JSON
 * files directly. To move to a real backend (Shopify Storefront API, Supabase,
 * a headless CMS…), re-implement these functions and map the responses to the
 * types in `lib/types.ts`. Nothing else in the app has to change.
 */
import brandsData from '@/data/brands.json';
import categoriesData from '@/data/categories.json';
import contentData from '@/data/content.json';
import pagesData from '@/data/pages.json';
import productsData from '@/data/products.json';
import reviewsData from '@/data/reviews.json';
import { isOnSale } from './filters';
import { matchesQuery } from './search';
import type {
  Brand,
  Category,
  CategorySlug,
  InfoPage,
  Locale,
  Product,
  ProductTag,
  Review,
  SearchIndexEntry,
  SiteContent,
} from './types';

const products = productsData as Product[];
const categories = categoriesData as Category[];
const brands = brandsData as Brand[];
const reviews = reviewsData as Review[];
const content = contentData as SiteContent;
const infoPages = pagesData as InfoPage[];

/** Virtual collections that behave like categories in the PLP. */
export type CollectionSlug = CategorySlug | 'sale' | 'new';

export const COLLECTION_SLUGS: CollectionSlug[] = [
  ...(categories.map((category) => category.slug) as CategorySlug[]),
  'sale',
  'new',
];

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((product) => product.slug === slug);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return ids.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[];
}

export async function getProductsByCollection(slug: CollectionSlug, subcategory?: string): Promise<Product[]> {
  if (slug === 'sale') return products.filter(isOnSale);
  if (slug === 'new') {
    return products
      .filter((product) => product.tags.includes('new') || product.tags.includes('just-dropped'))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return products.filter(
    (product) => product.category === slug && (!subcategory || product.subcategory === subcategory),
  );
}

export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  return products.filter((product) => product.brand === brandSlug);
}

export async function getProductsByTag(tag: ProductTag, limit = 12): Promise<Product[]> {
  return products
    .filter((product) => product.tags.includes(tag))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 10): Promise<Product[]> {
  const sameCategory = products.filter((item) => item.id !== product.id && item.category === product.category);
  const others = products.filter((item) => item.id !== product.id && item.category !== product.category && item.brand === product.brand);
  return [...sameCategory, ...others].slice(0, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  return products.filter((product) => {
    const brand = brands.find((item) => item.slug === product.brand);
    const category = categories.find((item) => item.slug === product.category);
    const haystack = [
      product.name.ar,
      product.name.en,
      brand?.name,
      category?.name.ar,
      category?.name.en,
      product.subcategory,
      ...product.tags,
      ...product.concerns,
    ].join(' ');
    return matchesQuery(haystack, query);
  });
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return categories.find((category) => category.slug === slug);
}

export async function getBrands(): Promise<Brand[]> {
  return [...brands].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getBrand(slug: string): Promise<Brand | undefined> {
  return brands.find((brand) => brand.slug === slug);
}

export async function getSiteContent(): Promise<SiteContent> {
  return content;
}

export async function getInfoPages(): Promise<InfoPage[]> {
  return infoPages;
}

export async function getInfoPage(slug: string): Promise<InfoPage | undefined> {
  return infoPages.find((page) => page.slug === slug);
}

/* ---------- Reviews ---------- */

/** Small deterministic hash so each product gets a stable, different set of mock reviews. */
function seed(value: string) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

export async function getReviews(product: Product): Promise<Review[]> {
  const offset = seed(product.id) % reviews.length;
  const rotated = [...reviews.slice(offset), ...reviews.slice(0, offset)];
  // Keep the mock reviews roughly consistent with the product's average rating.
  const pool = product.rating >= 4.6 ? rotated.filter((review) => review.rating >= 3) : rotated;
  return pool.slice(0, 8).map((review) => ({ ...review, id: `${product.id}-${review.id}` }));
}

/** Star distribution [5★, 4★, 3★, 2★, 1★] that adds up to `reviewCount` and matches `rating`. */
export async function getRatingBreakdown(product: Product): Promise<number[]> {
  const weights = [5, 4, 3, 2, 1].map((stars) => Math.exp(-Math.abs(stars - product.rating) * 1.6));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const counts = weights.map((weight) => Math.round((weight / total) * product.reviewCount));
  counts[0] += product.reviewCount - counts.reduce((sum, count) => sum + count, 0);
  return counts;
}

/* ---------- Search index (shipped to the client for autocomplete) ---------- */

export async function getSearchIndex(locale: Locale): Promise<SearchIndexEntry[]> {
  void locale; // Entries carry both languages; the locale param keeps the signature backend-ready.
  const brandName = (slug: string) => brands.find((brand) => brand.slug === slug)?.name ?? '';
  return [
    ...categories.map<SearchIndexEntry>((category) => ({
      type: 'category',
      label: category.name,
      href: `/c/${category.slug}`,
    })),
    ...brands.map<SearchIndexEntry>((brand) => ({
      type: 'brand',
      label: { ar: brand.name, en: brand.name },
      href: `/brands/${brand.slug}`,
    })),
    ...products.map<SearchIndexEntry>((product) => ({
      type: 'product',
      label: product.name,
      sublabel: brandName(product.brand),
      href: `/p/${product.slug}`,
      image: product.images[0],
    })),
  ];
}
