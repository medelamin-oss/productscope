import { Card } from "@/components/ui";

export function SkeletonCard() {
  return (
    <Card className="p-5">
      <div className="h-5 w-3/4 bg-gray-200 rounded-md animate-pulse" />
      <div className="h-3 w-full bg-gray-200 rounded-md mt-2 animate-pulse" />
      <div className="flex items-center gap-3 mt-4">
        <div className="h-3 w-8 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-3 w-24 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </Card>
  );
}
