"use client"

import { useActionState, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { inviteEmployee } from "@/lib/actions/employees"
import { USER_ROLES } from "@/lib/constants"
import type { ActionResult } from "@/types"

const INITIAL: ActionResult = { success: false, error: "" }

interface InviteEmployeeDialogProps {
  trigger: React.ReactNode
}

function InviteForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(inviteEmployee, INITIAL)
  const [role, setRole] = useState("employee")

  useEffect(() => {
    if (state.success) {
      onSuccess()
      router.refresh()
    }
  }, [state.success, onSuccess, router])

  return (
    <form action={formAction} className="grid gap-4">
      {!state.success && state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="invite-full-name">Full name</Label>
        <Input
          id="invite-full-name"
          name="full_name"
          placeholder="Jane Smith"
          required
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="invite-email">Email address</Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          placeholder="jane@company.com"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="invite-role">Role</Label>
          <input type="hidden" name="role" value={role} />
          <Select value={role} onValueChange={(v) => v && setRole(v)}>
            <SelectTrigger id="invite-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USER_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="invite-department">Department</Label>
          <Input
            id="invite-department"
            name="department"
            placeholder="Sales"
          />
        </div>
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending} className="gap-2">
          <UserPlus className="h-4 w-4" />
          {isPending ? "Sending..." : "Send invitation"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function InviteEmployeeDialog({ trigger }: InviteEmployeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setFormKey((k) => k + 1)
  }

  return (
    <>
      <span style={{ display: "contents" }} onClick={() => setOpen(true)}>
        {trigger}
      </span>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite employee</DialogTitle>
            <DialogDescription>
              Send an invitation email. They&apos;ll set a password when they
              accept.
            </DialogDescription>
          </DialogHeader>
          <InviteForm key={formKey} onSuccess={() => handleOpenChange(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
