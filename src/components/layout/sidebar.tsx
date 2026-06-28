"use client"

import { SidebarLogo, SidebarNav } from "@/components/layout/sidebar-nav"

export function Sidebar() {
  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <SidebarLogo />
      <SidebarNav />
    </aside>
  )
}
