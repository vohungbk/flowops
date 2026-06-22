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
import { LEAD_STATUSES, LEAD_SOURCES } from "@/lib/constants"

export function LeadFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentSearch = searchParams.get("search") ?? ""
  const currentStatus = searchParams.get("status") ?? ""
  const currentSource = searchParams.get("source") ?? ""

  const [localSearch, setLocalSearch] = useState(currentSearch)

  const searchParamsRef = useRef(searchParams)
  useEffect(() => {
    searchParamsRef.current = searchParams
  })

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
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, pathname, router])

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function clearFilters() {
    setLocalSearch("")
    startTransition(() => router.push(pathname))
  }

  const hasFilters = currentSearch || currentStatus || currentSource

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-xs flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search name, email, company…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={currentStatus || null}
        onValueChange={(val) => updateFilter("status", val)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentSource || null}
        onValueChange={(val) => updateFilter("source", val)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All sources" />
        </SelectTrigger>
        <SelectContent>
          {LEAD_SOURCES.map((s) => (
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
