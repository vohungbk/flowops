"use client"

import type { ElementType } from "react"
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
  Building2,
  Briefcase,
  User,
  Clock,
  MessageSquare,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import type { LeadDetail, LeadActivity } from "@/lib/queries/leads"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

// ─── Activity config ──────────────────────────────────────────────────────────

const ACTIVITY_CONFIG: Record<
  string,
  { icon: ElementType; bg: string; text: string; label: string }
> = {
  call: { icon: Phone, bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", label: "Call" },
  email: { icon: Mail, bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", label: "Email" },
  meeting: { icon: Calendar, bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", label: "Meeting" },
  note: { icon: FileText, bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", label: "Note" },
  task: { icon: CheckSquare, bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", label: "Task" },
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-all text-sm">{value}</p>
      </div>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-emerald-500"
      : score >= 40
        ? "bg-amber-500"
        : "bg-red-500"
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Lead score</span>
        <span className="font-semibold tabular-nums">{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

// ─── Source label helper ──────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  web: "Website",
  referral: "Referral",
  linkedin: "LinkedIn",
  event: "Event",
  "cold-outreach": "Cold Outreach",
  other: "Other",
}

// ─── Main component ───────────────────────────────────────────────────────────

interface LeadDetailTabsProps {
  lead: LeadDetail
  activities: LeadActivity[]
}

export function LeadDetailTabs({ lead, activities }: LeadDetailTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activities">
          Activities{activities.length > 0 ? ` (${activities.length})` : ""}
        </TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      <TabsContent value="overview" className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                icon={User}
                label="Name"
                value={[lead.first_name, lead.last_name].filter(Boolean).join(" ")}
              />
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={Building2} label="Company" value={lead.company} />
              <InfoRow icon={Briefcase} label="Job title" value={lead.job_title} />
              <InfoRow
                icon={TrendingUp}
                label="Source"
                value={SOURCE_LABELS[lead.source] ?? lead.source}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lead Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBar score={lead.score} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.assigned_profile ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {lead.assigned_profile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {lead.assigned_profile.full_name}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ── Activities ───────────────────────────────────────────────────── */}
      <TabsContent value="activities" className="mt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {activities.length}{" "}
              {activities.length === 1 ? "activity" : "activities"}
            </p>
            <Button size="sm" className="gap-1.5" disabled>
              <Plus className="h-3.5 w-3.5" />
              Log Activity
            </Button>
          </div>

          {activities.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No activities yet"
              description="Log calls, emails, meetings, and notes to track your interactions with this lead."
            />
          ) : (
            <div>
              {activities.map((activity, i) => {
                const config = ACTIVITY_CONFIG[activity.type] ?? ACTIVITY_CONFIG.note
                const Icon = config.icon
                const isLast = i === activities.length - 1
                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          config.bg
                        )}
                      >
                        <Icon className={cn("h-4 w-4", config.text)} />
                      </div>
                      {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
                    </div>
                    <div className={cn("min-w-0 flex-1", !isLast && "pb-6")}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {config.label}
                          </p>
                          <p className="text-sm font-medium">{activity.subject}</p>
                        </div>
                        <time className="shrink-0 text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </time>
                      </div>
                      {activity.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      )}
                      {activity.outcome && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          <span className="font-medium">Outcome:</span>{" "}
                          {activity.outcome}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </TabsContent>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      <TabsContent value="notes" className="mt-6">
        {lead.notes ? (
          <Card>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {lead.notes}
              </p>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No notes"
            description="Notes about this lead will appear here."
          />
        )}
      </TabsContent>
    </Tabs>
  )
}
