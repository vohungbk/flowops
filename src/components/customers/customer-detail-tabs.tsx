"use client"

import type { ElementType } from "react"
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
  Globe,
  MapPin,
  Building2,
  User,
  Kanban,
  Clock,
  Plus,
  ChevronRight,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { CustomerDetail, CustomerDeal, CustomerActivity } from "@/lib/queries/customers"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

// ─── Stage badge ──────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: CustomerDeal["stage"] }) {
  const className = stage.is_closed_won
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : stage.is_closed_lost
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {stage.name}
    </span>
  )
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

// ─── Main component ───────────────────────────────────────────────────────────

interface CustomerDetailTabsProps {
  customer: CustomerDetail
  deals: CustomerDeal[]
  activities: CustomerActivity[]
}

export function CustomerDetailTabs({
  customer,
  deals,
  activities,
}: CustomerDetailTabsProps) {
  const openDeals = deals.filter(
    (d) => !d.stage.is_closed_won && !d.stage.is_closed_lost
  )
  const wonDeals = deals.filter((d) => d.stage.is_closed_won)
  const lostDeals = deals.filter((d) => d.stage.is_closed_lost)
  const totalOpen = openDeals.reduce((sum, d) => sum + d.value, 0)
  const totalWon = wonDeals.reduce((sum, d) => sum + d.value, 0)

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="deals">
          Deals{deals.length > 0 ? ` (${deals.length})` : ""}
        </TabsTrigger>
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
              <InfoRow icon={User} label="Name" value={customer.contact_name} />
              <InfoRow icon={Mail} label="Email" value={customer.email} />
              <InfoRow icon={Phone} label="Phone" value={customer.phone} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={Building2} label="Industry" value={customer.industry} />
              <InfoRow icon={Globe} label="Website" value={customer.website} />
              <InfoRow icon={MapPin} label="Address" value={customer.address} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.assigned_profile ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {customer.assigned_profile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {customer.assigned_profile.full_name}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pipeline Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Open deals", value: String(openDeals.length) },
                { label: "Pipeline value", value: formatCurrency(totalOpen) },
                {
                  label: "Total won",
                  value: formatCurrency(totalWon),
                  highlight: totalWon > 0,
                },
                { label: "Activities logged", value: String(activities.length) },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      highlight && "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ── Deals ────────────────────────────────────────────────────────── */}
      <TabsContent value="deals" className="mt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {deals.length} {deals.length === 1 ? "deal" : "deals"}
            </p>
            <Button size="sm" className="gap-1.5" disabled>
              <Plus className="h-3.5 w-3.5" />
              Add Deal
            </Button>
          </div>

          {deals.length === 0 ? (
            <EmptyState
              icon={Kanban}
              title="No deals yet"
              description="Add a deal to track this customer in your sales pipeline."
            />
          ) : (
            <>
              <div className="divide-y rounded-lg border">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center gap-4 px-4 py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {deal.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StageBadge stage={deal.stage} />
                        {deal.expected_close_date && (
                          <span className="text-xs text-muted-foreground">
                            Close {formatDate(deal.expected_close_date)}
                          </span>
                        )}
                        {deal.probability > 0 && !deal.stage.is_closed_won && !deal.stage.is_closed_lost && (
                          <span className="text-xs text-muted-foreground">
                            {deal.probability}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(deal.value)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {openDeals.length} open · {wonDeals.length} won ·{" "}
                  {lostDeals.length} lost
                </span>
                <span className="font-medium">
                  Pipeline: {formatCurrency(totalOpen)}
                </span>
              </div>
            </>
          )}
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
              description="Log calls, emails, meetings, and notes to track your interactions with this customer."
            />
          ) : (
            <div>
              {activities.map((activity, i) => {
                const config =
                  ACTIVITY_CONFIG[activity.type] ?? ACTIVITY_CONFIG.note
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
                      {!isLast && (
                        <div className="mt-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "min-w-0 flex-1",
                        !isLast && "pb-6"
                      )}
                    >
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
        {customer.notes ? (
          <Card>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {customer.notes}
              </p>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No notes"
            description="Notes about this customer will appear here."
          />
        )}
      </TabsContent>
    </Tabs>
  )
}
