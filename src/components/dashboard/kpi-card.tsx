import type { ElementType } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
  UserPlus,
  Kanban,
  DollarSign,
  TrendingUp,
  BarChart3,
  Layers,
  Activity,
} from "lucide-react"
import type { KpiMetrics } from "@/types"

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toLocaleString()}`
}

function formatDelta(current: number, previous: number): { label: string; positive: boolean } | null {
  if (previous === 0) return null
  const pct = Math.round(((current - previous) / previous) * 100)
  return { label: `${pct >= 0 ? "+" : ""}${pct}% vs last month`, positive: pct >= 0 }
}

// ─── Single card ──────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string
  value: string
  sub?: string
  icon: ElementType
  iconColor: string
  iconBg: string
  delta?: { label: string; positive: boolean } | null
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  iconColor,
  iconBg,
  delta,
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconBg)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        {delta && (
          <p
            className={cn(
              "text-xs font-medium",
              delta.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
            )}
          >
            {delta.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Grid of all 8 KPI cards ──────────────────────────────────────────────────

export function KpiGrid({ kpis }: { kpis: KpiMetrics }) {
  const revenueDelta = formatDelta(kpis.monthlyRevenue, kpis.monthlyRevenueLastMonth)

  const cards: KpiCardProps[] = [
    {
      title: "Total Customers",
      value: kpis.totalCustomers.toLocaleString(),
      sub: kpis.newCustomersThisMonth > 0 ? `+${kpis.newCustomersThisMonth} this month` : "No new customers",
      icon: Users,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Active Leads",
      value: kpis.totalLeads.toLocaleString(),
      sub: "Excluding converted & disqualified",
      icon: UserPlus,
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Active Deals",
      value: kpis.activeDeals.toLocaleString(),
      sub: "Open in pipeline",
      icon: Kanban,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(kpis.monthlyRevenue),
      sub: "Closed this month",
      icon: DollarSign,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      delta: revenueDelta,
    },
    {
      title: "Win Rate",
      value: `${kpis.winRate}%`,
      sub: "Closed won vs total closed",
      icon: TrendingUp,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Avg Deal Size",
      value: formatCurrency(kpis.avgDealSize),
      sub: "Across open deals",
      icon: BarChart3,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Pipeline Value",
      value: formatCurrency(kpis.pipelineValue),
      sub: "Total open deal value",
      icon: Layers,
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Activities (7d)",
      value: kpis.activitiesThisWeek.toLocaleString(),
      sub: "Calls, emails, meetings",
      icon: Activity,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  )
}
