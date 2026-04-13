'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { Category, ProductFilters } from '@/types';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name A–Z' },
];

interface ProductFiltersPanelProps {
  categories: Category[];
  activeFilters: ProductFilters;
}

export function ProductFiltersPanel({
  categories,
  activeFilters,
}: ProductFiltersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete('page'); // Reset to page 1 on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const toggleSize = (size: string) => {
    const currentSizes = activeFilters.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];

    updateFilter('sizes', newSizes.length > 0 ? newSizes.join(',') : null);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  const hasActiveFilters =
    activeFilters.category ||
    activeFilters.minPrice ||
    activeFilters.maxPrice ||
    (activeFilters.sizes && activeFilters.sizes.length > 0);

  return (
    <div className="space-y-7">
      {/* Sort */}
      <div>
        <h3 className="label">Sort By</h3>
        <select
          value={activeFilters.sort || 'newest'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="input-field text-xs"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="divider" />

      {/* Categories */}
      {categories.length > 0 && (
        <>
          <div>
            <h3 className="label">Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => updateFilter('category', null)}
                className={`block w-full text-left text-xs font-body py-1 transition-colors duration-200 ${
                  !activeFilters.category
                    ? 'text-ink font-medium'
                    : 'text-stone hover:text-ink'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`block w-full text-left text-xs font-body py-1 transition-colors duration-200 ${
                    activeFilters.category === cat.slug
                      ? 'text-ink font-medium'
                      : 'text-stone hover:text-ink'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div className="divider" />
        </>
      )}

      {/* Sizes */}
      <div>
        <h3 className="label">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const isActive = activeFilters.sizes?.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`w-10 h-10 text-xs font-body font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-ink text-ivory'
                    : 'border border-sand text-stone hover:border-ink hover:text-ink'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="divider" />

      {/* Price Range */}
      <div>
        <h3 className="label">Price</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-stone font-body uppercase tracking-widest mb-1 block">
                Min
              </label>
              <input
                type="number"
                placeholder="0"
                value={activeFilters.minPrice || ''}
                onChange={(e) =>
                  updateFilter('minPrice', e.target.value || null)
                }
                className="input-field text-xs"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-stone font-body uppercase tracking-widest mb-1 block">
                Max
              </label>
              <input
                type="number"
                placeholder="Any"
                value={activeFilters.maxPrice || ''}
                onChange={(e) =>
                  updateFilter('maxPrice', e.target.value || null)
                }
                className="input-field text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <>
          <div className="divider" />
          <button
            onClick={clearAll}
            className="text-xs tracking-widest uppercase font-body text-stone hover:text-ink transition-colors duration-200 underline underline-offset-4"
          >
            Clear All Filters
          </button>
        </>
      )}
    </div>
  );
}
