'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { storeAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wheat, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-950 to-brand-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
              <Wheat size={22} className="text-accent-cream" />
            </div>
            <span className="font-display text-2xl font-semibold text-accent-cream">SuperPão</span>
          </div>

          <div className="space-y-6">
            <h1 className="font-display text-4xl xl:text-5xl font-semibold text-accent-cream leading-tight">
              Gestão inteligente<br />para sua padaria
            </h1>
            <p className="text-brand-400 text-base max-w-md leading-relaxed">
              Controle produtos, estoque, compras e produção em uma plataforma
              unificada, feita para operações de alto desempenho.
            </p>
            <div className="flex gap-8 pt-4">
              {[
                { value: '360°', label: 'Visão completa' },
                { value: '24/7', label: 'Disponibilidade' },
                { value: '100%', label: 'Controle total' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-accent-gold">{stat.value}</p>
                  <p className="text-xs text-brand-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-brand-600">
            © {new Date().getFullYear()} SuperPão. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-surface-50 px-6 py-12">
        <div className="w-full max-w-[420px] animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
              <Wheat size={20} className="text-accent-cream" />
            </div>
            <span className="font-display text-xl font-semibold text-brand-900">SuperPão</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900">Bem-vindo de volta</h2>
            <p className="text-sm text-brand-400 mt-1.5">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              label="E-mail"
              type="email"
              placeholder="admin@superpao.com.br"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              label="Senha"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11" size="lg">
              {loading ? 'Entrando...' : (
                <>
                  Entrar no sistema
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
