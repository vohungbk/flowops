"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Kanban,
  BarChart3,
  Settings,
  UserCog,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

type NavGroup = {
  label?: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "CRM",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Leads", href: "/leads", icon: UserPlus },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Pipeline", href: "/pipeline", icon: Kanban },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Team",
    items: [
      { label: "Employees", href: "/employees", icon: UserCog },
    ],
  },
]

const bottomItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-primary"
          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      {active && (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" />
      )}
      <item.icon
        className={cn("h-4 w-4 shrink-0 transition-colors", active && "text-primary")}
      />
      {item.label}
      {item.badge != null && item.badge > 0 && (
        <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[11px] font-medium leading-none text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
          FlowOps
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto p-2 pt-3 space-y-4">
        {navGroups.map((group, i) => (
          <div key={i}>
            {group.label && (
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item.href)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t p-2 pb-3">
        <div className="space-y-0.5">
          {bottomItems.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      </div>
    </aside>
  )
}
