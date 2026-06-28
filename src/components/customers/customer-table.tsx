"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Building2,
  SearchX,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CustomerFormDialog } from "@/components/customers/customer-form"
import { DeleteCustomerDialog } from "@/components/customers/delete-customer-dialog"
import type { Customer } from "@/types"

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  inactive:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
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

// ─── Row actions dropdown ─────────────────────────────────────────────────────

function RowActions({ customer }: { customer: Customer }) {
  const router = useRouter()
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => router.push(`/customers/${customer.id}`)}
          >
            <Eye className="h-4 w-4" />
            View
          </DropdownMenuItem>
          <CustomerFormDialog
            mode="edit"
            customer={customer}
            trigger={
              <DropdownMenuItem className="cursor-pointer gap-2" onSelect={(e) => e.preventDefault()}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
            }
          />
          <DropdownMenuSeparator />
          <DeleteCustomerDialog
            id={customer.id}
            companyName={customer.company_name}
            trigger={
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ─── Date helper ──────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

// ─── Column definitions ───────────────────────────────────────────────────────

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "company_name",
    header: "Company",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium">{row.original.company_name}</p>
        <p className="text-xs text-muted-foreground">{row.original.contact_name}</p>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) =>
      row.original.email ? (
        <span className="text-muted-foreground">{row.original.email}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "industry",
    header: "Industry",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.industry ?? "—"}</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions customer={row.original} />,
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

interface CustomerTableProps {
  data: Customer[]
  total: number
  page: number
  pageSize: number
  hasActiveFilter?: boolean
}

export function CustomerTable({
  data,
  total,
  page,
  pageSize,
  hasActiveFilter,
}: CustomerTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalPages = Math.ceil(total / pageSize)
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  function goToPage(target: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(target))
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  if (data.length === 0) {
    return hasActiveFilter ? (
      <EmptyState
        icon={SearchX}
        title="No customers match your filters"
        description="Try adjusting your search or status filter to find what you're looking for."
        secondaryAction={{ label: "Clear filters", href: "/customers" }}
      />
    ) : (
      <EmptyState
        icon={Building2}
        title="No customers yet"
        description="Add your first customer to start managing your relationships."
        action={{ label: "Add customer", href: "/customers?new=true" }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => router.push(`/customers/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            Showing {start}–{end} of {total}{" "}
            {total === 1 ? "customer" : "customers"}
          </p>
          <div className="flex items-center gap-2">
            <button
              className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
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
