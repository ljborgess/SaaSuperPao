import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { ChatWidget } from '@/components/ai/chat-widget'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-surface-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-8 animate-fade-in">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}
