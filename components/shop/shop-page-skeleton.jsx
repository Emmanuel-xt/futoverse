import { Skeleton } from "@components/ui/skeleton";

export default function ShopPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 pb-14">
      {/* Header Skeleton */}
      <div className="relative h-[25vh] bg-gray-300 rounded-b-3xl">
        <div className="absolute top-4 left-4">
          <Skeleton className="w-6 h-6 rounded" />
        </div>
        <div className="absolute top-4 right-4">
          <Skeleton className="w-6 h-6 rounded" />
        </div>
        <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
          <Skeleton className="w-24 h-24 rounded-full" />
        </div>
      </div>

      {/* Shop Info Skeleton */}
      <div className="flex flex-col items-center justify-center mt-5 px-3 space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Tabs Skeleton */}
      <div className="mt-4 px-4">
        <div className="flex w-full justify-around mb-2 border-b">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4">
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
