import { Kanban, ChevronRight, Calendar } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { TopDealRow } from "@/lib/queries/analytics"

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(dateStr))
}

interface TopDealsProps {
  deals: TopDealRow[]
}

export function TopDeals({ deals }: TopDealsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Open Deals</CardTitle>
            <CardDescription>Highest value deals in pipeline</CardDescription>
          </div>
          <Link
            href="/pipeline"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Kanban className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No open deals</p>
            <p className="text-xs text-muted-foreground">
              Add deals to the pipeline to see them here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href="/pipeline"
                className="group flex items-center gap-3 py-3 transition-colors hover:text-foreground"
              >
                {/* Stage color dot */}
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: deal.stage_color ?? "#6b7280" }}
                />

                {/* Deal info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium">{deal.title}</p>
                    <span className="shrink-0 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {deal.company_name && (
                      <span className="truncate">{deal.company_name}</span>
                    )}
                    <span
                      className="shrink-0 rounded-full px-1.5 py-0.5"
                      style={{
                        backgroundColor: (deal.stage_color ?? "#6b7280") + "22",
                        color: deal.stage_color ?? "#6b7280",
                      }}
                    >
                      {deal.stage_name}
                    </span>
                    {deal.expected_close_date && (
                      <span className="flex shrink-0 items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(deal.expected_close_date)}
                      </span>
                    )}
                  </div>

                  {/* Probability bar */}
                  {deal.probability > 0 && (
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500/60"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                  )}
                </div>

                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
