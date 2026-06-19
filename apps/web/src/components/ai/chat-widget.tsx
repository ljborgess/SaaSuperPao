'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Loader2, Bot, User, Settings, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { sendChatMessage } from '@/lib/ai'
import type { ChatMessage, AiProvider } from '@superpao/shared-types'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'superpao_ai_config'

const PROVIDERS: { value: AiProvider; label: string; placeholder: string; models: string[] }[] = [
  {
    value: 'groq',
    label: 'Groq',
    placeholder: 'gsk_...',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  },
  {
    value: 'openai',
    label: 'OpenAI',
    placeholder: 'sk-...',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    placeholder: 'sk-ant-...',
    models: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-8'],
  },
]

interface AiConfig {
  provider: AiProvider
  apiKey: string
  model: string
}

function loadConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { provider: 'groq', apiKey: '', model: 'llama-3.3-70b-versatile' }
}

function saveConfig(cfg: AiConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [screen, setScreen] = useState<'chat' | 'settings'>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<AiConfig>({ provider: 'groq', apiKey: '', model: 'llama-3.3-70b-versatile' })
  const [draftConfig, setDraftConfig] = useState<AiConfig>(config)
  const [showKey, setShowKey] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const cfg = loadConfig()
    setConfig(cfg)
    setDraftConfig(cfg)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open && screen === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, screen])

  function openWidget() {
    setOpen(true)
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Olá! Como posso ajudar com a padaria hoje?',
        timestamp: new Date().toISOString(),
      }])
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    if (!config.apiKey) {
      setScreen('settings')
      return
    }

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() }
    const nextHistory = [...messages, userMsg]
    setMessages(nextHistory)
    setInput('')
    setLoading(true)
    try {
      const res = await sendChatMessage(text, nextHistory.slice(0, -1), config.provider, config.apiKey, config.model)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.message, timestamp: res.timestamp }])
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Erro ao processar. Verifique sua API key nas configurações.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function saveSettings() {
    setConfig(draftConfig)
    saveConfig(draftConfig)
    setScreen('chat')
  }

  const providerInfo = PROVIDERS.find((p) => p.value === draftConfig.provider) ?? PROVIDERS[0]
  const currentProviderInfo = PROVIDERS.find((p) => p.value === config.provider) ?? PROVIDERS[0]

  return (
    <>
      <button
        onClick={() => (open ? setOpen(false) : openWidget())}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
          open ? 'bg-brand-800 scale-95' : 'bg-brand-700 hover:bg-brand-800 hover:scale-105',
        )}
        aria-label="Assistente IA"
      >
        {open ? <X size={22} className="text-white" /> : <Sparkles size={22} className="text-white" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[540px] flex flex-col bg-white rounded-2xl shadow-2xl border border-surface-300/80 overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-brand-700 text-white shrink-0">
            {screen === 'settings' && (
              <button onClick={() => setScreen('chat')} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                <ChevronLeft size={16} />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Assistente SuperPão</p>
              {screen === 'chat' && (
                <p className="text-xs text-white/60 truncate">{currentProviderInfo.label} · {config.model || currentProviderInfo.models[0]}</p>
              )}
              {screen === 'settings' && (
                <p className="text-xs text-white/60">Configurações</p>
              )}
            </div>
            {screen === 'chat' && (
              <button
                onClick={() => { setDraftConfig(config); setScreen('settings') }}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Configurações"
              >
                <Settings size={15} />
              </button>
            )}
          </div>

          {/* Settings screen */}
          {screen === 'settings' && (
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-brand-500 mb-1.5">Provider</label>
                <select
                  className="input-base w-full"
                  value={draftConfig.provider}
                  onChange={(e) => {
                    const p = e.target.value as AiProvider
                    const info = PROVIDERS.find((x) => x.value === p)!
                    setDraftConfig((d) => ({ ...d, provider: p, model: info.models[0] }))
                  }}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-500 mb-1.5">API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder={providerInfo.placeholder}
                    className="input-base w-full pr-9"
                    value={draftConfig.apiKey}
                    onChange={(e) => setDraftConfig((d) => ({ ...d, apiKey: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-500 mb-1.5">Modelo</label>
                <select
                  className="input-base w-full"
                  value={draftConfig.model}
                  onChange={(e) => setDraftConfig((d) => ({ ...d, model: e.target.value }))}
                >
                  {providerInfo.models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={saveSettings}
                disabled={!draftConfig.apiKey}
                className="w-full py-2.5 rounded-xl bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </div>
          )}

          {/* Chat screen */}
          {screen === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {messages.map((msg, i) => (
                  <div key={i} className={cn('flex items-start gap-2', msg.role === 'user' && 'flex-row-reverse')}>
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

                {loading && (
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

              <div className="px-3 py-3 border-t border-surface-200 shrink-0">
                {!config.apiKey && (
                  <p className="text-[11px] text-amber-600 text-center mb-2">
                    Configure uma API key para começar →{' '}
                    <button onClick={() => setScreen('settings')} className="underline font-medium">Configurações</button>
                  </p>
                )}
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
                    {loading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
