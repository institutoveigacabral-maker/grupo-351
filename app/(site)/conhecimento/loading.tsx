import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <Skeleton className="h-8 w-52 mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-black/[0.04] p-6 space-y-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
