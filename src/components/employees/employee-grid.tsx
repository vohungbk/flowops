"use client"

import { useState } from "react"
import { UserPlus, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { EmployeeDetailSheet } from "@/components/employees/employee-detail-sheet"
import { InviteEmployeeDialog } from "@/components/employees/invite-employee-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import type { Profile } from "@/types"
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

// ─── Employee card ────────────────────────────────────────────────────────────

function EmployeeCard({
  employee,
  isSelf,
  onClick,
}: {
  employee: EmployeeWithStats
  isSelf: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col items-center gap-4 rounded-xl border bg-card p-6 text-left",
        "transition-all hover:border-ring/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-16 w-16 text-base">
          {employee.avatar_url && (
            <AvatarImage src={employee.avatar_url} alt={employee.full_name} />
          )}
          <AvatarFallback className="text-base">
            {initials(employee.full_name)}
          </AvatarFallback>
        </Avatar>
        {/* Active indicator */}
        <span
          className={cn(
            "absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full ring-2 ring-card",
            employee.is_active ? "bg-emerald-500" : "bg-slate-400"
          )}
        />
      </div>

      {/* Identity */}
      <div className="w-full text-center">
        <p className="truncate font-semibold">
          {employee.full_name}
          {isSelf && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              (you)
            </span>
          )}
        </p>
        {employee.department && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {employee.department}
          </p>
        )}
        <span
          className={cn(
            "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
            ROLE_STYLES[employee.role] ?? "bg-muted text-muted-foreground"
          )}
        >
          {employee.role}
        </span>
      </div>

      {/* Stats */}
      <div className="grid w-full grid-cols-2 gap-2 border-t pt-4">
        <div className="text-center">
          <p className="text-lg font-bold">{employee.dealsWon}</p>
          <p className="text-xs text-muted-foreground">deals won</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{formatCurrency(employee.revenueGenerated)}</p>
          <p className="text-xs text-muted-foreground">revenue</p>
        </div>
      </div>
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface EmployeeGridProps {
  employees: EmployeeWithStats[]
  currentProfile: Profile
}

export function EmployeeGrid({ employees, currentProfile }: EmployeeGridProps) {
  const [selected, setSelected] = useState<EmployeeWithStats | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const isAdmin = currentProfile.role === "admin"

  function openSheet(emp: EmployeeWithStats) {
    setSelected(emp)
    setSheetOpen(true)
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            {employees.length} {employees.length === 1 ? "member" : "members"}
          </p>
        </div>
        {isAdmin && (
          <InviteEmployeeDialog
            trigger={
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite employee
              </Button>
            }
          />
        )}
      </div>

      {/* Grid */}
      {employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description={
            isAdmin
              ? "Invite your team to give them access to FlowOps."
              : "Team members will appear here once they join."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              isSelf={emp.id === currentProfile.id}
              onClick={() => openSheet(emp)}
            />
          ))}
        </div>
      )}

      {/* Detail sheet — single instance, swaps content per selection */}
      <EmployeeDetailSheet
        employee={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        currentProfile={currentProfile}
      />
    </>
  )
}
