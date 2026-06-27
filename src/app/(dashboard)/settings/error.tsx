"use client"

import { RouteError } from "@/components/shared/route-error"

export default function SettingsError({
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
      title="Settings unavailable"
      description="Your settings couldn't be loaded. Try again or contact your administrator."
    />
  )
}
