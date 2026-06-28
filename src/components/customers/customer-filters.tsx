"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CUSTOMER_STATUSES } from "@/lib/constants"

export function CustomerFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentSearch = searchParams.get("search") ?? ""
  const currentStatus = searchParams.get("status") ?? ""

  const [localSearch, setLocalSearch] = useState(currentSearch)

  // Keep a ref to latest searchParams so the debounce closure never goes stale
  const searchParamsRef = useRef(searchParams)
  useEffect(() => {
    searchParamsRef.current = searchParams
  })

  // Debounce: push search term to URL 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
      const urlSearch = params.get("search") ?? ""
      if (localSearch === urlSearch) return

      if (localSearch.trim()) {
        params.set("search", localSearch.trim())
      } else {
        params.delete("search")
      }
      params.delete("page")

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, pathname, router])

  function updateStatus(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set("status", value)
    } else {
      params.delete("status")
    }
    params.delete("page")
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function clearFilters() {
    setLocalSearch("")
    startTransition(() => router.push(pathname))
  }

  const hasFilters = currentSearch || currentStatus

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-xs flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          aria-label="Search customers"
          placeholder="Search company, contact, email…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={currentStatus || null}
        onValueChange={(val) => updateStatus(val)}
      >
        <SelectTrigger className="w-38">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {CUSTOMER_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}
