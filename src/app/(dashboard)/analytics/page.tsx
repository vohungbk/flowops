import type { Metadata } from "next"
import { Suspense } from "react"
import {
  getRevenueChartData,
  getPipelineChartData,
  getLeadSourceBreakdown,
  getConversionFunnel,
  getRepLeaderboard,
  getKpiMetrics,
} from "@/lib/queries/analytics"

export const metadata: Metadata = {
  title: "Analytics",
  description: "Revenue trends, pipeline breakdown, lead sources, and conversion funnel insights.",
}
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { PipelineChart } from "@/components/dashboard/pipeline-chart"
import { LeadSourceChart } from "@/components/analytics/lead-source-chart"
import { ConversionFunnelChart } from "@/components/analytics/conversion-funnel-chart"
import { RepLeaderboard } from "@/components/analytics/rep-leaderboard"
import { PeriodSelector } from "@/components/analytics/period-selector"
import type { Period } from "@/components/analytics/period-selector"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Target, DollarSign, BarChart3 } from "lucide-react"

// ─── Summary stat card ────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toLocaleString()}`
}

// ─── Period → months mapping ──────────────────────────────────────────────────

function periodToMonths(period: Period): number {
  switch (period) {
    case "3m": return 3
    case "6m": return 6
    case "all": return 120 // ~10 years = effectively all time
    default: return 12
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface AnalyticsPageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { period: rawPeriod } = await searchParams
  const period: Period =
    rawPeriod === "3m" || rawPeriod === "6m" || rawPeriod === "all"
      ? rawPeriod
      : "12m"

  const months = periodToMonths(period)

  const [kpis, revenueData, pipelineData, leadSources, funnel, leaderboard] =
    await Promise.all([
      getKpiMetrics(),
      getRevenueChartData(months),
      getPipelineChartData(),
      getLeadSourceBreakdown(),
      getConversionFunnel(),
      getRepLeaderboard(),
    ])

  const conversionRate =
    kpis.totalLeads > 0
      ? Math.round(
          (funnel.find((f) => f.status === "converted")?.count ?? 0) /
            (kpis.totalLeads + (funnel.find((f) => f.status === "converted")?.count ?? 0)) *
            100
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Reports and performance insights.</p>
        </div>
        <Suspense fallback={null}>
          <PeriodSelector current={period} />
        </Suspense>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(revenueData.reduce((s, d) => s + d.revenue, 0))}
          sub={`Last ${months >= 120 ? "all time" : `${months} months`}`}
          icon={DollarSign}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Win Rate"
          value={`${kpis.winRate}%`}
          sub="Won vs total closed"
          icon={TrendingUp}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Avg Deal Size"
          value={formatCurrency(kpis.avgDealSize)}
          sub="Across open deals"
          icon={BarChart3}
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          iconColor="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          sub="Leads converted to customers"
          icon={Target}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Revenue chart — full width */}
      <RevenueChart data={revenueData} />

      {/* Pipeline + Lead Sources */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PipelineChart data={pipelineData} />
        <LeadSourceChart data={leadSources} />
      </div>

      {/* Funnel + Leaderboard */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ConversionFunnelChart data={funnel} />
        <RepLeaderboard data={leaderboard} />
      </div>
    </div>
  )
}
