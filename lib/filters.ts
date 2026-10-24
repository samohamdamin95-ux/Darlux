import type { ColorFamily, Concern, Finish, Product, ProductFilters, SkinType, SortKey } from './types';

export const SORT_KEYS: SortKey[] = ['featured', 'new', 'price-asc', 'price-desc', 'rating'];

export const SKIN_TYPES: SkinType[] = ['dry', 'oily', 'combination', 'normal', 'sensitive'];
export const CONCERNS: Concern[] = ['hydration', 'acne', 'aging', 'dullness', 'dark-spots', 'pores', 'frizz', 'damage', 'long-wear'];
export const FINISHES: Finish[] = ['matte', 'satin', 'dewy', 'natural', 'shimmer', 'radiant'];
export const COLOR_FAMILIES: ColorFamily[] = ['nude', 'pink', 'red', 'berry', 'brown', 'gold', 'neutral', 'black'];

export const COLOR_SWATCH: Record<ColorFamily, string> = {
  nude: '#D6A58E',
  pink: '#E39AAE',
  red: '#A3182B',
  berry: '#6E1E3A',
  brown: '#7A4A3A',
  gold: '#C9A15B',
  neutral: '#E6C3A4',
  black: '#111111',
};

export const RATING_OPTIONS = [4, 3, 2];

export const EMPTY_FILTERS: ProductFilters = {
  brands: [],
  priceMin: null,
  priceMax: null,
  rating: null,
  skinTypes: [],
  concerns: [],
  finishes: [],
  colors: [],
};

export function effectivePrice(product: Pick<Product, 'price' | 'salePrice'>) {
  return product.salePrice ?? product.price;
}

export function isOnSale(product: Pick<Product, 'price' | 'salePrice'>) {
  return product.salePrice !== null && product.salePrice < product.price;
}

const intersects = <T,>(selected: T[], values: T[]) =>
  selected.length === 0 || selected.some((value) => values.includes(value));

export function applyFilters(products: Product[], filters: ProductFilters) {
  return products.filter((product) => {
    const price = effectivePrice(product);
    if (filters.brands.length && !filters.brands.includes(product.brand)) return false;
    if (filters.priceMin !== null && price < filters.priceMin) return false;
    if (filters.priceMax !== null && price > filters.priceMax) return false;
    if (filters.rating !== null && product.rating < filters.rating) return false;
    if (!intersects(filters.skinTypes, product.skinTypes)) return false;
    if (!intersects(filters.concerns, product.concerns)) return false;
    if (filters.finishes.length && (!product.finish || !filters.finishes.includes(product.finish))) return false;
    if (!intersects(filters.colors, product.shades.map((shade) => shade.family))) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortKey) {
  const sorted = [...products];
  switch (sort) {
    case 'new':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'price-asc':
      return sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case 'price-desc':
      return sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    default:
      // "Featured": bestsellers and exclusives first, then by popularity.
      return sorted.sort((a, b) => featuredScore(b) - featuredScore(a));
  }
}

function featuredScore(product: Product) {
  let score = product.reviewCount / 1000 + product.rating;
  if (product.tags.includes('bestseller')) score += 3;
  if (product.tags.includes('exclusive')) score += 1.5;
  if (product.tags.includes('just-dropped')) score += 1;
  return score;
}

/* ---------- URL <-> filters ---------- */

type ParamsLike = { get(name: string): string | null };

const list = <T extends string,>(params: ParamsLike, key: string, allowed?: readonly T[]) => {
  const raw = params.get(key);
  if (!raw) return [] as T[];
  const values = raw.split(',').filter(Boolean) as T[];
  return allowed ? values.filter((value) => allowed.includes(value)) : values;
};

const num = (params: ParamsLike, key: string) => {
  const raw = params.get(key);
  if (raw === null || raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

export function parseFilters(params: ParamsLike): ProductFilters {
  return {
    brands: list(params, 'brand'),
    priceMin: num(params, 'min'),
    priceMax: num(params, 'max'),
    rating: num(params, 'rating'),
    skinTypes: list(params, 'skin', SKIN_TYPES),
    concerns: list(params, 'concern', CONCERNS),
    finishes: list(params, 'finish', FINISHES),
    colors: list(params, 'color', COLOR_FAMILIES),
  };
}

export function parseSort(params: ParamsLike): SortKey {
  const raw = params.get('sort') as SortKey | null;
  return raw && SORT_KEYS.includes(raw) ? raw : 'featured';
}

/** Writes filters + sort into a copy of the given params (other params such as `q` are kept). */
export function filtersToParams(base: URLSearchParams, filters: ProductFilters, sort: SortKey) {
  const params = new URLSearchParams(base);
  const set = (key: string, value: string | null) => (value ? params.set(key, value) : params.delete(key));
  set('brand', filters.brands.join(','));
  set('min', filters.priceMin !== null ? String(filters.priceMin) : null);
  set('max', filters.priceMax !== null ? String(filters.priceMax) : null);
  set('rating', filters.rating !== null ? String(filters.rating) : null);
  set('skin', filters.skinTypes.join(','));
  set('concern', filters.concerns.join(','));
  set('finish', filters.finishes.join(','));
  set('color', filters.colors.join(','));
  set('sort', sort === 'featured' ? null : sort);
  return params;
}

export function countActiveFilters(filters: ProductFilters) {
  return (
    filters.brands.length +
    filters.skinTypes.length +
    filters.concerns.length +
    filters.finishes.length +
    filters.colors.length +
    (filters.rating !== null ? 1 : 0) +
    (filters.priceMin !== null || filters.priceMax !== null ? 1 : 0)
  );
}

/* ---------- Facets ---------- */

export interface Facets {
  brands: { value: string; count: number }[];
  skinTypes: { value: SkinType; count: number }[];
  concerns: { value: Concern; count: number }[];
  finishes: { value: Finish; count: number }[];
  colors: { value: ColorFamily; count: number }[];
  priceRange: [number, number];
}

function tally<T extends string>(order: readonly T[], values: T[][]) {
  const counts = new Map<T, number>();
  values.forEach((group) => new Set(group).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1)));
  return order.filter((value) => counts.has(value)).map((value) => ({ value, count: counts.get(value)! }));
}

/** Facet options are derived from the unfiltered set so options never disappear while filtering. */
export function getFacets(products: Product[]): Facets {
  const prices = products.map(effectivePrice);
  const brandOrder = [...new Set(products.map((product) => product.brand))].sort();
  return {
    brands: tally(brandOrder, products.map((product) => [product.brand])),
    skinTypes: tally(SKIN_TYPES, products.map((product) => product.skinTypes)),
    concerns: tally(CONCERNS, products.map((product) => product.concerns)),
    finishes: tally(FINISHES, products.map((product) => (product.finish ? [product.finish] : []))),
    colors: tally(COLOR_FAMILIES, products.map((product) => product.shades.map((shade) => shade.family))),
    priceRange: prices.length ? [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] : [0, 0],
  };
}
