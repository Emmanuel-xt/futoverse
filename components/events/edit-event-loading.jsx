import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

export default function EditEventLoading() {
  return (
    <div>
      <div className="text-center mb-8">
        <Skeleton className="h-10 w-64 mx-auto mb-2" />
        <Skeleton className="h-6 w-80 mx-auto" />
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Edit Event Details</CardTitle>
          <CardDescription className="text-blue-100">
            Update your event information
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>

              <div className="md:col-span-2">
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-32 w-full" />
              </div>

              <div>
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>

              <div>
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div>
                <Skeleton className="h-6 w-28 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Capacity and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
