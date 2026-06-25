"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Mail,
  Phone,
  Building2,
  CalendarDays,
  TrendingUp,
  Trophy,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { updateEmployeeRole, toggleEmployeeStatus } from "@/lib/actions/employees"
import { USER_ROLES } from "@/lib/constants"
import type { Profile, UserRole } from "@/types"
import type { EmployeeWithStats } from "@/lib/queries/employees"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  admin:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  manager:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  employee:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium">{value}</span>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface EmployeeDetailSheetProps {
  employee: EmployeeWithStats | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentProfile: Profile
}

export function EmployeeDetailSheet({
  employee,
  open,
  onOpenChange,
  currentProfile,
}: EmployeeDetailSheetProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const isAdmin = currentProfile.role === "admin"
  const isSelf = employee?.id === currentProfile.id

  function handleRoleChange(role: string | null) {
    if (!employee || !role) return
    setError("")
    startTransition(async () => {
      const result = await updateEmployeeRole(employee.id, role as UserRole)
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  function handleStatusToggle() {
    if (!employee) return
    setError("")
    startTransition(async () => {
      const result = await toggleEmployeeStatus(employee.id, !employee.is_active)
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  if (!employee) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto p-0 sm:max-w-sm">
        {/* Header */}
        <SheetHeader className="border-b p-6 pb-5">
          <div className="flex items-start gap-4">
            <Avatar size="lg" className="h-14 w-14 text-base">
              {employee.avatar_url && (
                <AvatarImage src={employee.avatar_url} alt={employee.full_name} />
              )}
              <AvatarFallback>{initials(employee.full_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{employee.full_name}</SheetTitle>
              <SheetDescription className="truncate">
                {employee.email}
              </SheetDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    ROLE_STYLES[employee.role] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {employee.role}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    employee.is_active
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {employee.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-5 p-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Trophy}
              label="Deals won"
              value={String(employee.dealsWon)}
            />
            <StatCard
              icon={TrendingUp}
              label="Revenue"
              value={formatCurrency(employee.revenueGenerated)}
            />
          </div>

          <Separator />

          {/* Contact info */}
          <div className="flex flex-col gap-3">
            <InfoRow icon={Mail} label="Email" value={employee.email} />
            <InfoRow icon={Phone} label="Phone" value={employee.phone} />
            <InfoRow
              icon={Building2}
              label="Department"
              value={employee.department}
            />
            <InfoRow
              icon={CalendarDays}
              label="Joined"
              value={formatDate(employee.created_at)}
            />
          </div>

          {/* Admin actions */}
          {isAdmin && !isSelf && (
            <>
              <Separator />
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Admin actions
                </p>

                <div className="grid gap-1.5">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Select
                    value={employee.role}
                    onValueChange={handleRoleChange}
                    disabled={isPending}
                  >
                    <SelectTrigger>
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

                <Button
                  variant={employee.is_active ? "destructive" : "outline"}
                  size="sm"
                  disabled={isPending}
                  onClick={handleStatusToggle}
                  className="gap-2"
                >
                  {employee.is_active ? (
                    <>
                      <UserX className="h-4 w-4" />
                      Deactivate account
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Reactivate account
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
