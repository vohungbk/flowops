"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { Kanban } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { PipelineStageSummary } from "@/types"

// ─── Custom tooltip ───────────────────────────────────────────────────────────

interface TooltipEntry {
  active?: boolean
  payload?: Array<{ payload: PipelineStageSummary }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipEntry) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="mt-0.5 text-muted-foreground">
        {data.dealCount} {data.dealCount === 1 ? "deal" : "deals"}
      </p>
      {data.totalValue > 0 && (
        <p className="text-xs text-muted-foreground">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(data.totalValue)}
        </p>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PipelineChartProps {
  data: PipelineStageSummary[]
}

const FALLBACK_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444",
]

export function PipelineChart({ data }: PipelineChartProps) {
  const hasDeals = data.some((d) => d.dealCount > 0)
  const totalDeals = data.reduce((s, d) => s + d.dealCount, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Pipeline by Stage</CardTitle>
            <CardDescription className="mt-0.5">Deal count per stage</CardDescription>
          </div>
          {hasDeals && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">Total deals</p>
              <p className="text-sm font-semibold">{totalDeals}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasDeals ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Kanban className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No deals yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Add deals to the pipeline to see the distribution here.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: -8 }}
              barSize={20}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                strokeOpacity={0.08}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={36}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "currentColor", opacity: 0.04 }} />
              <Bar dataKey="dealCount" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
