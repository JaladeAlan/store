import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HeroSection } from '@/components/shop/HeroSection';
import { FeaturedProducts } from '@/components/shop/FeaturedProducts';
import { CollectionsGrid } from '@/components/shop/CollectionsGrid';
import { BrandValues } from '@/components/shop/BrandValues';
import { NewsletterBanner } from '@/components/shop/NewsletterBanner';
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton';
import { getFeaturedProducts, getCategories } from '@/lib/products';

const appname = process.env.NEXT_PUBLIC_APP_NAME;

export const metadata: Metadata = {
  title: `${appname} — Premium Contemporary Fashion`,
  description:
    `Discover premium contemporary fashion at ${appname}. Curated collections of elevated essentials.`,
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <div className="page-enter">
      {/* Hero */}
      <HeroSection />

      {/* Collections */}
      <section className="py-20">
        <div className="container-luxe">
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">Explore</p>
            <h2 className="section-title">Our Collections</h2>
          </div>
          <CollectionsGrid categories={categories} />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-blush">
        <div className="container-luxe">
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">Handpicked</p>
            <h2 className="section-title">Featured Pieces</h2>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <FeaturedProducts products={featuredProducts} />
          </Suspense>
        </div>
      </section>

      {/* Brand Values */}
      <BrandValues />

      {/* Newsletter */}
      <NewsletterBanner />
    </div>
  );
}
