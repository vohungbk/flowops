"use client"

import { useActionState, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { createDeal, updateDeal } from "@/lib/actions/deals"
import type { ActionResult, PipelineStage, Customer } from "@/types"
import type { DealCardData } from "@/lib/queries/deals"

// ─── Inner form (keyed for state reset on reopen) ────────────────────────────

interface FormContentProps {
  mode: "create" | "edit"
  deal?: DealCardData
  stages: PipelineStage[]
  customers: Pick<Customer, "id" | "company_name">[]
  defaultStageId?: string
  onSuccess: () => void
}

function FormContent({
  mode,
  deal,
  stages,
  customers,
  defaultStageId,
  onSuccess,
}: FormContentProps) {
  const router = useRouter()
  const action = mode === "create" ? createDeal : updateDeal.bind(null, deal!.id)

  const initial: ActionResult = { success: false, error: "" }
  const [state, formAction, isPending] = useActionState(action, initial)

  const [stageId, setStageId] = useState<string>(
    deal?.stage_id ?? defaultStageId ?? stages[0]?.id ?? ""
  )
  const [customerId, setCustomerId] = useState<string>(deal?.customer_id ?? "")

  useEffect(() => {
    if (state.success) {
      onSuccess()
      router.refresh()
    }
  }, [state.success, onSuccess, router])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="stage_id" value={stageId} />
      <input type="hidden" name="customer_id" value={customerId} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Deal title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Enterprise subscription"
          defaultValue={deal?.title ?? ""}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Value */}
        <div className="space-y-1.5">
          <Label htmlFor="value">Value ($)</Label>
          <Input
            id="value"
            name="value"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            defaultValue={deal?.value ?? 0}
          />
        </div>

        {/* Probability */}
        <div className="space-y-1.5">
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            name="probability"
            type="number"
            min="0"
            max="100"
            placeholder="0"
            defaultValue={deal?.probability ?? 0}
          />
        </div>
      </div>

      {/* Stage */}
      <div className="space-y-1.5">
        <Label>Stage</Label>
        <Select value={stageId} onValueChange={(v) => setStageId(v ?? stages[0]?.id ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Customer */}
      <div className="space-y-1.5">
        <Label>Customer (optional)</Label>
        <Select value={customerId || null} onValueChange={(v) => setCustomerId(v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="No customer linked" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expected close date */}
      <div className="space-y-1.5">
        <Label htmlFor="expected_close_date">Expected close date</Label>
        <Input
          id="expected_close_date"
          name="expected_close_date"
          type="date"
          defaultValue={deal?.expected_close_date ?? ""}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Additional notes…"
          defaultValue={deal?.notes ?? ""}
          className="min-h-16 resize-none"
        />
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? (
            "Saving…"
          ) : mode === "create" ? (
            <>
              <Plus className="h-4 w-4" />
              Add Deal
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── Public dialog component ──────────────────────────────────────────────────

interface DealFormDialogProps {
  mode: "create" | "edit"
  deal?: DealCardData
  stages: PipelineStage[]
  customers: Pick<Customer, "id" | "company_name">[]
  defaultStageId?: string
  trigger: React.ReactNode
}

export function DealFormDialog({
  mode,
  deal,
  stages,
  customers,
  defaultStageId,
  trigger,
}: DealFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  function handleOpen() {
    setFormKey((k) => k + 1)
    setOpen(true)
  }

  return (
    <>
      <span style={{ display: "contents" }} onClick={handleOpen}>
        {trigger}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add Deal" : "Edit Deal"}
            </DialogTitle>
          </DialogHeader>
          <FormContent
            key={formKey}
            mode={mode}
            deal={deal}
            stages={stages}
            customers={customers}
            defaultStageId={defaultStageId}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
