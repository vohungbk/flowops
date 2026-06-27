"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Profile } from "@/types"

const ACTIONS = [
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "deleted", label: "Deleted" },
  { value: "stage_changed", label: "Stage changed" },
  { value: "login", label: "Login" },
]

const ENTITY_TYPES = [
  { value: "customer", label: "Customer" },
  { value: "lead", label: "Lead" },
  { value: "deal", label: "Deal" },
  { value: "employee", label: "Employee" },
  { value: "activity", label: "Activity" },
  { value: "pipeline_stage", label: "Pipeline stage" },
]

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
]

interface AuditLogFiltersProps {
  profiles: Pick<Profile, "id" | "full_name">[]
}

export function AuditLogFilters({ profiles }: AuditLogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentAction = searchParams.get("action") ?? ""
  const currentEntityType = searchParams.get("entity_type") ?? ""
  const currentUserId = searchParams.get("user_id") ?? ""
  const currentPeriod = searchParams.get("period") ?? ""

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function clearAll() {
    startTransition(() => router.push(pathname))
  }

  const hasFilters = currentAction || currentEntityType || currentUserId || currentPeriod

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={currentAction || null} onValueChange={(v) => update("action", v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All actions" />
        </SelectTrigger>
        <SelectContent>
          {ACTIONS.map((a) => (
            <SelectItem key={a.value} value={a.value}>
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentEntityType || null} onValueChange={(v) => update("entity_type", v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All entities" />
        </SelectTrigger>
        <SelectContent>
          {ENTITY_TYPES.map((e) => (
            <SelectItem key={e.value} value={e.value}>
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentUserId || null} onValueChange={(v) => update("user_id", v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All users" />
        </SelectTrigger>
        <SelectContent>
          {profiles.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentPeriod || null} onValueChange={(v) => update("period", v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All time" />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}
