'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { ProductCard } from '@/components/shop/ProductCard';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { items: wishlistIds, removeItem } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch each product by searching for its ID via the search API
        // We use the products API directly since there's no batch-by-ID endpoint
        const res = await fetch(`/api/wishlist/products?ids=${wishlistIds.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.data || []);
        }
      } catch {
        // If API not available, products just won't show details
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [wishlistIds]);

  const handleRemove = (productId: string, productName?: string) => {
    removeItem(productId);
    toast.success(productName ? `Removed "${productName}"` : 'Removed from wishlist');
  };

  return (
    <div className="page-enter">
      <div className="container-luxe py-10">
        <div className="mb-8">
          <p className="section-subtitle mb-2">Account</p>
          <h1 className="section-title">My Wishlist</h1>
        </div>

        {wishlistIds.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={40} className="text-stone mx-auto mb-4" strokeWidth={1} />
            <p className="font-display text-2xl text-ink mb-3">Your wishlist is empty</p>
            <p className="text-sm text-stone font-body mb-8">
              Save pieces you love to find them easily later.
            </p>
            <Link href="/shop/products" className="btn-primary">
              Browse Collection
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-stone font-body mb-6 uppercase tracking-widest">
              {wishlistIds.length} {wishlistIds.length === 1 ? 'item' : 'items'} saved
            </p>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlistIds.map((id) => (
                  <div key={id} className="animate-pulse">
                    <div className="aspect-[3/4] bg-sand shimmer" />
                    <div className="mt-3 space-y-2">
                      <div className="h-3 w-3/4 bg-sand shimmer" />
                      <div className="h-3 w-1/3 bg-sand shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard product={product} />
                    <button
                      onClick={() => handleRemove(product.id, product.name)}
                      className="absolute top-3 right-3 bg-ivory/90 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={13} className="text-stone hover:text-red-500 transition-colors duration-200" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              // Products couldn't be loaded — show IDs with remove option
              <div className="space-y-3">
                {wishlistIds.map((id) => (
                  <div key={id} className="flex items-center justify-between p-4 border border-sand">
                    <span className="text-sm font-body text-stone">Product ID: {id}</span>
                    <button
                      onClick={() => handleRemove(id)}
                      className="text-xs text-stone hover:text-red-500 font-body transition-colors duration-200 flex items-center gap-1.5"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-sand flex items-center justify-between">
              <Link href="/shop/products" className="btn-secondary text-xs">
                Continue Shopping
              </Link>
              <button
                onClick={() => {
                  wishlistIds.forEach((id) => removeItem(id));
                  toast.success('Wishlist cleared');
                }}
                className="text-xs text-stone hover:text-red-500 font-body transition-colors duration-200 flex items-center gap-1.5"
              >
                <Trash2 size={12} /> Clear wishlist
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}