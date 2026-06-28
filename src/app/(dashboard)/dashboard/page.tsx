import type { Metadata } from "next"
import {
  getKpiMetrics,
  getRevenueChartData,
  getPipelineChartData,
  getRecentActivities,
  getTopDeals,
} from "@/lib/queries/analytics"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your revenue, pipeline health, and recent activity.",
}
import { KpiGrid } from "@/components/dashboard/kpi-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { PipelineChart } from "@/components/dashboard/pipeline-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { TopDeals } from "@/components/dashboard/top-deals"

export default async function DashboardPage() {
  // All 5 queries run in parallel — no waterfall
  const [kpis, revenueData, pipelineData, activities, topDeals] = await Promise.all([
    getKpiMetrics(),
    getRevenueChartData(12),
    getPipelineChartData(),
    getRecentActivities(8),
    getTopDeals(5),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Here's your business overview.</p>
      </div>

      {/* Row 1 + 2: 8 KPI cards */}
      <KpiGrid kpis={kpis} />

      {/* Row 3: Revenue chart (2/3) + Pipeline chart (1/3) */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        <PipelineChart data={pipelineData} />
      </div>

      {/* Row 4: Activity feed + Top deals */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityFeed activities={activities} />
        <TopDeals deals={topDeals} />
      </div>
    </div>
  )
}
