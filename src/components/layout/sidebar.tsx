"use client"

import type { UserRole } from "@/types"
import { SidebarLogo, SidebarNav } from "@/components/layout/sidebar-nav"

export function Sidebar({ role }: { role?: UserRole }) {
  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <SidebarLogo />
      <SidebarNav role={role} />
    </aside>
  )
}
