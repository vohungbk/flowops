"use client"

import { Bell, Moon, Sun, Search, LogOut, Settings, User, BellOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { signOut } from "@/lib/actions/auth"
import type { Profile } from "@/types"

interface HeaderProps {
  profile: Profile | null
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  employee: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
}

export function Header({ profile }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      {/* Search trigger → Command Palette */}
      <button
        className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        onClick={() =>
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", metaKey: true })
          )
        }
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="ml-4 rounded border bg-background px-1.5 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger
            aria-label="Toggle theme"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger
            aria-label="Notifications"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </PopoverTrigger>
          <PopoverContent align="end" side="bottom" sideOffset={8} className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold">Notifications</span>
              <button className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Mark all read
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <BellOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">You&apos;re all caught up</p>
              <p className="text-xs text-muted-foreground">
                New notifications will appear here
              </p>
            </div>

            <div className="border-t px-4 py-2.5">
              <button
                className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => router.push("/dashboard")}
              >
                View all activity
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "ghost" }), "h-8 gap-2 px-2")}
          >
            <Avatar className="h-6 w-6">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {profile ? getInitials(profile.full_name) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:block">
              {profile?.full_name ?? "Account"}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            {/* Profile section */}
            <div className="px-2 py-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {profile ? getInitials(profile.full_name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {profile?.full_name ?? "—"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile?.email ?? "—"}
                  </p>
                </div>
              </div>
              {profile?.role && (
                <span
                  className={cn(
                    "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                    ROLE_BADGE[profile.role] ?? ROLE_BADGE.employee
                  )}
                >
                  {profile.role}
                </span>
              )}
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => router.push("/settings/profile")}
            >
              <User className="h-4 w-4" />
              Profile
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => router.push("/settings")}
            >
              <Settings className="h-4 w-4" />
              Settings
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer gap-2"
              variant="destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
