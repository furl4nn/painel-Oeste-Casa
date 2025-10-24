export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="relative">
        <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="bg-gray-300 h-8 w-20 rounded-full animate-pulse"></div>
          <div className="bg-gray-300 h-8 w-24 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/2"></div>

        <div className="flex items-center gap-4 mb-4">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="border-t pt-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    </div>
  );
}
