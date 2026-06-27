import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Shield } from "lucide-react"
import { getCurrentProfile } from "@/lib/actions/auth"
import { getAuditLogs, getProfilesForSelect } from "@/lib/queries/audit-log"
import { AuditLogFilters } from "@/components/audit-log/audit-log-filters"
import { AuditLogTable } from "@/components/audit-log/audit-log-table"
import { Skeleton } from "@/components/ui/skeleton"
import { ROUTES } from "@/lib/constants"

type SearchParams = {
  action?: string
  entity_type?: string
  user_id?: string
  period?: string
  page?: string
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "admin") redirect(ROUTES.dashboard)

  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  const [{ data, total, pageSize }, profiles] = await Promise.all([
    getAuditLogs({
      action: params.action,
      entityType: params.entity_type,
      userId: params.user_id,
      period: params.period,
      page,
    }),
    getProfilesForSelect(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <Shield className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} {total === 1 ? "event" : "events"} recorded
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-9 w-full max-w-2xl" />}>
        <AuditLogFilters profiles={profiles} />
      </Suspense>

      <AuditLogTable data={data} total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
