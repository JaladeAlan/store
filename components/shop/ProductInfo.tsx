'use client';

import { useState } from 'react';
import { Heart, Ruler, Package } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { formatPrice, cn } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types';
import toast from 'react-hot-toast';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    () => {
      // Pre-select first in-stock variant
      return product.variants?.find((v) => v.stock_quantity > 0) || null;
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  // Group variants by size
  const sizeVariants =
    product.variants?.filter((v) => v.stock_quantity >= 0) || [];
  const uniqueColors = [
    ...new Set(sizeVariants.map((v) => v.color).filter(Boolean)),
  ];

  const isOnSale =
    product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = isOnSale
    ? Math.round(
        ((product.compare_at_price! - product.price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select a size');
      return;
    }
    if (selectedVariant.stock_quantity < quantity) {
      toast.error('Not enough stock');
      return;
    }

    setAddingToCart(true);
    await new Promise((r) => setTimeout(r, 300)); // brief delay for UX

    addItem(product, selectedVariant, quantity);
    toast.success(`${product.name} added to bag`);
    setAddingToCart(false);
  };

  return (
    <div className="py-4 lg:py-0 space-y-6">
      {/* Category */}
      {product.category && (
        <p className="section-subtitle">{product.category.name}</p>
      )}

      {/* Name */}
      <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="font-body text-xl font-medium text-ink">
          {formatPrice(product.price)}
        </span>
        {isOnSale && product.compare_at_price && (
          <>
            <span className="price-compare text-base">
              {formatPrice(product.compare_at_price)}
            </span>
            <span className="badge-sale">-{discountPercent}%</span>
          </>
        )}
      </div>

      <div className="divider" />

      {/* Color selector */}
      {uniqueColors.length > 0 && (
        <div>
          <h3 className="label">Colour</h3>
          <div className="flex gap-2">
            {uniqueColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  const variant = sizeVariants.find(
                    (v) => v.color === color && v.stock_quantity > 0
                  );
                  if (variant) setSelectedVariant(variant);
                }}
                className={cn(
                  'px-3 py-1.5 text-xs font-body border transition-all duration-200',
                  selectedVariant?.color === color
                    ? 'border-ink text-ink'
                    : 'border-sand text-stone hover:border-stone'
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="label mb-0">Size</h3>
          <button className="flex items-center gap-1 text-[10px] tracking-widest uppercase text-stone hover:text-gold transition-colors duration-200 font-body">
            <Ruler size={11} />
            Size Guide
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {sizeVariants.map((variant) => {
            const isOutOfStock = variant.stock_quantity === 0;
            const isSelected = selectedVariant?.id === variant.id;

            return (
              <button
                key={variant.id}
                onClick={() => !isOutOfStock && setSelectedVariant(variant)}
                disabled={isOutOfStock}
                className={cn(
                  'relative min-w-[44px] h-11 px-3 text-sm font-body font-medium border transition-all duration-200',
                  isSelected
                    ? 'border-ink bg-ink text-ivory'
                    : isOutOfStock
                    ? 'border-sand text-stone/40 cursor-not-allowed'
                    : 'border-sand text-stone hover:border-ink hover:text-ink'
                )}
              >
                {variant.size}
                {isOutOfStock && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-full h-px bg-stone/30 rotate-45 absolute" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedVariant && (
          <p className="text-xs text-stone font-body mt-2">
            {selectedVariant.stock_quantity <= 5 && selectedVariant.stock_quantity > 0 && (
              <span className="text-gold">
                Only {selectedVariant.stock_quantity} left in stock
              </span>
            )}
            {selectedVariant.stock_quantity > 5 && (
              <span className="flex items-center gap-1">
                <Package size={11} />
                In stock
              </span>
            )}
          </p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <h3 className="label">Quantity</h3>
        <div className="flex items-center border border-sand w-fit">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-stone hover:text-ink transition-colors duration-200 text-lg"
          >
            −
          </button>
          <span className="w-12 text-center text-sm font-body text-ink">
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity((q) =>
                Math.min(selectedVariant?.stock_quantity || 1, q + 1)
              )
            }
            className="w-10 h-10 flex items-center justify-center text-stone hover:text-ink transition-colors duration-200 text-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || !selectedVariant}
          className={cn(
            'btn-primary flex-1',
            addingToCart && 'opacity-70 cursor-wait'
          )}
        >
          {addingToCart ? 'Adding...' : 'Add to Bag'}
        </button>

        <button
          onClick={() => {
            toggleItem(product.id);
            toast.success(
              wishlisted ? 'Removed from wishlist' : 'Added to wishlist'
            );
          }}
          className={cn(
            'w-12 h-12 flex items-center justify-center border transition-all duration-200',
            wishlisted
              ? 'border-gold bg-gold text-ivory'
              : 'border-sand text-stone hover:border-ink hover:text-ink'
          )}
          aria-label="Wishlist"
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Description */}
      {product.description && (
        <>
          <div className="divider" />
          <div>
            <h3 className="label">Description</h3>
            <p className="text-sm font-body text-stone leading-relaxed">
              {product.description}
            </p>
          </div>
        </>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] tracking-widest uppercase font-body text-stone border border-sand px-2 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
