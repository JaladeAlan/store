'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import type { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  const activeImage = sortedImages[activeIndex];

  const prev = () =>
    setActiveIndex((i) => (i - 1 + sortedImages.length) % sortedImages.length);
  const next = () =>
    setActiveIndex((i) => (i + 1) % sortedImages.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[3/4] bg-blush flex items-center justify-center">
        <span className="text-stone text-xs tracking-widest uppercase font-body">
          No Images
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnails (desktop) */}
      {sortedImages.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 w-16">
          {sortedImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative aspect-square overflow-hidden bg-blush transition-all duration-200',
                activeIndex === i
                  ? 'ring-1 ring-ink'
                  : 'opacity-50 hover:opacity-100'
              )}
            >
              <Image
                src={getImageUrl(img.url)}
                alt={img.alt_text || `${name} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1">
        <div
          className="relative aspect-[3/4] bg-blush overflow-hidden cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {activeImage && (
            <Image
              src={getImageUrl(activeImage.url)}
              alt={activeImage.alt_text || name}
              fill
              className={cn(
                'object-cover transition-transform duration-300',
                isZoomed ? 'scale-150' : 'scale-100'
              )}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : undefined
              }
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          )}

          {/* Zoom hint */}
          {!isZoomed && (
            <div className="absolute bottom-4 right-4 bg-ivory/80 p-2 flex items-center gap-1.5">
              <ZoomIn size={12} className="text-stone" />
              <span className="text-[10px] font-body text-stone uppercase tracking-widest">
                Hover to zoom
              </span>
            </div>
          )}

          {/* Navigation arrows */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-ivory/80 p-2 hover:bg-ivory transition-colors duration-200"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-ivory/80 p-2 hover:bg-ivory transition-colors duration-200"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Mobile thumbnails dots */}
        {sortedImages.length > 1 && (
          <div className="md:hidden flex justify-center gap-1.5 mt-3">
            {sortedImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-200',
                  activeIndex === i ? 'bg-ink' : 'bg-sand'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
