"use client"

import { RouteError } from "@/components/shared/route-error"

export default function CustomersError({
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
      title="Customers couldn't be loaded"
      description="There was a problem fetching your customer list. Try again or check your connection."
    />
  )
}
