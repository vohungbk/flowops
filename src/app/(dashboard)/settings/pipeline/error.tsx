"use client"

import { RouteError } from "@/components/shared/route-error"

export default function PipelineSettingsError({
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
      title="Pipeline settings unavailable"
      description="Stage configuration couldn't be loaded."
      backHref="/settings"
      backLabel="Back to Settings"
    />
  )
}
