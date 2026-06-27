"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  BellOff,
  Users,
  UserPlus,
  DollarSign,
  Kanban,
  CheckCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { markNotificationsRead } from "@/lib/actions/notifications"
import { useNotifications } from "@/hooks/use-notifications"
import type { NotificationWithActor } from "@/lib/queries/notifications"

// ─── Icon per notification type ───────────────────────────────────────────────

const TYPE_META: Record<
  string,
  { icon: React.ElementType; color: string; href: (entityId: string | null) => string }
> = {
  customer_created: {
    icon: Users,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
    href: (id) => (id ? `/customers/${id}` : "/customers"),
  },
  lead_created: {
    icon: UserPlus,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    href: (id) => (id ? `/leads/${id}` : "/leads"),
  },
  deal_created: {
    icon: DollarSign,
    color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400",
    href: () => "/pipeline",
  },
  deal_stage_changed: {
    icon: Kanban,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    href: () => "/pipeline",
  },
}

const FALLBACK_META = {
  icon: Bell,
  color: "text-muted-foreground bg-muted",
  href: () => "/dashboard",
}

// ─── Relative time ────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Single notification row ──────────────────────────────────────────────────

function NotificationRow({
  n,
  onNavigate,
}: {
  n: NotificationWithActor
  onNavigate: (href: string) => void
}) {
  const meta = TYPE_META[n.type] ?? FALLBACK_META
  const Icon = meta.icon

  return (
    <button
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
        !n.is_read && "bg-primary/5 dark:bg-primary/10"
      )}
      onClick={() => onNavigate(meta.href(n.entity_id))}
    >
      {/* Type icon */}
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          meta.color
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm leading-snug", !n.is_read && "font-medium")}>
          {n.title}
        </p>
        {(n.actor?.full_name || n.body) && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {n.actor?.full_name && <span>{n.actor.full_name}</span>}
            {n.actor?.full_name && n.body && " · "}
            {n.body && <span>{n.body}</span>}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          {timeAgo(n.created_at)}
        </p>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  )
}

// ─── Main bell component ──────────────────────────────────────────────────────

interface NotificationBellProps {
  initialNotifications: NotificationWithActor[]
  initialUnread: number
}

export function NotificationBell({
  initialNotifications,
  initialUnread,
}: NotificationBellProps) {
  const { notifications, unreadCount, optimisticMarkAllRead } = useNotifications(
    initialNotifications,
    initialUnread
  )
  const router = useRouter()
  const [, startTransition] = useTransition()

  function handleMarkAllRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return
    optimisticMarkAllRead(unreadIds)
    startTransition(() => {
      markNotificationsRead("all")
    })
  }

  function handleNavigate(href: string) {
    router.push(href)
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Notifications"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" side="bottom" sideOffset={8} className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <BellOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">You&apos;re all caught up</p>
              <p className="text-xs text-muted-foreground">
                New notifications will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <NotificationRow key={n.id} n={n} onNavigate={handleNavigate} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-4 py-2.5">
            <button
              className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => router.push("/dashboard")}
            >
              View all activity
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
