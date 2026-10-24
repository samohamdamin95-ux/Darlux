import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container py-8 md:py-12" aria-busy="true">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-5 h-10 w-64" />
      <Skeleton className="mt-4 h-4 w-96 max-w-full" />
      <div className="mt-10 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
