"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { UserCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { convertLead } from "@/lib/actions/leads"

interface ConvertLeadDialogProps {
  id: string
  leadName: string
  trigger: React.ReactNode
}

export function ConvertLeadDialog({
  id,
  leadName,
  trigger,
}: ConvertLeadDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    setError("")
    startTransition(async () => {
      const result = await convertLead(id)
      if (result.success) {
        setOpen(false)
        router.push(`/customers/${result.data.customerId}`)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <>
      <span style={{ display: "contents" }} onClick={() => setOpen(true)}>
        {trigger}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Convert to customer</DialogTitle>
            <DialogDescription>
              Convert{" "}
              <span className="font-medium text-foreground">{leadName}</span> to
              a customer? A new customer record will be created and this lead
              will be marked as converted.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <DialogFooter showCloseButton>
            <Button
              disabled={isPending}
              onClick={handleConfirm}
              className="gap-2"
            >
              <UserCheck className="h-4 w-4" />
              {isPending ? "Converting…" : "Convert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
