"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"

const PERIODS = [
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
  { value: "all", label: "All time" },
] as const

export type Period = (typeof PERIODS)[number]["value"]

interface PeriodSelectorProps {
  current: Period
}

export function PeriodSelector({ current }: PeriodSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const set = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === "12m") {
        params.delete("period")
      } else {
        params.set("period", value)
      }
      const qs = params.toString()
      router.push(`${pathname}${qs ? `?${qs}` : ""}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => set(p.value)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            current === p.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
