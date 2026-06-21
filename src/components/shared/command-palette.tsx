"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Kanban,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
  UserCircle,
  Plus,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { signOut } from "@/lib/actions/auth"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  function run(fn: () => void) {
    setOpen(false)
    fn()
  }

  return (
    <CommandDialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <CommandInput placeholder="Search pages and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => run(() => router.push("/dashboard"))}>
            <LayoutDashboard />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/customers"))}>
            <Users />
            Customers
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/leads"))}>
            <UserPlus />
            Leads
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/pipeline"))}>
            <Kanban />
            Pipeline
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/analytics"))}>
            <BarChart3 />
            Analytics
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/employees"))}>
            <UserCog />
            Employees
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/settings"))}>
            <Settings />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => run(() => router.push("/customers?new=1"))}>
            <Plus />
            New Customer
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/leads?new=1"))}>
            <Plus />
            New Lead
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/pipeline?new=1"))}>
            <Plus />
            New Deal
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => run(() => router.push("/settings/profile"))}>
            <UserCircle />
            Profile
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => signOut())}>
            <LogOut />
            Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
