export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-sand shimmer" />
      <div className="mt-3 space-y-2">
        <div className="h-2.5 w-16 bg-sand rounded" />
        <div className="h-3 w-3/4 bg-sand rounded" />
        <div className="h-3 w-1/3 bg-sand rounded" />
      </div>
    </div>
  );
}
