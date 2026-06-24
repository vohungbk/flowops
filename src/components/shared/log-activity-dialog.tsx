"use client"

import { useActionState, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, AlertCircle } from "lucide-react"
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
import { createActivity } from "@/lib/actions/activities"
import { ACTIVITY_TYPES } from "@/lib/constants"
import type { ActionResult } from "@/types"

interface FormContentProps {
  customerId?: string
  leadId?: string
  onSuccess: () => void
}

function FormContent({ customerId, leadId, onSuccess }: FormContentProps) {
  const router = useRouter()
  const initial: ActionResult = { success: false, error: "" }
  const [state, formAction, isPending] = useActionState(createActivity, initial)
  const [type, setType] = useState("call")

  useEffect(() => {
    if (state.success) {
      onSuccess()
      router.refresh()
    }
  }, [state.success, onSuccess, router])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="type" value={type} />
      {customerId && <input type="hidden" name="customer_id" value={customerId} />}
      {leadId && <input type="hidden" name="lead_id" value={leadId} />}

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Activity type</Label>
        <Select value={type} onValueChange={(v) => setType(v ?? "call")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="activity-subject">Subject *</Label>
        <Input
          id="activity-subject"
          name="subject"
          placeholder="e.g. Discovery call with John"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="activity-description">Description</Label>
        <Textarea
          id="activity-description"
          name="description"
          placeholder="What happened?"
          className="min-h-20 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="activity-outcome">Outcome</Label>
        <Input
          id="activity-outcome"
          name="outcome"
          placeholder="e.g. Scheduled follow-up for next week"
        />
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? (
            "Saving..."
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Log Activity
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

interface LogActivityDialogProps {
  customerId?: string
  leadId?: string
  trigger: React.ReactNode
}

export function LogActivityDialog({
  customerId,
  leadId,
  trigger,
}: LogActivityDialogProps) {
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <FormContent
            key={formKey}
            customerId={customerId}
            leadId={leadId}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
