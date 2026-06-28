"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { SidebarLogo, SidebarNav } from "@/components/layout/sidebar-nav"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        aria-label="Open navigation menu"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex w-60 flex-col gap-0 p-0 bg-sidebar"
        >
          <SidebarLogo />
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
