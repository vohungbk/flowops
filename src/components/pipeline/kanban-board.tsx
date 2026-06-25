"use client"

import { useState, useTransition } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { KanbanColumn } from "@/components/pipeline/kanban-column"
import { DealCardContent } from "@/components/pipeline/deal-card"
import { DealFormDialog } from "@/components/pipeline/deal-form"
import { moveDeal } from "@/lib/actions/deals"
import { usePipelineRealtime } from "@/hooks/use-pipeline-realtime"
import type { PipelineStage, Customer } from "@/types"
import type { DealCardData, StageWithDeals } from "@/lib/queries/deals"

interface KanbanBoardProps {
  stages: StageWithDeals[]
  customers: Pick<Customer, "id" | "company_name">[]
}

export function KanbanBoard({ stages: initialStages, customers }: KanbanBoardProps) {
  // Local state for optimistic drag updates
  const [stages, setStages] = useState<StageWithDeals[]>(initialStages)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Realtime subscription — updates stages when another user changes a deal
  const { markPending } = usePipelineRealtime(setStages)

  // Find a deal across all stages
  function findDeal(dealId: string): DealCardData | undefined {
    for (const stage of stages) {
      const deal = stage.deals.find((d) => d.id === dealId)
      if (deal) return deal
    }
  }

  // All stages as plain PipelineStage for passing to forms
  const allStages: PipelineStage[] = stages.map(({ deals: _, ...stage }) => stage)

  const totalPipelineValue = stages
    .filter((s) => !s.is_closed_won && !s.is_closed_lost)
    .flatMap((s) => s.deals)
    .reduce((sum, d) => sum + d.value, 0)

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragOver(event: DragEndEvent) {
    setOverId(event.over ? String(event.over.id) : null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const dealId = String(event.active.id)
    const newStageId = event.over ? String(event.over.id) : undefined

    setActiveId(null)
    setOverId(null)

    if (!newStageId) return

    const deal = findDeal(dealId)
    if (!deal || deal.stage_id === newStageId) return

    // Mark as pending so the realtime echo of our own mutation is suppressed
    markPending(dealId)

    // Optimistic update
    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id === deal.stage_id) {
          return { ...stage, deals: stage.deals.filter((d) => d.id !== dealId) }
        }
        if (stage.id === newStageId) {
          return { ...stage, deals: [...stage.deals, { ...deal, stage_id: newStageId }] }
        }
        return stage
      })
    )

    // Persist
    startTransition(async () => {
      await moveDeal(dealId, newStageId)
    })
  }

  const activeDeal = activeId ? findDeal(activeId) : null

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <span className={cn("h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse")} />
              Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {totalPipelineValue > 0 ? (
              <>
                Open pipeline:{" "}
                <span className="font-semibold text-foreground">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(totalPipelineValue)}
                </span>
              </>
            ) : (
              "No open deals"
            )}
          </p>
        </div>
        <DealFormDialog
          mode="create"
          stages={allStages}
          customers={customers}
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Deal
            </Button>
          }
        />
      </div>

      {/* Stage summary bar */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {stages.map((stage) => {
          const value = stage.deals.reduce((sum, d) => sum + d.value, 0)
          const dotColor = stage.color ?? "#6b7280"
          return (
            <div
              key={stage.id}
              className="flex shrink-0 items-center gap-2 rounded-lg border bg-card px-3 py-2"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: dotColor }}
              />
              <span className="text-xs font-medium">{stage.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {stage.deals.length > 0
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(value)
                  : "—"}
              </span>
            </div>
          )
        })}
      </div>

      {/* Kanban */}
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={stage.deals}
              stages={allStages}
              customers={customers}
              isOver={overId === stage.id}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCardContent deal={activeDeal} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
