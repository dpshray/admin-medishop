import { Skeleton } from "../ui/skeleton";

export default function DashboardCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card/40 backdrop-blur-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
