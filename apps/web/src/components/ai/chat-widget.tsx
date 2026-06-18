'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Loader2, Bot, User } from 'lucide-react'
import { sendChatMessage } from '@/lib/ai'
import type { ChatMessage } from '@superpao/shared-types'
import { cn } from '@/lib/utils'

const WELCOME_MESSAGE = 'Olá! Analise a situação atual da padaria e me dê um resumo dos principais pontos de atenção.'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open && !initialized) {
      setInitialized(true)
      runMessage(WELCOME_MESSAGE, [])
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function runMessage(text: string, history: ChatMessage[]) {
    setLoading(true)
    try {
      const res = await sendChatMessage(text, history)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.message, timestamp: res.timestamp },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() }
    const nextHistory = [...messages, userMsg]
    setMessages(nextHistory)
    setInput('')
    await runMessage(text, nextHistory)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
          open
            ? 'bg-brand-800 rotate-0 scale-95'
            : 'bg-brand-700 hover:bg-brand-800 hover:scale-105',
        )}
        aria-label="Assistente IA"
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <Sparkles size={22} className="text-white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] flex flex-col bg-white rounded-2xl shadow-2xl border border-surface-300/80 overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-brand-700 text-white shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Assistente SuperPão</p>
              <p className="text-xs text-white/70">Powered by Llama 3.3 · Groq</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.length === 0 && loading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-brand-600" />
                </div>
                <div className="bg-surface-100 rounded-2xl rounded-tl-sm px-3 py-2">
                  <Loader2 size={16} className="animate-spin text-brand-400" />
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex items-start gap-2', msg.role === 'user' && 'flex-row-reverse')}
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  msg.role === 'user' ? 'bg-brand-700' : 'bg-brand-100',
                )}>
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Bot size={14} className="text-brand-600" />}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-brand-700 text-white rounded-tr-sm'
                    : 'bg-surface-100 text-brand-900 rounded-tl-sm',
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && messages.length > 0 && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-brand-600" />
                </div>
                <div className="bg-surface-100 rounded-2xl rounded-tl-sm px-3 py-2">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-surface-200 shrink-0">
            <div className="flex items-center gap-2 bg-surface-100 rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Pergunte sobre a padaria..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-brand-900 placeholder:text-brand-400 outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center disabled:opacity-40 hover:bg-brand-800 transition-colors shrink-0"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
