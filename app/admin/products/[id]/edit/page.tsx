import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Product' };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select(`
        *,
        categories:categories!product_categories(id, name, slug),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('categories')
      .select('*')
      .order('sort_order'),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">Edit Product</h1>
        <p className="text-sm text-stone font-body mt-1">{product.name}</p>
      </div>
      <ProductForm product={product as any} categories={categories || []} />
    </div>
  );
}