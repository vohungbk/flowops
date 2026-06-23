"use client"

import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { DealCard } from "@/components/pipeline/deal-card"
import { DealFormDialog } from "@/components/pipeline/deal-form"
import { Button } from "@/components/ui/button"
import type { PipelineStage, Customer } from "@/types"
import type { DealCardData, StageWithDeals } from "@/lib/queries/deals"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

interface KanbanColumnProps {
  stage: StageWithDeals
  deals: DealCardData[]
  stages: PipelineStage[]
  customers: Pick<Customer, "id" | "company_name">[]
  isOver: boolean
}

export function KanbanColumn({
  stage,
  deals,
  stages,
  customers,
  isOver,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage.id })

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)
  const dotColor = stage.color ?? "#6b7280"

  const headerColor = stage.is_closed_won
    ? "text-emerald-600 dark:text-emerald-400"
    : stage.is_closed_lost
      ? "text-red-600 dark:text-red-400"
      : ""

  return (
    <div className="flex w-72 shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <span className={cn("truncate text-sm font-semibold", headerColor)}>
            {stage.name}
          </span>
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
            {deals.length}
          </span>
        </div>
        {deals.length > 0 && (
          <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
            {formatCurrency(totalValue)}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 rounded-xl border-2 border-dashed p-2 transition-colors min-h-32",
          isOver
            ? "border-primary/40 bg-primary/5"
            : "border-transparent bg-muted/30"
        )}
      >
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            stages={stages}
            customers={customers}
          />
        ))}

        {/* Add deal button */}
        <DealFormDialog
          mode="create"
          stages={stages}
          customers={customers}
          defaultStageId={stage.id}
          trigger={
            <button className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
              <Plus className="h-3.5 w-3.5" />
              Add deal
            </button>
          }
        />
      </div>
    </div>
  )
}
