import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/types';

interface CollectionsGridProps {
  categories: Category[];
}

const fallbackCollections = [
  {
    id: '1',
    name: 'Men',
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600&q=80',
  },
  {
    id: '2',
    name: 'Women',
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80',
  },
  {
    id: '3',
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
  },
  {
    id: '4',
    name: 'Headgear',
    slug: 'headgear',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80',
  },
];

export function CollectionsGrid({ categories }: CollectionsGridProps) {
  const items =
    categories.length > 0
      ? categories.slice(0, 4).map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image_url || fallbackCollections[0].image,
        }))
      : fallbackCollections;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {items.map((item, i) => (
        <Link
          key={item.id}
          href={`/shop/products?category=${item.slug}`}
          className="group relative overflow-hidden aspect-[3/4] bg-blush"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <h3 className="font-display text-ivory text-xl md:text-2xl">
              {item.name}
            </h3>
            <p className="text-[10px] tracking-widest uppercase text-gold-light font-body mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Shop Now →
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
