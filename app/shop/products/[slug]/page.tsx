import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { ProductGallery } from '@/components/shop/ProductGallery';
import { ProductInfo } from '@/components/shop/ProductInfo';
import { ProductCard } from '@/components/shop/ProductCard';
import { formatPrice } from '@/lib/utils';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: 'Product Not Found' };

  const primaryImage = product.images?.find((img) => img.is_primary);

  return {
    title: product.name,
    description:
      product.description ||
      `Shop ${product.name} at LUXE. Premium contemporary fashion.`,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: primaryImage
        ? [{ url: primaryImage.url, alt: product.name }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category_id,
    4
  );

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map((img) => img.url) || [],
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'LUXE',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/products/${product.slug}`,
      priceCurrency: 'NGN',
      price: product.price,
      availability: product.variants?.some((v) => v.stock_quantity > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="page-enter">
        <div className="container-luxe py-8 md:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-body text-stone mb-8">
            <a href="/" className="hover:text-ink transition-colors duration-200">
              Home
            </a>
            <span>/</span>
            <a
              href="/shop/products"
              className="hover:text-ink transition-colors duration-200"
            >
              Shop
            </a>
            {product.category && (
              <>
                <span>/</span>
                <a
                  href={`/shop/products?category=${product.category.slug}`}
                  className="hover:text-ink transition-colors duration-200"
                >
                  {product.category.name}
                </a>
              </>
            )}
            <span>/</span>
            <span className="text-ink">{product.name}</span>
          </nav>

          {/* Product Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Gallery */}
            <ProductGallery images={product.images || []} name={product.name} />

            {/* Product Info */}
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-16 border-t border-sand">
            <div className="container-luxe">
              <div className="mb-10">
                <p className="section-subtitle mb-2">You may also like</p>
                <h2 className="section-title">Related Pieces</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
