import { Suspense } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getLeads } from "@/lib/queries/leads"
import { LeadFilters } from "@/components/leads/lead-filters"
import { LeadTable } from "@/components/leads/lead-table"
import { LeadFormDialog } from "@/components/leads/lead-form"

type SearchParams = {
  search?: string
  status?: string
  source?: string
  page?: string
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  const { data, total, pageSize } = await getLeads({
    search: params.search,
    status: params.status,
    source: params.source,
    page,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "lead" : "leads"} total
          </p>
        </div>
        <LeadFormDialog
          mode="create"
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <Suspense fallback={<Skeleton className="h-8 w-80" />}>
        <LeadFilters />
      </Suspense>

      {/* Table */}
      <Suspense fallback={<TableSkeleton />}>
        <LeadTable data={data} total={total} page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <div className="p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-10 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
