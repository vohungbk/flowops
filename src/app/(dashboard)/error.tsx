"use client"

import { RouteError } from "@/components/shared/route-error"

// Catch-all for any dashboard page that doesn't have a more specific error.tsx.
export default function DashboardError({
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
      title="Page failed to load"
      description="An unexpected error occurred while loading this page. Your data is safe."
      backHref="/dashboard"
      backLabel="Back to dashboard"
    />
  )
}
