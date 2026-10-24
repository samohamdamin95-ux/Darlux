# Darlux — Beauty Storefront Template

A production-quality beauty & cosmetics storefront built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** and **Zustand**.
Arabic is the default language (full RTL); English is the second language.

> Darlux and every brand, product and price in this repo are fictional. Layout and UX patterns are inspired by large beauty retailers; no third-party logos, imagery or copy are used.

## Quick start

```bash
cd darlux
npm install
npm run dev          # http://localhost:3000  → redirects to /ar
```

Other scripts:

```bash
npm run build        # production build (static pages + typecheck + lint)
npm run start        # serve the production build
npm run lint         # ESLint (next/core-web-vitals + typescript)
npm run typecheck    # tsc --noEmit
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your domain (used for canonical URLs, Open Graph and the sitemap).

## Deploy to Vercel

**From the dashboard:** import the repository at <https://vercel.com/new>, set **Root Directory** to `darlux`, add the `NEXT_PUBLIC_SITE_URL` environment variable and deploy. The framework preset (Next.js) is detected automatically.

**From the CLI:**

```bash
npm i -g vercel
cd darlux
vercel link                                   # create / link the project
vercel env add NEXT_PUBLIC_SITE_URL production
vercel                                        # preview deployment
vercel --prod                                 # production deployment
```

## What's inside

| Area | Highlights |
| --- | --- |
| Global | Rotating announcement bar (pausable), sticky header, search autocomplete (ARIA combobox, Arabic-aware matching), mega menu with featured image, mobile drawer with accordion categories, footer with newsletter, language & currency selectors |
| Home | Autoplay hero carousel (pause, reduced-motion aware), category tiles, New / Bestsellers / Just dropped carousels, brands strip, promo banners, Darlux Circle loyalty tiers, beauty quiz CTA |
| PLP | Breadcrumbs, subcategory chips, filters (brand, price, rating, skin type, concern, finish, color) in a sidebar or mobile bottom sheet, sort, active-filter chips, load more, all state in the URL |
| PDP | Gallery with thumbnails and click-to-zoom, shade swatches that swap the main image, size selector, quantity, add to basket / wishlist, tabs (details, how to use, ingredients), reviews with breakdown, filters and sort, "You may also like", "Recently viewed", Product JSON-LD |
| Cart | Slide-out mini cart and full basket page with quantity edit, remove, move to wishlist, promo codes (`DARLUX10`, `WELCOME15`), free-shipping progress bar, order summary |
| Checkout | Shipping → Delivery → Payment → Review with validation (email, phone, postal code, Luhn card check, expiry), error summary and focus management, card or cash on delivery. **UI only — no payment is processed.** |
| Account | Mock sign-in / register, orders, wishlist, Darlux Circle points and tiers (Insider, VIP, Elite) |
| Extras | Search results page (reuses the PLP), brands A–Z, beauty quiz, info pages, localized 404, `sitemap.xml`, `robots.txt` |

## Project structure

```
darlux/
├─ app/
│  ├─ [locale]/                 Root layout per locale (lang + dir), all pages
│  │  ├─ page.tsx               Home
│  │  ├─ c/[category]/          PLP (categories + virtual "sale" / "new")
│  │  ├─ brands/  brands/[brand]/
│  │  ├─ p/[slug]/              PDP
│  │  ├─ search/  cart/  checkout/  account/  wishlist/  quiz/  info/[slug]/
│  │  ├─ not-found.tsx  [...rest]/   Localized 404
│  ├─ api/products/route.ts     Product lookup by ids (recently viewed, wishlist)
│  ├─ sitemap.ts  robots.ts  globals.css
├─ components/
│  ├─ ui/        Button, Dialog/Drawer, Tabs, Accordion, Carousel, Price, Rating, Skeleton, Field, SmartImage…
│  ├─ layout/    AnnouncementBar, Header, SearchBar, MegaMenu, MobileNav, Footer, Locale/Currency selectors
│  ├─ product/   ProductCard, ProductCarousel, QuickLook, PurchasePanel, ProductGallery, Reviews…
│  ├─ plp/  home/  cart/  checkout/  account/  quiz/  providers/
├─ data/         products.json (29), brands.json, categories.json, reviews.json, content.json, pages.json
├─ i18n/         config.ts, dictionaries/{ar,en}.json, server.ts, translator.ts (typed keys)
├─ lib/          catalog.ts (data layer), filters.ts, format.ts, seo.ts, validation.ts, types.ts…
├─ store/        Zustand stores persisted to localStorage (cart, wishlist, recently viewed, account, preferences)
├─ middleware.ts Redirects unprefixed URLs to /ar (or the saved language)
└─ tailwind.config.ts   Design tokens (colors, type, radii, shadows, motion)
```

## Connecting a real backend

All data flows through **`lib/catalog.ts`**: pages never import the JSON files directly. To use Shopify, Supabase or any API, re-implement those async functions and map responses to the types in `lib/types.ts`.

- **Shopify:** use the Storefront API for products and collections, and the Cart API in `store/cart.ts`, then hand off to Shopify Checkout.
- **Supabase:** store products in Postgres, use Supabase Auth in `store/account.ts`, and read orders from the database.
- **Stripe:** replace `placeOrder` in `components/checkout/CheckoutFlow.tsx` with a server action that creates a Checkout Session or a PaymentIntent.

Prices are stored in a base currency (USD) and converted for display (`lib/format.ts`, static demo rates for SAR, AED and USD).

## Internationalization & RTL

- Locales live in `i18n/config.ts` (`ar` is the default). UI strings are in `i18n/dictionaries/*.json`. Translation keys are type-checked, so a typo fails the build.
- Product and content data carry both languages (`{ ar, en }`).
- Layout uses logical utilities (`ms-`, `ps-`, `start-`, `end-`, `text-start`) plus `rtl:` / `ltr:` variants for direction-specific motion, so components need no per-language code.
- Fonts: IBM Plex Sans Arabic + Montserrat via `next/font`. Each locale leads with its own script.
- To add a language, add it to `locales`, create a dictionary and add the field to `LocalizedString`.

## Accessibility & performance

- Semantic landmarks, skip link, visible focus rings, `prefers-reduced-motion` support.
- Dialogs trap focus, close on Escape and restore focus. Search is an ARIA combobox, PDP tabs follow the WAI-ARIA tabs pattern, carousels have pause controls.
- Forms use labels, `aria-invalid`, `aria-describedby` and error summaries, and focus the first invalid field.
- 130+ pages are statically generated; first-load JS is about 103–136 kB per route.
- Images use `next/image` with lazy loading. `SmartImage` shows an on-brand placeholder if a remote image fails to load.
