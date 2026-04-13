'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice, getImageUrl, getShippingCost, cn } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } =
    useCartStore();

  const sub = subtotal();
  const shipping = getShippingCost(sub);
  const total = sub + shipping;

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-50 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-ivory z-50 flex flex-col transition-transform duration-400 ease-luxury',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand">
          <div className="flex items-center gap-3">
            <ShoppingBag size={16} className="text-ink" />
            <h2 className="text-xs tracking-widest uppercase font-body font-medium">
              Your Bag
            </h2>
            {totalItems() > 0 && (
              <span className="text-xs text-stone font-body">
                ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="text-stone hover:text-ink transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <ShoppingBag size={32} className="text-stone mb-4" strokeWidth={1} />
              <p className="font-display text-xl text-ink mb-2">Your bag is empty</p>
              <p className="text-sm text-stone font-body mb-8">
                Discover our curated collections
              </p>
              <button onClick={closeCart} className="btn-primary text-xs">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="px-6 space-y-5">
              {items.map(({ product, variant, quantity }) => {
                const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
                return (
                  <div
                    key={`${product.id}-${variant.id}`}
                    className="flex gap-4"
                  >
                    {/* Image */}
                    <Link
                      href={`/shop/products/${product.slug}`}
                      onClick={closeCart}
                      className="relative w-20 h-24 flex-shrink-0 bg-blush overflow-hidden"
                    >
                      {primaryImage && (
                        <Image
                          src={getImageUrl(primaryImage.url)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/shop/products/${product.slug}`}
                            onClick={closeCart}
                            className="text-sm font-body text-ink hover:text-gold transition-colors duration-200 leading-snug line-clamp-2"
                          >
                            {product.name}
                          </Link>
                          <p className="text-[11px] text-stone font-body mt-0.5 uppercase tracking-wide">
                            Size: {variant.size}
                            {variant.color && ` · ${variant.color}`}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(product.id, variant.id)}
                          className="text-stone hover:text-ink transition-colors duration-200 flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity */}
                        <div className="flex items-center border border-sand">
                          <button
                            onClick={() =>
                              updateQuantity(product.id, variant.id, quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-stone hover:text-ink transition-colors duration-200"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-8 text-center text-xs font-body text-ink">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(product.id, variant.id, quantity + 1)
                            }
                            disabled={quantity >= variant.stock_quantity}
                            className="w-7 h-7 flex items-center justify-center text-stone hover:text-ink transition-colors duration-200 disabled:opacity-40"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-sm font-body font-medium text-ink">
                          {formatPrice(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-sand px-6 py-6 space-y-4">
            {/* Subtotal */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-body">
                <span className="text-stone">Subtotal</span>
                <span className="text-ink">{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-stone">Shipping</span>
                <span className="text-ink">
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[11px] text-stone font-body">
                  Free shipping on orders over ₦50,000
                </p>
              )}
              <div className="flex justify-between text-sm font-body font-medium border-t border-sand pt-2 mt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-xs"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-xs text-stone hover:text-ink font-body tracking-widest uppercase transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
