import { SkeletonCard } from "@/components/skeleton-card";

export default function DashboardLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded-md mt-2 animate-pulse" />
        </div>
        <div className="h-11 w-40 bg-gray-200 rounded-md animate-pulse" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
