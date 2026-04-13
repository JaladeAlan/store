import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const products = await searchProducts(q, 8);
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
