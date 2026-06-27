"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Kanban,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
  Plus,
  Moon,
  Sun,
  ShieldCheck,
  Building2,
  DollarSign,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { signOut } from "@/lib/actions/auth"
import { searchEntities, type SearchResult } from "@/lib/actions/search"
import type { Profile } from "@/types"

// ─── Static nav items ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Leads", href: "/leads", icon: UserPlus },
  { label: "Pipeline", href: "/pipeline", icon: Kanban },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Employees", href: "/employees", icon: UserCog },
  { label: "Audit Log", href: "/audit-log", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings },
]

// ─── Main component ───────────────────────────────────────────────────────────

interface CommandPaletteProps {
  profile: Profile | null
}

export function CommandPalette({ profile }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // ⌘K / Ctrl+K toggle
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Reset state when palette closes
  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setIsSearching(false)
    }
  }, [open])

  // Debounced live search — fires 300ms after last keystroke
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const id = setTimeout(async () => {
      try {
        setResults(await searchEntities(query))
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(id)
  }, [query])

  function run(fn: () => void) {
    setOpen(false)
    fn()
  }

  function matches(text: string) {
    return !query || text.toLowerCase().includes(query.toLowerCase())
  }

  // Static items filtered by current query
  const navItems = NAV_ITEMS.filter((i) => matches(i.label))

  const isDark = theme === "dark"
  const quickActions = [
    {
      label: "New Customer",
      action: () => router.push("/customers?new=1"),
      icon: Plus,
      shortcut: "⌘N",
    },
    {
      label: "New Lead",
      action: () => router.push("/leads?new=1"),
      icon: Plus,
    },
    {
      label: "New Deal",
      action: () => router.push("/pipeline"),
      icon: Plus,
    },
    {
      label: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
      action: () => setTheme(isDark ? "light" : "dark"),
      icon: isDark ? Sun : Moon,
    },
  ].filter((a) => matches(a.label))

  // Group search results by entity type
  const customerResults = results.filter((r) => r.type === "customer")
  const leadResults = results.filter((r) => r.type === "lead")
  const dealResults = results.filter((r) => r.type === "deal")
  const hasResults = results.length > 0
  const hasStaticItems = navItems.length > 0 || quickActions.length > 0

  // Profile initials
  const initials = profile?.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?"

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogHeader className="sr-only">
        <DialogTitle>Command Palette</DialogTitle>
        <DialogDescription>Search for pages, entities, and actions</DialogDescription>
      </DialogHeader>
      <DialogContent
        className="top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0"
        showCloseButton={false}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search pages, customers, deals…"
            value={query}
            onValueChange={setQuery}
          />

          <CommandList className="no-scrollbar max-h-96">
            {/* Empty / searching state */}
            <CommandEmpty>
              {isSearching ? (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </div>
              ) : (
                "No results found."
              )}
            </CommandEmpty>

            {/* ── Live search results ── */}
            {!isSearching && hasResults && (
              <>
                {customerResults.length > 0 && (
                  <CommandGroup heading="Customers">
                    {customerResults.map((r) => (
                      <CommandItem
                        key={r.id}
                        value={r.id}
                        onSelect={() => run(() => router.push(r.href))}
                      >
                        <Building2 />
                        <span className="font-medium">{r.label}</span>
                        {r.sub && (
                          <span className="text-xs text-muted-foreground">
                            {r.sub}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {leadResults.length > 0 && (
                  <CommandGroup heading="Leads">
                    {leadResults.map((r) => (
                      <CommandItem
                        key={r.id}
                        value={r.id}
                        onSelect={() => run(() => router.push(r.href))}
                      >
                        <UserPlus />
                        <span className="font-medium">{r.label}</span>
                        {r.sub && (
                          <span className="text-xs text-muted-foreground">
                            {r.sub}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {dealResults.length > 0 && (
                  <CommandGroup heading="Deals">
                    {dealResults.map((r) => (
                      <CommandItem
                        key={r.id}
                        value={r.id}
                        onSelect={() => run(() => router.push(r.href))}
                      >
                        <DollarSign />
                        <span className="font-medium">{r.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {hasStaticItems && <CommandSeparator />}
              </>
            )}

            {/* ── Navigation ── */}
            {navItems.length > 0 && (
              <CommandGroup heading="Navigation">
                {navItems.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={item.label}
                    onSelect={() => run(() => router.push(item.href))}
                  >
                    <item.icon />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* ── Quick Actions ── */}
            {quickActions.length > 0 && (
              <>
                {navItems.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Quick Actions">
                  {quickActions.map((a) => (
                    <CommandItem
                      key={a.label}
                      value={a.label}
                      onSelect={() => run(a.action)}
                    >
                      <a.icon />
                      {a.label}
                      {"shortcut" in a && (
                        <CommandShortcut>{a.shortcut}</CommandShortcut>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* ── Account (only shown when not actively searching) ── */}
            {!query && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Account">
                  {profile && (
                    <div className="flex items-center gap-2.5 px-2 py-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-tight">
                          {profile.full_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                  )}
                  <CommandItem
                    value="settings"
                    onSelect={() => run(() => router.push("/settings"))}
                  >
                    <Settings />
                    Settings
                    <CommandShortcut>⌘,</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    value="sign-out"
                    onSelect={() => run(() => signOut())}
                  >
                    <LogOut />
                    Sign out
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
