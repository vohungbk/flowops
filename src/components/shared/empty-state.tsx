import type { ElementType } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface EmptyStateAction {
  label: string
  href: string
}

interface EmptyStateProps {
  icon: ElementType
  title: string
  description: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {(action || secondaryAction) && (
        <div className="mt-6 flex items-center gap-4">
          {action && (
            <Link href={action.href} className={cn(buttonVariants({ size: "sm" }))}>
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
