import { Toaster } from "sonner"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/shared/command-palette"
import { getCurrentProfile } from "@/lib/actions/auth"
import { getNotifications } from "@/lib/queries/notifications"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, { notifications, unreadCount }] = await Promise.all([
    getCurrentProfile(),
    getNotifications(),
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header profile={profile} notifications={notifications} unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <CommandPalette profile={profile} />
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  )
}
