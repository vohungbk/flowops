"use client"

import { useActionState, useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Check,
  X,
  AlertCircle,
  GripVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { updatePipelineStage, swapStageOrder } from "@/lib/actions/pipeline"
import type { ActionResult, PipelineStage } from "@/types"

// ─── Inline edit form for a single stage ─────────────────────────────────────

interface StageEditFormProps {
  stage: PipelineStage
  onCancel: () => void
}

function StageEditForm({ stage, onCancel }: StageEditFormProps) {
  const router = useRouter()
  const action = updatePipelineStage.bind(null, stage.id)
  const initial: ActionResult = { success: false, error: "" }
  const [state, formAction, isPending] = useActionState(action, initial)

  useEffect(() => {
    if (state.success) {
      onCancel()
      router.refresh()
    }
  }, [state.success, onCancel, router])

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-end">
        <div className="space-y-1">
          <Label htmlFor={`stage-name-${stage.id}`} className="text-xs">Name</Label>
          <Input
            id={`stage-name-${stage.id}`}
            name="name"
            defaultValue={stage.name}
            className="h-8 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`stage-color-${stage.id}`} className="text-xs">Color</Label>
          <input
            id={`stage-color-${stage.id}`}
            name="color"
            type="color"
            defaultValue={stage.color ?? "#6b7280"}
            className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`stage-prob-${stage.id}`} className="text-xs">Win %</Label>
          <Input
            id={`stage-prob-${stage.id}`}
            name="probability"
            type="number"
            min="0"
            max="100"
            defaultValue={stage.probability ?? 0}
            className="h-8 w-16 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
          className="gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
          <Check className="h-3.5 w-3.5" />
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  )
}

// ─── Single stage row ─────────────────────────────────────────────────────────

interface StageRowProps {
  stage: PipelineStage
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  isMoving: boolean
}

function StageRow({
  stage,
  index,
  total,
  onMoveUp,
  onMoveDown,
  isMoving,
}: StageRowProps) {
  const [editing, setEditing] = useState(false)
  const dotColor = stage.color ?? "#6b7280"

  const labelClass = stage.is_closed_won
    ? "text-emerald-600 dark:text-emerald-400"
    : stage.is_closed_lost
      ? "text-red-600 dark:text-red-400"
      : ""

  return (
    <Card className={cn("transition-opacity", isMoving && "opacity-50")}>
      <CardContent className="p-4">
        {editing ? (
          <StageEditForm stage={stage} onCancel={() => setEditing(false)} />
        ) : (
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />

            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: dotColor }}
            />

            <div className="min-w-0 flex-1">
              <p className={cn("font-medium", labelClass)}>{stage.name}</p>
              <p className="text-xs text-muted-foreground">
                {stage.probability ?? 0}% win probability
                {stage.is_closed_won && " · Closed Won"}
                {stage.is_closed_lost && " · Closed Lost"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onMoveUp}
                disabled={index === 0 || isMoving}
                className="h-7 w-7"
              >
                <ChevronUp className="h-4 w-4" />
                <span className="sr-only">Move up</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onMoveDown}
                disabled={index === total - 1 || isMoving}
                className="h-7 w-7"
              >
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Move down</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(true)}
                className="h-7 w-7"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Edit stage</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PipelineStageConfigProps {
  stages: PipelineStage[]
}

export function PipelineStageConfig({ stages: initialStages }: PipelineStageConfigProps) {
  const router = useRouter()
  const [stages, setStages] = useState<PipelineStage[]>(initialStages)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleMove(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= stages.length) return

    const stageA = stages[index]
    const stageB = stages[targetIndex]

    // Optimistic update
    const next = [...stages]
    next[index] = stageB
    next[targetIndex] = stageA
    setStages(next)
    setMovingId(stageA.id)

    startTransition(async () => {
      await swapStageOrder(
        stageA.id,
        stageA.order_index,
        stageB.id,
        stageB.order_index
      )
      setMovingId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {stages.length} stages · Click the pencil icon to edit name, color, and win probability.
      </p>
      <div className="space-y-2">
        {stages.map((stage, index) => (
          <StageRow
            key={stage.id}
            stage={stage}
            index={index}
            total={stages.length}
            onMoveUp={() => handleMove(index, "up")}
            onMoveDown={() => handleMove(index, "down")}
            isMoving={movingId === stage.id}
          />
        ))}
      </div>
    </div>
  )
}
