import { Skeleton } from "@/components/ui/skeleton"

// Realistic card counts per stage (mirrors a typical fresh pipeline)
const COLUMN_CARD_COUNTS = [3, 2, 2, 1, 1, 1]

export default function PipelineLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Stage summary bar */}
      <div className="flex gap-3 overflow-hidden pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-36 shrink-0 rounded-lg" />
        ))}
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-hidden pb-4">
        {COLUMN_CARD_COUNTS.map((cardCount, col) => (
          <div key={col} className="flex w-72 shrink-0 flex-col">
            {/* Column header */}
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>
            {/* Drop zone */}
            <div className="flex min-h-32 flex-col gap-2 rounded-xl border-2 border-dashed border-transparent bg-muted/30 p-2">
              {Array.from({ length: cardCount }).map((_, card) => (
                <Skeleton key={card} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
