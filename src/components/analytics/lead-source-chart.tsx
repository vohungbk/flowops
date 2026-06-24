"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { LeadSourceDataPoint } from "@/lib/queries/analytics"

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#94a3b8"]

interface TooltipEntry {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: LeadSourceDataPoint }>
}

function CustomTooltip({ active, payload }: TooltipEntry) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{item.name}</p>
      <p className="mt-0.5 text-muted-foreground">
        {item.value} {item.value === 1 ? "lead" : "leads"}
      </p>
    </div>
  )
}

interface LeadSourceChartProps {
  data: LeadSourceDataPoint[]
}

export function LeadSourceChart({ data }: LeadSourceChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0)
  const hasData = total > 0

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription className="mt-0.5">Where your leads come from</CardDescription>
          </div>
          {hasData && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">Total leads</p>
              <p className="text-sm font-semibold">{total}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Globe className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No leads yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Lead source breakdown will appear once you add leads.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {data.map((entry, i) => (
                  <Cell
                    key={entry.source}
                    fill={COLORS[i % COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
