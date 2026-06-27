"use client"

import { RouteError } from "@/components/shared/route-error"

export default function AuthError({
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
      title="Authentication error"
      description="An unexpected error occurred on this page. Try again or return to sign in."
      backHref="/login"
      backLabel="Back to sign in"
    />
  )
}
