import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Pencil, Trash2, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getLeadById } from "@/lib/queries/leads"
import { LeadDetailTabs } from "@/components/leads/lead-detail-tabs"
import { LeadFormDialog } from "@/components/leads/lead-form"
import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog"
import { ConvertLeadDialog } from "@/components/leads/convert-lead-dialog"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { lead } = await getLeadById(id)
  if (!lead) return { title: "Lead Not Found" }
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ")
  return {
    title: name,
    description: `Lead profile for ${name}${lead.company ? ` at ${lead.company}` : ""}.`,
  }
}

// ─── Hero helpers ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  contacted: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  qualified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  disqualified: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  converted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

const SOURCE_LABELS: Record<string, string> = {
  web: "Website",
  referral: "Referral",
  linkedin: "LinkedIn",
  event: "Event",
  "cold-outreach": "Cold Outreach",
  other: "Other",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  )
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {SOURCE_LABELS[source] ?? source}
    </span>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : score >= 40
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
        color
      )}
    >
      Score: {score}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { lead, activities } = await getLeadById(id)

  if (!lead) notFound()

  const leadName = [lead.first_name, lead.last_name].filter(Boolean).join(" ")
  const isConverted = lead.status === "converted"

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/leads"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Leads
      </Link>

      {/* Hero header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Lead initial */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
            {lead.first_name[0].toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{leadName}</h1>
              <StatusBadge status={lead.status} />
              <SourceBadge source={lead.source} />
              <ScoreBadge score={lead.score} />
            </div>

            <p className="text-sm text-muted-foreground">
              {lead.job_title}
              {lead.company && lead.job_title && <> at </>}
              {lead.company && <span className="font-medium text-foreground">{lead.company}</span>}
            </p>

            {(lead.email || lead.phone) && (
              <p className="text-sm text-muted-foreground">
                {lead.email}
                {lead.email && lead.phone && <> · </>}
                {lead.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-start">
          {!isConverted && (
            <ConvertLeadDialog
              id={lead.id}
              leadName={leadName}
              trigger={
                <Button className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  Convert
                </Button>
              }
            />
          )}
          <LeadFormDialog
            mode="edit"
            lead={lead}
            trigger={
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
          />
          <DeleteLeadDialog
            id={lead.id}
            leadName={leadName}
            redirectTo="/leads"
            trigger={
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            }
          />
        </div>
      </div>

      {/* Detail tabs */}
      <LeadDetailTabs lead={lead} activities={activities} />
    </div>
  )
}
