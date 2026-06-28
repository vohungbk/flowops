import { Skeleton } from "@/components/ui/skeleton"

export default function EmployeesLoading() {
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Employee card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-4 rounded-xl border p-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="w-full space-y-2 text-center">
              <Skeleton className="mx-auto h-4 w-32" />
              <Skeleton className="mx-auto h-3 w-24" />
              <Skeleton className="mx-auto h-5 w-16 rounded-full" />
            </div>
            <div className="grid w-full grid-cols-2 gap-2 border-t pt-4">
              <div className="space-y-1 text-center">
                <Skeleton className="mx-auto h-5 w-8" />
                <Skeleton className="mx-auto h-3 w-16" />
              </div>
              <div className="space-y-1 text-center">
                <Skeleton className="mx-auto h-5 w-12" />
                <Skeleton className="mx-auto h-3 w-14" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
