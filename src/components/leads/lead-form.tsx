"use client"

import { useActionState, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, AlertCircle, Sparkles } from "lucide-react"
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
import { createLead, updateLead } from "@/lib/actions/leads"
import { LEAD_STATUSES, LEAD_SOURCES } from "@/lib/constants"
import type { ActionResult, Lead } from "@/types"

// ─── Inner form (keyed so useActionState resets on reopen) ────────────────────

interface FormContentProps {
  mode: "create" | "edit"
  lead?: Lead
  onSuccess: () => void
}

function FormContent({ mode, lead, onSuccess }: FormContentProps) {
  const router = useRouter()
  const action =
    mode === "create" ? createLead : updateLead.bind(null, lead!.id)

  const initial: ActionResult = { success: false, error: "" }
  const [state, formAction, isPending] = useActionState(action, initial)

  const [status, setStatus] = useState<string>(lead?.status ?? "new")
  const [source, setSource] = useState<string>(lead?.source ?? "web")

  useEffect(() => {
    if (state.success) {
      onSuccess()
      router.refresh()
    }
  }, [state.success, onSuccess, router])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="source" value={source} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First name *</Label>
          <Input
            id="first_name"
            name="first_name"
            placeholder="Jane"
            defaultValue={lead?.first_name ?? ""}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            name="last_name"
            placeholder="Smith"
            defaultValue={lead?.last_name ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            defaultValue={lead?.email ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+1 555 000 0000"
            defaultValue={lead?.phone ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            placeholder="Acme Corp"
            defaultValue={lead?.company ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="job_title">Job title</Label>
          <Input
            id="job_title"
            name="job_title"
            placeholder="VP of Sales"
            defaultValue={lead?.job_title ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Source</Label>
          <Select value={source} onValueChange={(v) => setSource(v ?? "web")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v ?? "new")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1.5 rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        Lead score is calculated automatically from profile completeness, source, and activity.
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Additional notes…"
          defaultValue={lead?.notes ?? ""}
          className="min-h-20 resize-none"
        />
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? (
            "Saving…"
          ) : mode === "create" ? (
            <>
              <Plus className="h-4 w-4" />
              Add Lead
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

interface LeadFormDialogProps {
  mode: "create" | "edit"
  lead?: Lead
  trigger: React.ReactNode
  defaultOpen?: boolean
}

export function LeadFormDialog({ mode, lead, trigger, defaultOpen }: LeadFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (defaultOpen) {
      setFormKey((k) => k + 1)
      setOpen(true)
    }
  }, [defaultOpen])

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
              {mode === "create" ? "Add Lead" : "Edit Lead"}
            </DialogTitle>
          </DialogHeader>
          <FormContent
            key={formKey}
            mode={mode}
            lead={lead}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
