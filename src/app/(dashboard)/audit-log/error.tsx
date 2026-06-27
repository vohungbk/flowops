"use client"

import { RouteError } from "@/components/shared/route-error"

export default function AuditLogError({
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
      title="Audit log unavailable"
      description="The audit log couldn't be retrieved. This may be a permissions or database issue."
      backHref="/dashboard"
      backLabel="Back to dashboard"
    />
  )
}
