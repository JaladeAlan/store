import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/products';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton';
import { ProductFiltersPanel } from '@/components/shop/ProductFiltersPanel';
import type { ProductFilters } from '@/types';

export const metadata: Metadata = {
  title: 'Shop All',
  description: 'Browse our full collection of premium contemporary fashion.',
};

export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sizes?: string;
    sort?: string;
    search?: string;
    featured?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const filters: ProductFilters = {
    category: params.category,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sizes: params.sizes ? params.sizes.split(',') : undefined,
    sort: (params.sort as ProductFilters['sort']) || 'newest',
    search: params.search,
    featured: params.featured === 'true' ? true : undefined,
    page: params.page ? Number(params.page) : 1,
    pageSize: 12,
  };

  const [{ data: products, count, totalPages }, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  const currentPage = filters.page || 1;

  return (
    <div className="page-enter">
      {/* Page Header */}
      <div className="container-luxe py-10 border-b border-sand">
        <p className="section-subtitle mb-2">Collection</p>
        <h1 className="section-title">
          {params.category
            ? categories.find((c) => c.slug === params.category)?.name || 'Products'
            : params.search
            ? `Search: "${params.search}"`
            : params.featured === 'true'
            ? 'Featured Pieces'
            : 'All Products'}
        </h1>
        {count > 0 && (
          <p className="text-xs text-stone font-body mt-2">
            {count} {count === 1 ? 'product' : 'products'}
          </p>
        )}
      </div>

      <div className="container-luxe py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <ProductFiltersPanel
              categories={categories}
              activeFilters={filters}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display text-2xl text-ink mb-3">
                  No products found
                </p>
                <p className="text-sm text-stone font-body">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        const searchParams = new URLSearchParams(params as Record<string, string>);
                        searchParams.set('page', String(page));
                        return (
                          <a
                            key={page}
                            href={`?${searchParams.toString()}`}
                            className={`w-9 h-9 flex items-center justify-center text-xs font-body transition-all duration-200 ${
                              page === currentPage
                                ? 'bg-ink text-ivory'
                                : 'border border-sand text-stone hover:border-ink hover:text-ink'
                            }`}
                          >
                            {page}
                          </a>
                        );
                      }
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
