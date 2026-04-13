import Link from 'next/link';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types';

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-stone font-body text-sm">No featured products yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/shop/products" className="btn-secondary">
          View All Products
        </Link>
      </div>
    </div>
  );
}
