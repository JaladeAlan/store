'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton';
import type { Product } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.data || []);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 350);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="page-enter">
      <div className="container-luxe py-10">
        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for pieces, styles, categories…"
              autoFocus
              className="w-full border-b-2 border-sand focus:border-ink bg-transparent pl-10 pr-10 py-4 text-base font-body text-ink placeholder-stone focus:outline-none transition-colors duration-200"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors duration-200"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-xs text-stone font-body uppercase tracking-widest mb-6">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : searched && query.length >= 2 ? (
          <div className="text-center py-16">
            <p className="font-display text-2xl text-ink mb-3">No results found</p>
            <p className="text-sm text-stone font-body">
              Try different keywords or browse our{' '}
              <a href="/shop/products" className="text-gold hover:underline">full collection</a>.
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="font-display text-2xl text-ink mb-3">What are you looking for?</p>
            <p className="text-sm text-stone font-body">
              Start typing to search our collection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
