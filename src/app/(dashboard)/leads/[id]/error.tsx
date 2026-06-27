"use client"

import { RouteError } from "@/components/shared/route-error"

export default function LeadDetailError({
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
      title="Lead not available"
      description="This lead's details couldn't be loaded."
      backHref="/leads"
      backLabel="Back to Leads"
    />
  )
}
