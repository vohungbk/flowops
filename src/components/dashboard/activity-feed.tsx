import type { ElementType } from "react"
import { Phone, Mail, Calendar, FileText, CheckSquare, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { RecentActivityRow } from "@/lib/queries/analytics"

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTIVITY_CONFIG: Record<
  string,
  { icon: ElementType; bg: string; color: string; label: string }
> = {
  call: { icon: Phone, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400", label: "Call" },
  email: { icon: Mail, bg: "bg-violet-100 dark:bg-violet-900/30", color: "text-violet-600 dark:text-violet-400", label: "Email" },
  meeting: { icon: Calendar, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400", label: "Meeting" },
  note: { icon: FileText, bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-600 dark:text-amber-400", label: "Note" },
  task: { icon: CheckSquare, bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600 dark:text-orange-400", label: "Task" },
}

// ─── Time helper ──────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(dateStr))
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ActivityFeedProps {
  activities: RecentActivityRow[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest interactions across your CRM</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs text-muted-foreground">
              Log calls, emails, and meetings to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((activity, i) => {
              const config = ACTIVITY_CONFIG[activity.type] ?? ACTIVITY_CONFIG.note
              const Icon = config.icon
              const isLast = i === activities.length - 1
              const entityName =
                activity.customer_name ??
                (activity.lead_first_name
                  ? [activity.lead_first_name, activity.lead_last_name].filter(Boolean).join(" ")
                  : null)

              return (
                <div key={activity.id} className="flex gap-3">
                  {/* Icon + connector line */}
                  <div className="flex flex-col items-center pt-0.5">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        config.bg
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", config.color)} />
                    </div>
                    {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
                  </div>

                  {/* Content */}
                  <div className={cn("min-w-0 flex-1", !isLast && "pb-4")}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium">{activity.subject}</p>
                      <time className="shrink-0 text-[11px] text-muted-foreground">
                        {timeAgo(activity.created_at)}
                      </time>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {config.label}
                      </span>
                      {entityName && (
                        <>
                          <span className="text-[11px] text-muted-foreground/50">·</span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {entityName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
