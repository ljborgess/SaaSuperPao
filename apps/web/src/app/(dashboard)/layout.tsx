import { Topbar } from '@/components/layout/topbar'
import { ChatWidget } from '@/components/ai/chat-widget'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen" style={{ background: '#FAF8F3' }}>
      <Topbar />
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-8 animate-fade-in">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </main>
      <ChatWidget />
    </div>
  )
}
