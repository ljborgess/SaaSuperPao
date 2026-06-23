'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wheat, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

function getTokenFromHash(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.hash.substring(1))
  return params.get('token')
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    const t = getTokenFromHash()
    if (!t) {
      router.replace('/forgot-password')
    } else {
      setToken(t)
    }
  }, [router])

  async function onSubmit(data: FormData) {
    try {
      await api.post('/api/auth/reset-password', { token, password: data.password })
      setDone(true)
    } catch {
      toast.error('Token inválido ou expirado. Solicite um novo link.')
    }
  }

  if (!token) return null

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
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-brand-900 mb-2">Senha redefinida</h2>
              <p className="text-sm text-brand-400 leading-relaxed">
                Sua senha foi atualizada com sucesso. Faça login com a nova senha.
              </p>
              <Link href="/login" className="inline-block mt-6">
                <Button>Ir para o login</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <Lock size={22} className="text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-brand-900">Nova senha</h2>
                <p className="text-sm text-brand-400 mt-1">
                  Escolha uma senha segura para sua conta
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  id="password"
                  label="Nova senha"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  id="confirmPassword"
                  label="Confirmar senha"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
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
