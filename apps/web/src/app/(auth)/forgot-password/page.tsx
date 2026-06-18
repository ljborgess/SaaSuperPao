'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wheat, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch {
      toast.error('Erro ao enviar e-mail. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-6">
      <div className="w-full max-w-[420px] animate-slide-up">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
            <Wheat size={20} className="text-accent-cream" />
          </div>
          <span className="font-display text-xl font-semibold text-brand-900">SuperPão</span>
        </div>

        <div className="bg-white rounded-2xl border border-surface-300/80 shadow-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-brand-900 mb-2">E-mail enviado</h2>
              <p className="text-sm text-brand-400 leading-relaxed">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <Link href="/login" className="inline-block mt-6">
                <Button variant="outline">
                  <ArrowLeft size={16} />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <Mail size={22} className="text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-brand-900">Recuperar senha</h2>
                <p className="text-sm text-brand-400 mt-1">
                  Informe seu e-mail e enviaremos um link de recuperação
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="email"
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-700 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Voltar ao login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
