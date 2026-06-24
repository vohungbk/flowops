"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts"
import { Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { FunnelDataPoint } from "@/lib/queries/analytics"

const STATUS_COLORS: Record<string, string> = {
  new: "#6366f1",
  contacted: "#3b82f6",
  qualified: "#10b981",
  converted: "#22c55e",
  disqualified: "#94a3b8",
}

interface TooltipEntry {
  active?: boolean
  payload?: Array<{ value: number; payload: FunnelDataPoint }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipEntry) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="mt-0.5 text-muted-foreground">
        {payload[0].value} {payload[0].value === 1 ? "lead" : "leads"}
      </p>
    </div>
  )
}

interface ConversionFunnelChartProps {
  data: FunnelDataPoint[]
}

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const hasData = data.some((d) => d.count > 0)
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Lead Funnel</CardTitle>
            <CardDescription className="mt-0.5">Leads by status stage</CardDescription>
          </div>
          {hasData && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-semibold">{total}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Filter className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No leads yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Add leads to see the conversion funnel.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
              barSize={18}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                strokeOpacity={0.08}
                horizontal={false}
              />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 12, fill: "currentColor", opacity: 0.7 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "currentColor", opacity: 0.04 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? "#6366f1"}
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
