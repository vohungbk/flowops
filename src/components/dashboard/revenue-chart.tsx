"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { RevenueDataPoint } from "@/types"

// ─── Custom tooltip ───────────────────────────────────────────────────────────

interface TooltipEntry {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipEntry) {
  if (!active || !payload?.length) return null
  const value = payload[0].value ?? 0
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="mt-0.5 text-emerald-600 dark:text-emerald-400">
        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)}
      </p>
    </div>
  )
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RevenueChartProps {
  data: RevenueDataPoint[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasRevenue = data.some((d) => d.revenue > 0)
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Revenue (12 months)</CardTitle>
            <CardDescription className="mt-0.5">Closed-won deal value per month</CardDescription>
          </div>
          {hasRevenue && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">12-month total</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(totalRevenue)}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasRevenue ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No revenue data yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Revenue will appear here once you close deals in the pipeline.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                strokeOpacity={0.08}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "currentColor", strokeOpacity: 0.1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
