export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-sand shimmer" />
      <div className="mt-3 space-y-2">
        <div className="h-2 w-14 bg-sand rounded shimmer" />
        <div className="h-3 w-3/4 bg-sand rounded shimmer" />
        <div className="h-3 w-1/3 bg-sand rounded shimmer" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}