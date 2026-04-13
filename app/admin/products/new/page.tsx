import { createAdminClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'New Product' };

export default async function NewProductPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order');

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">New Product</h1>
        <p className="text-sm text-stone font-body mt-1">Add a new product to your store</p>
      </div>
      <ProductForm categories={categories || []} />
    </div>
  );
}