import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCustomerById } from "@/lib/queries/customers"
import { CustomerDetailTabs } from "@/components/customers/customer-detail-tabs"
import { CustomerFormDialog } from "@/components/customers/customer-form"
import { DeleteCustomerDialog } from "@/components/customers/delete-customer-dialog"
import type { Tag } from "@/types"

// ─── Hero helpers (server-renderable, no interactivity) ───────────────────────

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  inactive: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  churned: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
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

function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={{
        borderColor: tag.color + "60",
        color: tag.color,
        backgroundColor: tag.color + "18",
      }}
    >
      {tag.name}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { customer, deals, activities } = await getCustomerById(id)

  if (!customer) notFound()

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Customers
      </Link>

      {/* Hero header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Company initial */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
            {customer.company_name[0].toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {customer.company_name}
              </h1>
              <StatusBadge status={customer.status} />
            </div>

            <p className="text-sm text-muted-foreground">
              {customer.contact_name}
              {customer.email && <> · {customer.email}</>}
              {customer.phone && <> · {customer.phone}</>}
            </p>

            {customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {customer.tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CustomerFormDialog
            mode="edit"
            customer={customer}
            trigger={
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
          />
          <DeleteCustomerDialog
            id={customer.id}
            companyName={customer.company_name}
            redirectTo="/customers"
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
      <CustomerDetailTabs
        customer={customer}
        deals={deals}
        activities={activities}
      />
    </div>
  )
}
