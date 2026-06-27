"use client"

import { RouteError } from "@/components/shared/route-error"

export default function DashboardPageError({
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
      title="Dashboard unavailable"
      description="Metrics and charts couldn't be loaded. This may be a temporary database issue."
    />
  )
}
