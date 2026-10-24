/**
 * Domain types. These describe the storefront's data contract — any backend
 * (Shopify, Supabase, a CMS…) only has to map its payloads to these shapes
 * inside `lib/catalog.ts`.
 */

export type Locale = 'ar' | 'en';

export type LocalizedString = Record<Locale, string>;

export type CategorySlug = 'makeup' | 'skincare' | 'fragrance' | 'hair' | 'tools' | 'bath-body';

export type ProductTag = 'new' | 'bestseller' | 'just-dropped' | 'exclusive';

export type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';

export type Concern =
  | 'hydration'
  | 'acne'
  | 'aging'
  | 'dullness'
  | 'dark-spots'
  | 'pores'
  | 'frizz'
  | 'damage'
  | 'long-wear';

export type Finish = 'matte' | 'satin' | 'dewy' | 'natural' | 'shimmer' | 'radiant';

export type ColorFamily = 'nude' | 'pink' | 'red' | 'berry' | 'brown' | 'gold' | 'neutral' | 'black';

export interface Shade {
  id: string;
  name: LocalizedString;
  hex: string;
  family: ColorFamily;
  /** Index into `Product.images` shown when this shade is selected. */
  imageIndex: number;
}

export interface ProductSize {
  id: string;
  label: string;
  price: number;
  salePrice: number | null;
}

export interface Product {
  id: string;
  slug: string;
  /** Brand slug — resolve with `getBrand()`. */
  brand: string;
  name: LocalizedString;
  /** Prices are stored in the base currency (USD) and converted on display. */
  price: number;
  salePrice: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  shades: Shade[];
  sizes: ProductSize[];
  category: CategorySlug;
  subcategory: string;
  tags: ProductTag[];
  skinTypes: SkinType[];
  concerns: Concern[];
  finish: Finish | null;
  description: LocalizedString;
  howToUse: LocalizedString;
  ingredients: LocalizedString;
  createdAt: string;
}

export interface Subcategory {
  slug: string;
  name: LocalizedString;
}

export interface Category {
  slug: CategorySlug;
  name: LocalizedString;
  description: LocalizedString;
  image: string;
  subcategories: Subcategory[];
  featured: {
    title: LocalizedString;
    image: string;
    href: string;
  };
}

export interface Brand {
  slug: string;
  name: string;
  tagline: LocalizedString;
  /** Visual treatment for the typographic wordmark. */
  wordmark: 'caps' | 'light' | 'italic' | 'bold';
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: LocalizedString;
  body: LocalizedString;
  skinType: SkinType;
  date: string;
  helpful: number;
  verified: boolean;
}

export interface HeroSlide {
  id: string;
  eyebrow: LocalizedString;
  title: LocalizedString;
  subtitle: LocalizedString;
  cta: LocalizedString;
  href: string;
  image: string;
  theme: 'light' | 'dark';
}

export interface PromoBanner {
  id: string;
  eyebrow: LocalizedString;
  title: LocalizedString;
  cta: LocalizedString;
  href: string;
  image: string;
}

export interface SiteContent {
  announcements: { id: string; text: LocalizedString; href: string }[];
  heroSlides: HeroSlide[];
  promoBanners: PromoBanner[];
}

export type SortKey = 'featured' | 'new' | 'price-asc' | 'price-desc' | 'rating';

export interface ProductFilters {
  brands: string[];
  priceMin: number | null;
  priceMax: number | null;
  rating: number | null;
  skinTypes: SkinType[];
  concerns: Concern[];
  finishes: Finish[];
  colors: ColorFamily[];
}

export interface InfoPage {
  slug: string;
  title: LocalizedString;
  body: Record<Locale, string[]>;
}

/** Lightweight record shipped to the client for search autocomplete. */
export interface SearchIndexEntry {
  type: 'product' | 'brand' | 'category';
  label: LocalizedString;
  sublabel?: string;
  href: string;
  image?: string;
}
