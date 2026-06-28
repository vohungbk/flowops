"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition } from "react"
import { ChevronDown, ChevronRight, ChevronLeft, ScrollText, SearchX } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AuditLogWithUser } from "@/lib/queries/audit-log"
import type { Json } from "@/types/database"

// ─── Action badge ─────────────────────────────────────────────────────────────

const ACTION_STYLES: Record<string, string> = {
  created:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  updated:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  deleted:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  stage_changed:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  login:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
}

function ActionBadge({ action }: { action: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        ACTION_STYLES[action] ?? "bg-muted text-muted-foreground"
      )}
    >
      {action.replace("_", " ")}
    </span>
  )
}

// ─── Relative time ────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

function formatFull(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr))
}

// ─── Inline JSON diff ─────────────────────────────────────────────────────────

const SKIP_FIELDS = new Set(["id", "created_at", "updated_at"])

type JsonObject = Record<string, Json>

function isJsonObject(v: Json | null | undefined): v is JsonObject {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function formatValue(v: Json): string {
  if (v === null) return "—"
  if (typeof v === "boolean") return v ? "true" : "false"
  if (typeof v === "string") return v || "—"
  if (typeof v === "number") return String(v)
  return JSON.stringify(v)
}

function DiffView({
  oldValues,
  newValues,
}: {
  oldValues: Json | null
  newValues: Json | null
}) {
  const oldObj = isJsonObject(oldValues) ? oldValues : {}
  const newObj = isJsonObject(newValues) ? newValues : {}

  const allKeys = [
    ...new Set([...Object.keys(oldObj), ...Object.keys(newObj)]),
  ].filter((k) => !SKIP_FIELDS.has(k))

  // For create (no old) or delete (no new), show all fields in one column
  const isCreate = !isJsonObject(oldValues) && isJsonObject(newValues)
  const isDelete = isJsonObject(oldValues) && !isJsonObject(newValues)

  if (allKeys.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">No field-level changes recorded.</p>
    )
  }

  if (isCreate) {
    return (
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b">
            <th className="py-1 pr-4 text-left font-medium text-muted-foreground">Field</th>
            <th className="py-1 text-left font-medium text-emerald-600 dark:text-emerald-400">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {allKeys.map((key) => (
            <tr key={key} className="border-b last:border-0">
              <td className="py-1 pr-4 font-mono text-muted-foreground">{key}</td>
              <td className="py-1 text-emerald-700 dark:text-emerald-400">
                {formatValue(newObj[key] ?? null)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  if (isDelete) {
    return (
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b">
            <th className="py-1 pr-4 text-left font-medium text-muted-foreground">Field</th>
            <th className="py-1 text-left font-medium text-red-600 dark:text-red-400">
              Removed value
            </th>
          </tr>
        </thead>
        <tbody>
          {allKeys.map((key) => (
            <tr key={key} className="border-b last:border-0">
              <td className="py-1 pr-4 font-mono text-muted-foreground">{key}</td>
              <td className="py-1 text-red-700 dark:text-red-400">
                {formatValue(oldObj[key] ?? null)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  // Update — only show fields that actually changed
  const changedKeys = allKeys.filter(
    (k) => formatValue(oldObj[k] ?? null) !== formatValue(newObj[k] ?? null)
  )

  if (changedKeys.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">No field-level changes recorded.</p>
    )
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b">
          <th className="py-1 pr-4 text-left font-medium text-muted-foreground">Field</th>
          <th className="py-1 pr-4 text-left font-medium text-red-600 dark:text-red-400">
            Before
          </th>
          <th className="py-1 text-left font-medium text-emerald-600 dark:text-emerald-400">
            After
          </th>
        </tr>
      </thead>
      <tbody>
        {changedKeys.map((key) => (
          <tr key={key} className="border-b last:border-0">
            <td className="py-1 pr-4 font-mono text-muted-foreground">{key}</td>
            <td className="py-1 pr-4 text-red-700 line-through opacity-60 dark:text-red-400">
              {formatValue(oldObj[key] ?? null)}
            </td>
            <td className="py-1 text-emerald-700 dark:text-emerald-400">
              {formatValue(newObj[key] ?? null)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── User cell ────────────────────────────────────────────────────────────────

function UserCell({
  user,
}: {
  user: AuditLogWithUser["user"]
}) {
  const name = user?.full_name ?? "Unknown"
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <Avatar size="sm">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm">{name}</span>
    </div>
  )
}

// ─── Main table ───────────────────────────────────────────────────────────────

interface AuditLogTableProps {
  data: AuditLogWithUser[]
  total: number
  page: number
  pageSize: number
  hasActiveFilter?: boolean
}

export function AuditLogTable({ data, total, page, pageSize, hasActiveFilter }: AuditLogTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalPages = Math.ceil(total / pageSize)
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  function goToPage(target: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(target))
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function toggleExpand(id: string, hasChanges: boolean) {
    if (!hasChanges) return
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (data.length === 0) {
    return hasActiveFilter ? (
      <EmptyState
        icon={SearchX}
        title="No events match your filters"
        description="Try adjusting the action, entity type, user, or period filter."
        secondaryAction={{ label: "Clear filters", href: "/audit-log" }}
      />
    ) : (
      <EmptyState
        icon={ScrollText}
        title="No audit events yet"
        description="Actions taken in the system will be recorded and shown here."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-6" />
              <TableHead>When</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead className="hidden lg:table-cell">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((log) => {
                const hasChanges =
                  log.old_values !== null || log.new_values !== null
                const isExpanded = expandedId === log.id

                return (
                  <>
                    <TableRow
                      key={log.id}
                      className={cn(
                        hasChanges && "cursor-pointer",
                        isExpanded && "bg-muted/40"
                      )}
                      onClick={() => toggleExpand(log.id, hasChanges)}
                    >
                      {/* Expand toggle */}
                      <TableCell className="w-6 pr-0">
                        {hasChanges ? (
                          isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          )
                        ) : null}
                      </TableCell>

                      {/* Timestamp */}
                      <TableCell>
                        <span
                          title={formatFull(log.created_at)}
                          className="text-sm text-muted-foreground tabular-nums"
                        >
                          {timeAgo(log.created_at)}
                        </span>
                      </TableCell>

                      {/* User */}
                      <TableCell>
                        <UserCell user={log.user} />
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        <ActionBadge action={log.action} />
                      </TableCell>

                      {/* Entity */}
                      <TableCell>
                        <div>
                          <span className="text-sm font-medium capitalize">
                            {log.entity_type.replace("_", " ")}
                          </span>
                          {log.entity_id && (
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {log.entity_id.slice(0, 8)}…
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* IP */}
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-mono text-xs text-muted-foreground">
                          {log.ip_address ?? "—"}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Inline diff expansion */}
                    {isExpanded && (
                      <TableRow key={`${log.id}-diff`} className="bg-muted/20 hover:bg-muted/20">
                        <TableCell />
                        <TableCell colSpan={5} className="pb-4 pt-2">
                          <DiffView
                            oldValues={log.old_values}
                            newValues={log.new_values}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            Showing {start}–{end} of {total.toLocaleString()} events
          </p>
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous page"
              className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              aria-label="Next page"
              className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
