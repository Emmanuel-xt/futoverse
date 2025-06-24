export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>

            {/* Stats */}
            <div className="flex gap-8 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-6 bg-gray-200 rounded w-8 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full max-w-sm">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 w-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1 h-12 bg-gray-200 m-1 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
