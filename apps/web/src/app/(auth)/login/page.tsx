'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { storeAuth } from '@/lib/auth'
import {
  Wheat, ArrowRight, Mail, Lock, Zap, Shield, BarChart3, Eye, EyeOff,
} from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

function DarkInput({
  id, label, type = 'text', placeholder, error, icon: Icon, rightSlot, ...props
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  error?: string
  icon: React.ElementType
  rightSlot?: React.ReactNode
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(196,167,125,0.6)' }}>
        {label}
      </label>
      <div className="relative">
        <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(196,167,125,0.5)' }} />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className="w-full pl-11 pr-11 py-3.5 text-sm rounded-2xl transition-all duration-200 focus:outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#C4A77D',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(196,167,125,0.4)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,167,125,0.08)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          {...props}
        />
        {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error && (
        <p className="text-xs font-medium flex items-center gap-1" style={{ color: '#f97316' }}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', data)
      storeAuth(res.data.accessToken, res.data.refreshToken, res.data.user)
      router.push('/dashboard')
    } catch {
      toast.error('Credenciais inválidas. Verifique e-mail e senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#2C1508' }}>

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden"
        style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(196,167,125,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 40% 50%, rgba(196,167,125,0.07) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 w-fit">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#C4A77D' }}>
              <Wheat size={20} style={{ color: '#2C1508' }} />
            </div>
            <span className="font-display text-xl font-semibold" style={{ color: '#C4A77D' }}>SuperPão</span>
          </Link>

          {/* Copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full"
                style={{ color: 'rgba(196,167,125,0.7)', border: '1px solid rgba(196,167,125,0.2)', background: 'rgba(196,167,125,0.05)' }}
              >
                <Zap size={10} />
                Plataforma de Gestão
              </div>

              <h1
                className="font-display font-bold leading-[1.04] tracking-tight"
                style={{ fontSize: 'clamp(36px, 4vw, 56px)', color: '#C4A77D' }}
              >
                Gestão que
                <br />
                <span style={{ color: 'rgba(196,167,125,0.55)' }}>transforma</span>
                <br />
                resultados.
              </h1>

              <p className="text-base leading-relaxed max-w-md" style={{ color: 'rgba(196,167,125,0.55)' }}>
                Controle estoque, produção, compras e finanças em uma plataforma
                unificada. Feita para padarias que querem crescer de verdade.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: BarChart3, text: 'Dashboard com dados em tempo real' },
                { icon: Shield, text: 'Alertas automáticos de reposição' },
                { icon: Zap, text: 'Ordens de produção integradas ao estoque' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(196,167,125,0.08)', border: '1px solid rgba(196,167,125,0.15)' }}
                  >
                    <Icon size={13} style={{ color: '#C4A77D' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'rgba(196,167,125,0.6)' }}>{text}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-10 pt-2">
              {[
                { value: '360°', label: 'Visão completa' },
                { value: '24/7', label: 'Disponível sempre' },
                { value: '100%', label: 'Controle total' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold font-display" style={{ color: '#C4A77D' }}>{s.value}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(196,167,125,0.4)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs" style={{ color: 'rgba(196,167,125,0.3)' }}>
            © {new Date().getFullYear()} SuperPão. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] animate-fade-up">

          {/* Mobile logo */}
          <Link href="/" className="group lg:hidden flex items-center gap-3 mb-10 w-fit">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#C4A77D' }}>
              <Wheat size={17} style={{ color: '#2C1508' }} />
            </div>
            <span className="font-display text-xl font-semibold" style={{ color: '#C4A77D' }}>SuperPão</span>
          </Link>

          {/* Form card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold" style={{ color: '#C4A77D' }}>
                Bem-vindo de volta
              </h2>
              <p className="text-sm mt-1.5" style={{ color: 'rgba(196,167,125,0.55)' }}>
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <DarkInput
                id="email" label="E-mail" type="email"
                placeholder="admin@superpao.com.br"
                error={errors.email?.message} icon={Mail}
                {...register('email')}
              />
              <DarkInput
                id="password" label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message} icon={Lock}
                rightSlot={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ color: 'rgba(196,167,125,0.5)' }}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                {...register('password')}
              />

              <div className="flex justify-end pt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium transition-colors duration-200"
                  style={{ color: 'rgba(196,167,125,0.55)' }}
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 font-bold py-4 rounded-2xl text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-2"
                style={{
                  background: '#C4A77D',
                  color: '#2C1508',
                  boxShadow: '0 4px 24px rgba(196,167,125,0.25)',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(10,7,5,0.25)', borderTopColor: '#2C1508' }} />
                    Entrando...
                  </>
                ) : (
                  <>Entrar no sistema <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] mt-6" style={{ color: 'rgba(196,167,125,0.3)' }}>
            Acesso restrito a usuários cadastrados
          </p>
        </div>
      </div>
    </div>
  )
}
