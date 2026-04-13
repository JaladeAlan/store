import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return user;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, categories:categories!product_categories(*), images:product_images(*), variants:product_variants(*)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const {
      name, slug, description, price, compare_at_price,
      category_ids = [],
      status, featured, sku, tags, variants, images,
    } = body;

    const supabase = createAdminClient();

    // Update product
    const { error: productError } = await supabase
      .from('products')
      .update({
        name,
        slug,
        description,
        price,
        compare_at_price: compare_at_price || null,
        category_id: category_ids[0] || null,
        status,
        featured,
        sku: sku || null,
        tags: tags || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (productError) throw productError;

    // Replace category junction rows
    await supabase.from('product_categories').delete().eq('product_id', id);
    if (category_ids.length > 0) {
      const junctionRows = category_ids.map((cid: string) => ({
        product_id: id,
        category_id: cid,
      }));
      await supabase.from('product_categories').insert(junctionRows);
    }

    // Replace variants
    if (variants) {
      await supabase.from('product_variants').delete().eq('product_id', id);
      if (variants.length > 0) {
        const variantRows = variants.map((v: { size: string; color: string; stock_quantity: number; sku: string }) => ({
          product_id: id,
          size: v.size,
          color: v.color || null,
          stock_quantity: v.stock_quantity || 0,
          sku: v.sku || null,
        }));
        const { error } = await supabase.from('product_variants').insert(variantRows);
        if (error) throw error;
      }
    }

    // Replace images
    if (images) {
      await supabase.from('product_images').delete().eq('product_id', id);
      if (images.length > 0) {
        const imageRows = images.map((img: { url: string; is_primary: boolean; sort_order: number }, i: number) => ({
          product_id: id,
          url: img.url,
          is_primary: img.is_primary || i === 0,
          sort_order: img.sort_order ?? i,
          alt_text: name,
        }));
        const { error } = await supabase.from('product_images').insert(imageRows);
        if (error) throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  // Soft delete — archive
  const { error } = await supabase
    .from('products')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}