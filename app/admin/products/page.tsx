import Link from 'next/link';
import Image from 'next/image';
import { createAdminClient } from '@/lib/supabase/server';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { Plus } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Products' };

export default async function AdminProductsPage() {
  // createAdminClient is synchronous — no await needed
  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      categories:categories!product_categories(id, name),
      images:product_images(url, is_primary)
    `)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="text-sm text-stone font-body mt-1">{products?.length ?? 0} total products</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      <div className="bg-white border border-sand overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead className="bg-blush">
            <tr>
              {['', 'Name', 'Categories', 'Price', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs tracking-widest uppercase text-stone font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => {
              const img = product.images?.find((i: { is_primary: boolean }) => i.is_primary) ?? product.images?.[0];
              const categoryNames = (product.categories as { name: string }[] | null)
                ?.map((c) => c.name)
                .join(', ') || '—';

              return (
                <tr key={product.id} className="border-t border-sand hover:bg-blush/50 transition-colors duration-200">
                  <td className="py-3 px-4 w-12">
                    <div className="relative w-10 h-12 bg-blush overflow-hidden">
                      {img && (
                        <Image
                          src={getImageUrl(img.url)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-ink max-w-[200px]">
                    <div className="truncate">{product.name}</div>
                    {product.sku && <div className="text-[11px] text-stone">SKU: {product.sku}</div>}
                  </td>
                  <td className="py-3 px-4 text-stone text-xs">{categoryNames}</td>
                  <td className="py-3 px-4">
                    {formatPrice(product.price)}
                    {product.compare_at_price && (
                      <div className="text-[11px] text-stone line-through">{formatPrice(product.compare_at_price)}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] tracking-widest uppercase rounded-sm ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' :
                      product.status === 'draft'  ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-600'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-xs text-gold hover:text-gold-dark transition-colors duration-200">
                        Edit
                      </Link>
                      <Link href={`/shop/products/${product.slug}`} target="_blank" className="text-xs text-stone hover:text-ink transition-colors duration-200">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}