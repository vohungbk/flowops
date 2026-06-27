"use client"

import { useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { buttonVariants } from "@/components/ui/button"
import { DealFormDialog } from "@/components/pipeline/deal-form"
import { DeleteDealDialog } from "@/components/pipeline/delete-deal-dialog"
import { DealDetailSheet } from "@/components/pipeline/deal-detail-sheet"
import type { PipelineStage, Customer } from "@/types"
import type { DealCardData } from "@/lib/queries/deals"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr))
}

// ─── Static card content (also used in DragOverlay) ──────────────────────────

export function DealCardContent({
  deal,
  isDragging = false,
}: {
  deal: DealCardData
  isDragging?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 text-sm shadow-xs",
        isDragging && "shadow-lg rotate-1 opacity-90"
      )}
    >
      {/* Top row: company + value */}
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">
          {deal.customer?.company_name ?? "No customer"}
        </p>
        <span className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(deal.value)}
        </span>
      </div>

      {/* Deal title */}
      <p className="mt-1 line-clamp-2 font-medium leading-snug">{deal.title}</p>

      {/* Bottom row */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {deal.assigned_profile ? (
            <>
              <Avatar className="h-5 w-5 shrink-0">
                <AvatarFallback className="text-[9px]">
                  {deal.assigned_profile.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs text-muted-foreground">
                {deal.assigned_profile.full_name}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {deal.expected_close_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(deal.expected_close_date)}
            </div>
          )}
          {deal.probability > 0 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
              {deal.probability}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Draggable card wrapper ───────────────────────────────────────────────────

interface DealCardProps {
  deal: DealCardData
  stages: PipelineStage[]
  customers: Pick<Customer, "id" | "company_name">[]
}

export function DealCard({ deal, stages, customers }: DealCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: deal.id, data: { stageId: deal.stage_id } })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <>
      {/* Listeners on the outer div so the whole card surface is draggable.
          The PointerSensor (distance: 8) in DndContext lets short clicks
          fall through to onClick without starting a drag. */}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "group relative touch-none cursor-grab active:cursor-grabbing",
          isDragging && "opacity-30"
        )}
        onClick={() => setSheetOpen(true)}
      >
        <DealCardContent deal={deal} />

        {/* Actions menu — stops pointer events so the dropdown doesn't start a drag */}
        <div
          className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "h-6 w-6 bg-card shadow-xs"
              )}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              <span className="sr-only">Deal actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DealFormDialog
                mode="edit"
                deal={deal}
                stages={stages}
                customers={customers}
                trigger={
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuSeparator />
              <DeleteDealDialog
                id={deal.id}
                title={deal.title}
                trigger={
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    variant="destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Detail sheet — outside the draggable div so it's not affected by transform */}
      <DealDetailSheet
        deal={deal}
        stages={stages}
        customers={customers}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
