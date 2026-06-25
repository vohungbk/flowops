"use client"

import { Pencil, Trash2, Calendar, User, Building2, TrendingUp, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DealFormDialog } from "@/components/pipeline/deal-form"
import { DeleteDealDialog } from "@/components/pipeline/delete-deal-dialog"
import type { PipelineStage, Customer } from "@/types"
import type { DealCardData } from "@/lib/queries/deals"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-medium">{children}</div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DealDetailSheetProps {
  deal: DealCardData
  stages: PipelineStage[]
  customers: Pick<Customer, "id" | "company_name">[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DealDetailSheet({
  deal,
  stages,
  customers,
  open,
  onOpenChange,
}: DealDetailSheetProps) {
  const stage = stages.find((s) => s.id === deal.stage_id)
  const stageColor = stage?.color ?? "#6b7280"

  const stageClass = stage?.is_closed_won
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : stage?.is_closed_lost
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col overflow-hidden p-0">
        {/* Header */}
        <SheetHeader className="border-b px-5 pb-4 pt-5">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: stageColor }}
            />
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                stageClass
              )}
            >
              {stage?.name ?? "Unknown stage"}
            </span>
            {deal.probability > 0 && !stage?.is_closed_won && !stage?.is_closed_lost && (
              <span className="text-xs text-muted-foreground">
                {deal.probability}% win probability
              </span>
            )}
          </div>
          <SheetTitle className="text-lg leading-tight">{deal.title}</SheetTitle>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(deal.value)}
          </p>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {deal.customer && (
            <DetailRow icon={Building2} label="Customer">
              {deal.customer.company_name}
            </DetailRow>
          )}

          {deal.assigned_profile && (
            <DetailRow icon={User} label="Assigned to">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[9px]">
                    {deal.assigned_profile.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {deal.assigned_profile.full_name}
              </div>
            </DetailRow>
          )}

          {deal.expected_close_date && (
            <DetailRow icon={Calendar} label="Expected close">
              {formatDate(deal.expected_close_date)}
            </DetailRow>
          )}

          {deal.actual_close_date && (
            <DetailRow icon={Calendar} label="Actual close">
              {formatDate(deal.actual_close_date)}
            </DetailRow>
          )}

          {stage && (
            <DetailRow icon={TrendingUp} label="Stage probability">
              {stage.probability}%
            </DetailRow>
          )}

          {deal.lost_reason && (
            <DetailRow icon={Tag} label="Lost reason">
              <span className="text-muted-foreground">{deal.lost_reason}</span>
            </DetailRow>
          )}

          {deal.notes && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {deal.notes}
              </p>
            </div>
          )}

          <div className="border-t pt-3 text-xs text-muted-foreground">
            Created{" "}
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(deal.created_at))}
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="border-t px-5 py-4 flex-row gap-2">
          <DealFormDialog
            mode="edit"
            deal={deal}
            stages={stages}
            customers={customers}
            trigger={
              <Button variant="outline" className="flex-1 gap-2">
                <Pencil className="h-4 w-4" />
                Edit Deal
              </Button>
            }
          />
          <DeleteDealDialog
            id={deal.id}
            title={deal.title}
            trigger={
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            }
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
