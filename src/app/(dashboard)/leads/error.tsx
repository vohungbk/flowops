"use client"

import { RouteError } from "@/components/shared/route-error"

export default function LeadsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Leads couldn't be loaded"
      description="There was a problem fetching your leads. Try again or check your connection."
    />
  )
}
