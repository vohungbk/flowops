"use client"

import { RouteError } from "@/components/shared/route-error"

export default function PipelineError({
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
      title="Pipeline unavailable"
      description="The pipeline board couldn't be loaded. Realtime sync requires a stable connection — try again."
      backHref="/dashboard"
      backLabel="Back to dashboard"
    />
  )
}
