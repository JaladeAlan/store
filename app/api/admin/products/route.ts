import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return user;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(searchParams.get('pageSize') || 20);
  const status = searchParams.get('status');

  const supabase = await createAdminClient();
  let query = supabase
    .from('products')
    .select('*, category:categories(name), images:product_images(*), variants:product_variants(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data, count });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, slug, description, price, compare_at_price, category_id, status,
            featured, sku, tags, variants, images } = body;

    if (!name || !price) {
      return NextResponse.json({ success: false, error: 'Name and price are required' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const finalSlug = slug || slugify(name);

    // Check slug uniqueness
    const { data: existing } = await supabase.from('products').select('id').eq('slug', finalSlug).single();
    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({ name, slug: finalSlug, description, price, compare_at_price, category_id: category_id || null,
                status: status || 'draft', featured: featured || false, sku: sku || null, tags: tags || [] })
      .select()
      .single();

    if (productError) throw productError;

    // Insert variants
    if (variants?.length > 0) {
      const variantRows = variants.map((v: { size: string; color: string; stock_quantity: number; sku: string }) => ({
        product_id: product.id, size: v.size, color: v.color || null,
        stock_quantity: v.stock_quantity || 0, sku: v.sku || null,
      }));
      const { error: variantsError } = await supabase.from('product_variants').insert(variantRows);
      if (variantsError) throw variantsError;
    }

    // Insert images
    if (images?.length > 0) {
      const imageRows = images.map((img: { url: string; is_primary: boolean; sort_order: number }, i: number) => ({
        product_id: product.id, url: img.url, is_primary: img.is_primary || i === 0,
        sort_order: img.sort_order ?? i, alt_text: name,
      }));
      const { error: imagesError } = await supabase.from('product_images').insert(imageRows);
      if (imagesError) throw imagesError;
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
