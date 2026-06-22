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
import { createCustomer, updateCustomer } from "@/lib/actions/customers"
import { CUSTOMER_STATUSES, INDUSTRIES } from "@/lib/constants"
import type { ActionResult, Customer } from "@/types"

// ─── Inner form (keyed so useActionState resets on reopen) ────────────────────

interface FormContentProps {
  mode: "create" | "edit"
  customer?: Customer
  onSuccess: () => void
}

function FormContent({ mode, customer, onSuccess }: FormContentProps) {
  const router = useRouter()
  const action =
    mode === "create"
      ? createCustomer
      : updateCustomer.bind(null, customer!.id)

  const initial: ActionResult = { success: false, error: "" }
  const [state, formAction, isPending] = useActionState(action, initial)

  const [status, setStatus] = useState<string>(customer?.status ?? "active")
  const [industry, setIndustry] = useState<string>(customer?.industry ?? "")

  useEffect(() => {
    if (state.success) {
      onSuccess()
      router.refresh()
    }
  }, [state.success, onSuccess, router])

  return (
    <form action={formAction} className="space-y-4">
      {/* hidden controlled values */}
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="industry" value={industry} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* Company name */}
      <div className="space-y-1.5">
        <Label htmlFor="company_name">Company name *</Label>
        <Input
          id="company_name"
          name="company_name"
          placeholder="Acme Corp"
          defaultValue={customer?.company_name ?? ""}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Contact name */}
        <div className="space-y-1.5">
          <Label htmlFor="contact_name">Contact name</Label>
          <Input
            id="contact_name"
            name="contact_name"
            placeholder="John Smith"
            defaultValue={customer?.contact_name ?? ""}
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v ?? "active")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="contact@acme.com"
            defaultValue={customer?.email ?? ""}
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+1 555 000 0000"
            defaultValue={customer?.phone ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Industry */}
        <div className="space-y-1.5">
          <Label>Industry</Label>
          <Select value={industry} onValueChange={(v) => setIndustry(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            placeholder="https://acme.com"
            defaultValue={customer?.website ?? ""}
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="123 Main St, City, Country"
          defaultValue={customer?.address ?? ""}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Additional notes..."
          defaultValue={customer?.notes ?? ""}
          className="min-h-20 resize-none"
        />
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? (
            "Saving..."
          ) : mode === "create" ? (
            <>
              <Plus className="h-4 w-4" />
              Add Customer
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

interface CustomerFormDialogProps {
  mode: "create" | "edit"
  customer?: Customer
  trigger: React.ReactNode
}

export function CustomerFormDialog({
  mode,
  customer,
  trigger,
}: CustomerFormDialogProps) {
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
              {mode === "create" ? "Add Customer" : "Edit Customer"}
            </DialogTitle>
          </DialogHeader>
          <FormContent
            key={formKey}
            mode={mode}
            customer={customer}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
