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
  Wheat,
  ArrowRight,
  Mail,
  Lock,
  Zap,
  Shield,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

function DarkInput({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  rightSlot,
  ...props
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
      <label htmlFor={id} className="block text-xs font-semibold text-brand-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative group">
        <Icon
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-600 group-focus-within:text-accent-gold transition-colors duration-200"
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className="w-full pl-11 pr-11 py-3.5 text-sm text-accent-cream bg-brand-900/60 border border-brand-700/50
                     rounded-2xl placeholder:text-brand-700 transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold/40
                     hover:border-brand-600/70"
          {...props}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 font-medium flex items-center gap-1">
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

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
    <div className="min-h-screen flex bg-[#070402]">

      {/* ── Left panel — branding ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(196,167,125,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(196,167,125,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(139,99,66,0.18)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#070402]" />

        {/* Orbs */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-brand-800/25 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-24 w-64 h-64 bg-accent-gold/8 rounded-full blur-[80px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-brand-600 rounded-2xl flex items-center justify-center shadow-[0_0_24px_rgba(196,167,125,0.4)]">
              <Wheat size={20} className="text-[#070402]" />
            </div>
            <span className="font-display text-xl font-semibold text-accent-cream">SuperPão</span>
          </div>

          {/* Main copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-brand-900/70 border border-accent-gold/20 text-accent-gold text-[11px] font-semibold uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full">
                <Zap size={10} />
                Plataforma de Gestão
              </div>
              <h1 className="font-display text-5xl xl:text-6xl font-bold text-accent-cream leading-[1.04] tracking-tight">
                Gestão que
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #C4A77D, #F0D5A0, #C4A77D)',
                  }}
                >
                  transforma
                </span>
                <br />
                resultados.
              </h1>
              <p className="text-brand-400 text-base leading-relaxed max-w-md">
                Controle estoque, produção, compras e finanças em uma plataforma
                unificada. Feita para padarias que querem crescer de verdade.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                { icon: BarChart3, text: 'Dashboard com dados em tempo real' },
                { icon: Shield, text: 'Alertas automáticos de reposição' },
                { icon: Zap, text: 'Ordens de produção integradas ao estoque' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-accent-gold/10 border border-accent-gold/20 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-accent-gold" />
                  </div>
                  <span className="text-sm text-brand-300">{text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-10 pt-2">
              {[
                { value: '360°', label: 'Visão completa' },
                { value: '24/7', label: 'Disponível sempre' },
                { value: '100%', label: 'Controle total' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-accent-gold font-display">{s.value}</p>
                  <p className="text-[11px] text-brand-600 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-brand-700">
            © {new Date().getFullYear()} SuperPão. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Subtle orb behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-800/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative w-full max-w-[420px] animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-accent-gold to-brand-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(196,167,125,0.35)]">
              <Wheat size={17} className="text-[#070402]" />
            </div>
            <span className="font-display text-xl font-semibold text-accent-cream">SuperPão</span>
          </div>

          {/* Form card */}
          <div className="bg-brand-900/50 backdrop-blur-2xl border border-brand-700/50 rounded-3xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

            {/* Header */}
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-accent-cream">
                Bem-vindo de volta
              </h2>
              <p className="text-sm text-brand-500 mt-1.5">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <DarkInput
                id="email"
                label="E-mail"
                type="email"
                placeholder="admin@superpao.com.br"
                error={errors.email?.message}
                icon={Mail}
                {...register('email')}
              />

              <DarkInput
                id="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                icon={Lock}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-brand-600 hover:text-brand-400 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                {...register('password')}
              />

              <div className="flex justify-end pt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand-500 hover:text-accent-gold transition-colors duration-200"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-accent-gold hover:bg-accent-wheat
                           text-brand-950 font-bold py-4 rounded-2xl text-sm transition-all duration-300
                           shadow-[0_0_30px_rgba(196,167,125,0.3)] hover:shadow-[0_0_50px_rgba(196,167,125,0.5)]
                           hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brand-950/30 border-t-brand-950 rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar no sistema
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-brand-700 mt-6">
            Acesso restrito a usuários cadastrados
          </p>
        </div>
      </div>
    </div>
  )
}
