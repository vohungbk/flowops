"use client"

import Link from "next/link"
import { ServerCrash, RotateCcw, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
  backHref?: string
  backLabel?: string
}

export function RouteError({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. This may be temporary — try again.",
  backHref,
  backLabel = "Go back",
}: RouteErrorProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
        <ServerCrash className="h-7 w-7 text-destructive" />
      </div>

      <h2 className="mt-4 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>

      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-muted-foreground/50">
          ref: {error.digest}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <ChevronLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        )}
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  )
}
