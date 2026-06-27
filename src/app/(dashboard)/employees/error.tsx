"use client"

import { RouteError } from "@/components/shared/route-error"

export default function EmployeesError({
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
      title="Team members couldn't be loaded"
      description="There was a problem fetching team member profiles."
    />
  )
}
