'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { formatPrice, cn, getImageUrl } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleItem, isWishlisted } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const secondaryImage = product.images?.[1];

  const wishlisted = isWishlisted(product.id);
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  const isOutOfStock = product.variants?.every((v) => v.stock_quantity === 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const availableVariant = product.variants?.find((v) => v.stock_quantity > 0);
    if (!availableVariant) {
      toast.error('Out of stock');
      return;
    }

    // If multiple variants, go to product page
    const activeVariants = product.variants?.filter((v) => v.stock_quantity > 0) ?? [];
    if (activeVariants.length > 1) {
      window.location.href = `/shop/products/${product.slug}`;
      return;
    }

    addItem(product, availableVariant);
    toast.success('Added to cart');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link href={`/shop/products/${product.slug}`} className="group block">
      <div
        className="relative overflow-hidden bg-blush aspect-[3/4]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Primary Image */}
        {primaryImage && (
          <Image
            src={getImageUrl(primaryImage.url)}
            alt={primaryImage.alt_text || product.name}
            fill
            className={cn(
              'object-cover transition-all duration-700',
              isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Secondary Image (hover) */}
        {secondaryImage && (
          <Image
            src={getImageUrl(secondaryImage.url)}
            alt={secondaryImage.alt_text || product.name}
            fill
            className={cn(
              'object-cover transition-all duration-700',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Placeholder if no images */}
        {!primaryImage && (
          <div className="absolute inset-0 bg-sand flex items-center justify-center">
            <span className="text-stone text-xs tracking-widest uppercase font-body">
              No Image
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOnSale && <span className="badge-sale">Sale</span>}
          {product.featured && !isOnSale && (
            <span className="badge-new">New</span>
          )}
          {isOutOfStock && <span className="badge-out">Sold Out</span>}
        </div>

        {/* Actions overlay */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 p-4 flex gap-2 transition-all duration-300',
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] tracking-widest uppercase font-body font-medium transition-all duration-200',
              isOutOfStock
                ? 'bg-stone text-ivory cursor-not-allowed'
                : 'bg-ink text-ivory hover:bg-espresso'
            )}
          >
            <ShoppingBag size={12} />
            {isOutOfStock ? 'Sold Out' : 'Quick Add'}
          </button>

          <button
            onClick={handleWishlist}
            className={cn(
              'flex items-center justify-center w-10 h-10 transition-all duration-200',
              wishlisted
                ? 'bg-gold text-ivory'
                : 'bg-ivory text-ink hover:bg-sand'
            )}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        {product.category && (
          <p className="text-[10px] tracking-widest uppercase text-stone font-body">
            {product.category.name}
          </p>
        )}
        <h3 className="text-sm font-body text-ink group-hover:text-gold transition-colors duration-200 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="price text-sm">{formatPrice(product.price)}</span>
          {isOnSale && product.compare_at_price && (
            <span className="price-compare text-xs">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
