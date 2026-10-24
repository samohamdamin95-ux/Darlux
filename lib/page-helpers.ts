import { getBrands } from './catalog';

/** Brand slug → display name, used by product cards. */
export async function getBrandNames() {
  const brands = await getBrands();
  return Object.fromEntries(brands.map((brand) => [brand.slug, brand.name]));
}
