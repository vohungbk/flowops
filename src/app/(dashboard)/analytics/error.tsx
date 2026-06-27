"use client"

import { RouteError } from "@/components/shared/route-error"

export default function AnalyticsError({
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
      title="Analytics unavailable"
      description="Charts and metrics couldn't be computed. This may be a temporary database issue."
      backHref="/dashboard"
      backLabel="Back to dashboard"
    />
  )
}
