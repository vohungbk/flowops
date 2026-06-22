import { Suspense } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getCustomers } from "@/lib/queries/customers"
import { CustomerFilters } from "@/components/customers/customer-filters"
import { CustomerTable } from "@/components/customers/customer-table"
import { CustomerFormDialog } from "@/components/customers/customer-form"

type SearchParams = {
  search?: string
  status?: string
  page?: string
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  const { data, total, pageSize } = await getCustomers({
    search: params.search,
    status: params.status,
    page,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "customer" : "customers"} total
          </p>
        </div>
        <CustomerFormDialog
          mode="create"
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <Suspense fallback={<Skeleton className="h-8 w-80" />}>
        <CustomerFilters />
      </Suspense>

      {/* Table */}
      <Suspense fallback={<TableSkeleton />}>
        <CustomerTable
          data={data}
          total={total}
          page={page}
          pageSize={pageSize}
        />
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
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
