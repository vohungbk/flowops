import { Skeleton } from "@/components/ui/skeleton"

export default function PipelineSettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-7 w-40" />
        <Skeleton className="mt-1 h-4 w-60" />
      </div>

      {/* Stage list — 6 stage cards */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border p-4">
            {/* Grip handle */}
            <Skeleton className="h-4 w-4 shrink-0" />
            {/* Color dot */}
            <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
            {/* Stage name + subtitle */}
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            {/* Win % */}
            <Skeleton className="h-4 w-10" />
            {/* Actions */}
            <div className="flex gap-1">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
