"use client"

import { RouteError } from "@/components/shared/route-error"

export default function CustomerDetailError({
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
      title="Customer not available"
      description="This customer's profile couldn't be loaded."
      backHref="/customers"
      backLabel="Back to Customers"
    />
  )
}
