import { NextResponse, type NextRequest } from 'next/server';
import { getProductsByIds } from '@/lib/catalog';

/**
 * GET /api/products?ids=dl-001,dl-002
 * Used by client-only lists (recently viewed, wishlist) whose ids live in
 * localStorage. Swap the catalog for a real backend and this keeps working.
 */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get('ids') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 50);
  const products = await getProductsByIds(ids);
  return NextResponse.json({ products }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}
