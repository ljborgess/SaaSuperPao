import Link from 'next/link'
import {
  Wheat,
  ArrowRight,
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  Activity,
  Bot,
  Bell,
  Zap,
  Shield,
  Clock,
  ChevronDown,
  Factory,
  CheckCircle2,
} from 'lucide-react'
import { AnimateOnScroll } from '@/components/landing/animate-on-scroll'

/* ── Fictional sponsors ─────────────────────────────────────────────────── */
const SPONSORS = [
  { abbr: 'MF', name: 'Moinho Frade' },
  { abbr: 'TG', name: 'TrigoGold' },
  { abbr: 'BF', name: 'BrasíliaFarinha' },
  { abbr: 'LP', name: 'LaticPuro' },
  { abbr: 'AP', name: 'AgroPão' },
  { abbr: 'FN', name: 'FornoBrasil' },
  { abbr: 'GF', name: 'GrãoFino' },
  { abbr: 'EP', name: 'EmbalaPão' },
  { abbr: 'MD', name: 'MundoDoce' },
  { abbr: 'PP', name: 'PadeiroPRO' },
  { abbr: 'AS', name: 'ArtiSal' },
  { abbr: 'TF', name: 'TecnoForno' },
]

/* ── Mini bar chart ─────────────────────────────────────────────────────── */
function MiniBarChart() {
  const bars = [38, 55, 42, 70, 58, 82, 68, 90, 78, 100]
  return (
    <div className="flex items-end gap-1 h-10 w-full">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: `${h}%`, background: `rgba(196,167,125,${0.25 + h / 200})` }}
        />
      ))}
    </div>
  )
}

/* ── Dashboard preview ──────────────────────────────────────────────────── */
function DashboardPreview() {
  return (
    <div className="relative w-full max-w-[520px] mx-auto select-none">
      <div
        className="relative rounded-[28px] overflow-hidden border"
        style={{
          background: 'rgba(28,15,7,0.6)',
          backdropFilter: 'blur(24px)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 64px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-4 h-6 rounded-lg bg-white/[0.04] flex items-center justify-center">
            <span className="text-[10px] text-white/30 tracking-wide">superpao.app · Dashboard</span>
          </div>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold text-white/80">Visão Geral</p>
              <p className="text-[10px] text-white/30 mt-0.5">Segunda-feira, 23 de junho</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-400 tracking-wide">AO VIVO</span>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] text-white/40">Faturamento — 10 dias</span>
              <span className="text-[10px] font-semibold text-emerald-400">↑ 18.4%</span>
            </div>
            <MiniBarChart />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {[
              { label: 'Receita hoje', value: 'R$5.240', color: '#C4A77D' },
              { label: 'Pedidos', value: '164', color: 'rgba(255,255,255,0.85)' },
              { label: 'Em produção', value: '14', color: '#34d399' },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl p-3 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[9px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{m.label}</p>
                <p className="text-sm font-bold font-display" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Alert */}
          <div className="rounded-2xl px-4 py-3 border flex items-start gap-2.5" style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.15)' }}>
            <Bell size={11} className="shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
            <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,191,36,0.85)' }}>
              <span className="font-semibold">Estoque:</span> Farinha de trigo abaixo do mínimo — reposição sugerida.
            </p>
          </div>
        </div>
      </div>

      {/* Floating metric card */}
      <div
        className="absolute -top-6 -right-6 rounded-2xl p-4 border"
        style={{
          background: 'rgba(15,9,6,0.9)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <TrendingUp size={10} style={{ color: '#34d399' }} />
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Crescimento</span>
        </div>
        <p className="text-2xl font-bold font-display" style={{ color: '#34d399' }}>+32%</p>
        <p className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>vs. mês anterior</p>
      </div>

      {/* Floating production card */}
      <div
        className="absolute -bottom-4 -left-6 rounded-2xl p-3.5 border"
        style={{
          background: 'rgba(15,9,6,0.9)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          width: 168,
        }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Factory size={9} style={{ color: '#C4A77D' }} />
          <p className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Produções do dia</p>
        </div>
        <div className="space-y-1.5">
          {['Pão Francês × 300', 'Croissant × 80', 'Bolo Choc. × 6'].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(196,167,125,0.5)' }} />
              <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Bento feature card ─────────────────────────────────────────────────── */
function BentoCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  items,
  className = '',
  accent = false,
}: {
  icon: React.ElementType
  eyebrow: string
  title: string
  description: string
  items?: string[]
  className?: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-3xl p-8 flex flex-col gap-4 border transition-shadow duration-300 hover:shadow-lg ${className}`}
      style={{
        background: accent ? '#0F0906' : '#FFFFFF',
        borderColor: accent ? 'rgba(196,167,125,0.15)' : 'rgba(28,15,7,0.07)',
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background: accent ? 'rgba(196,167,125,0.12)' : 'rgba(196,167,125,0.10)',
        }}
      >
        <Icon size={20} style={{ color: '#C4A77D' }} />
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#C4A77D' }}>
          {eyebrow}
        </p>
        <h3
          className="font-display text-xl font-bold mb-2 leading-snug"
          style={{ color: accent ? '#FAF8F3' : '#1C0F07' }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: accent ? 'rgba(250,248,243,0.5)' : '#8C7B6E' }}>
          {description}
        </p>
      </div>

      {items && (
        <ul className="space-y-2 mt-auto">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: accent ? 'rgba(250,248,243,0.6)' : '#6B5C4E' }}>
              <CheckCircle2 size={13} style={{ color: '#C4A77D', flexShrink: 0 }} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#FAF8F3' }}>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12"
        style={{
          background: 'rgba(250,248,243,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(28,15,7,0.06)',
          height: 52,
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#C4A77D' }}>
            <Wheat size={14} style={{ color: '#0F0906' }} />
          </div>
          <span className="font-display text-base font-semibold" style={{ color: '#1C0F07' }}>SuperPão</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#8C7B6E' }}>
          {[
            { label: 'Funcionalidades', href: '#features' },
            { label: 'Como funciona', href: '#how' },
            { label: 'Módulos', href: '#features' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="transition-colors duration-200 hover:text-[#1C0F07]"
            >
              {label}
            </a>
          ))}
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl transition-all duration-200 hover:opacity-90"
          style={{ background: '#1C0F07', color: '#FAF8F3' }}
        >
          Acessar sistema
          <ArrowRight size={13} />
        </Link>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6" style={{ paddingTop: 52 }}>

        <div className="max-w-4xl mx-auto space-y-8">

          {/* Eyebrow */}
          <AnimateOnScroll>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full border"
              style={{ color: '#8C7B6E', borderColor: 'rgba(28,15,7,0.12)', background: 'rgba(28,15,7,0.03)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C4A77D' }} />
              Plataforma de gestão para padarias
            </div>
          </AnimateOnScroll>

          {/* Headline */}
          <AnimateOnScroll delay={60}>
            <h1
              className="font-display font-bold leading-[1.0] tracking-tight"
              style={{ fontSize: 'clamp(48px, 8vw, 96px)', color: '#1C0F07' }}
            >
              Gestão que pensa
              <br />
              <span style={{ color: '#C4A77D' }}>e cresce</span> com você.
            </h1>
          </AnimateOnScroll>

          {/* Subheadline */}
          <AnimateOnScroll delay={120}>
            <p
              className="text-xl leading-relaxed mx-auto max-w-2xl"
              style={{ color: '#8C7B6E' }}
            >
              Estoque, produção, compras e finanças integrados em uma só plataforma.
              Da farinha no depósito ao resultado do mês — tudo em tempo real.
            </p>
          </AnimateOnScroll>

          {/* CTAs */}
          <AnimateOnScroll delay={180}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 font-bold text-sm px-8 py-4 rounded-2xl transition-all duration-200 hover:opacity-90 hover:-translate-y-px"
                style={{
                  background: '#C4A77D',
                  color: '#0F0906',
                  boxShadow: '0 4px 24px rgba(196,167,125,0.35)',
                }}
              >
                <Zap size={15} />
                Começar agora — grátis
              </Link>
              <a
                href="#product"
                className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-8 py-4 rounded-2xl transition-all duration-200 border hover:border-[rgba(28,15,7,0.2)]"
                style={{ color: '#1C0F07', borderColor: 'rgba(28,15,7,0.12)', background: 'transparent' }}
              >
                Ver o sistema
                <ChevronDown size={14} />
              </a>
            </div>
          </AnimateOnScroll>

        </div>

        {/* Scroll cue */}
        <a
          href="#product"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity hover:opacity-70"
          style={{ color: '#C4A77D', opacity: 0.5 }}
        >
          <span className="text-[9px] tracking-[0.25em] uppercase font-semibold">Explorar</span>
          <ChevronDown size={14} className="animate-bounce" />
        </a>
      </section>

      {/* ── Sponsors ticker ──────────────────────────────────────────── */}
      <section
        className="py-10 border-y overflow-hidden"
        style={{ borderColor: 'rgba(28,15,7,0.07)', background: '#FFFFFF' }}
      >
        <p
          className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] mb-6"
          style={{ color: 'rgba(28,15,7,0.25)' }}
        >
          Parceiros e fornecedores de confiança
        </p>

        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
            style={{ background: 'linear-gradient(to right, #FFFFFF, transparent)' }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
            style={{ background: 'linear-gradient(to left, #FFFFFF, transparent)' }}
          />

          {/* Track — two copies for seamless loop */}
          <div className="marquee-track flex items-center gap-14 whitespace-nowrap w-max">
            {[...SPONSORS, ...SPONSORS].map((s, i) => (
              <div key={i} className="flex items-center gap-3 select-none">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black"
                  style={{
                    background: 'rgba(196,167,125,0.10)',
                    color: '#C4A77D',
                  }}
                >
                  {s.abbr}
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'rgba(28,15,7,0.28)' }}
                >
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product stage ─────────────────────────────────────────────── */}
      <section id="product" className="px-6 md:px-12 py-32" style={{ background: '#0F0906' }}>
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] mb-4"
                style={{ color: '#C4A77D' }}
              >
                Seu negócio em tempo real
              </p>
              <h2
                className="font-display font-bold leading-tight"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: '#FAF8F3' }}
              >
                Tudo que importa,
                <br />
                em uma só tela.
              </h2>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={80}>
            <DashboardPreview />
          </AnimateOnScroll>

          {/* Feature pills */}
          <AnimateOnScroll delay={160}>
            <div className="flex flex-wrap justify-center gap-3 mt-16">
              {[
                { icon: Activity, label: 'Dashboard ao vivo' },
                { icon: Shield, label: 'Alertas automáticos' },
                { icon: Clock, label: 'Disponível 24/7' },
                { icon: TrendingUp, label: 'Métricas de crescimento' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-full border"
                  style={{
                    color: 'rgba(250,248,243,0.55)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <Icon size={13} style={{ color: '#C4A77D' }} />
                  {label}
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Bento features ────────────────────────────────────────────── */}
      <section id="features" className="px-6 md:px-12 py-32" style={{ background: '#FAF8F3' }}>
        <div className="max-w-6xl mx-auto">

          <AnimateOnScroll>
            <div className="mb-14">
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] mb-3"
                style={{ color: '#C4A77D' }}
              >
                Funcionalidades
              </p>
              <h2
                className="font-display font-bold leading-tight max-w-2xl"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#1C0F07' }}
              >
                Cada módulo faz
                um trabalho preciso.
              </h2>
            </div>
          </AnimateOnScroll>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Row 1: wide + tall */}
            <AnimateOnScroll delay={0} className="md:col-span-2">
              <BentoCard
                icon={Package}
                eyebrow="Estoque"
                title="Nunca mais fique sem ingrediente."
                description="Alertas automáticos antes do produto acabar. Movimentações rastreadas em tempo real — entrada, saída, ajuste manual. Relatórios de consumo por período."
                items={['Alertas de mínimo configuráveis', 'Histórico completo de movimentações', 'Relatório de consumo por receita']}
                className="h-full"
              />
            </AnimateOnScroll>

            <AnimateOnScroll delay={60}>
              <BentoCard
                icon={Factory}
                eyebrow="Produção"
                title="Do planejamento ao forno."
                description="Fichas técnicas que baixam o estoque automaticamente quando uma ordem é concluída."
                className="h-full"
              />
            </AnimateOnScroll>

            {/* Row 2 */}
            <AnimateOnScroll delay={80}>
              <BentoCard
                icon={ShoppingCart}
                eyebrow="Compras"
                title="Pedidos e fornecedores unificados."
                description="Histórico de preços, avaliação de fornecedores e ordens de compra em um único fluxo."
                className="h-full"
              />
            </AnimateOnScroll>

            <AnimateOnScroll delay={100} className="md:col-span-2">
              <BentoCard
                icon={BarChart3}
                eyebrow="Dashboard"
                title="Dados que guiam decisões."
                description="Faturamento diário, produtos mais produzidos, custo por lote e margem de lucro. Tudo calculado automaticamente, sem planilha."
                items={['Faturamento e custo em tempo real', 'Margem por produto calculada', 'Comparativo mensal automático']}
                className="h-full"
              />
            </AnimateOnScroll>

            {/* Row 3: full width */}
            <AnimateOnScroll delay={120} className="md:col-span-3">
              <BentoCard
                icon={Bot}
                eyebrow="Assistente IA"
                title="Inteligência que entende sua padaria."
                description="Converse com seus dados. Pergunte sobre o estoque, peça um relatório, receba sugestões de produção baseadas no histórico. A IA conhece seu negócio e antecipa gargalos antes que aconteçam."
                items={[
                  'Chat com os dados do seu negócio',
                  'Sugestões proativas de reposição',
                  'Relatórios explicados em linguagem natural',
                  'Detecção de padrões e anomalias',
                ]}
                accent
                className="h-full"
              />
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── Metrics ───────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24 border-y" style={{ borderColor: 'rgba(28,15,7,0.07)', background: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x" style={{ divideColor: 'rgba(28,15,7,0.07)' }}>
              {[
                { value: '360°', label: 'Visão completa', desc: 'Todos os módulos integrados e conectados em tempo real' },
                { value: '24/7', label: 'Sempre disponível', desc: 'Acesse de qualquer dispositivo, qualquer hora' },
                { value: '100%', label: 'Controle total', desc: 'Da farinha no depósito à margem de lucro do mês' },
              ].map(({ value, label, desc }) => (
                <div key={label} className="flex flex-col items-center text-center py-12 px-8">
                  <p className="font-display text-5xl font-bold mb-2" style={{ color: '#C4A77D' }}>{value}</p>
                  <p className="font-semibold text-base mb-2" style={{ color: '#1C0F07' }}>{label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#8C7B6E' }}>{desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section id="how" className="px-6 md:px-12 py-32" style={{ background: '#FAF8F3' }}>
        <div className="max-w-5xl mx-auto">

          <AnimateOnScroll>
            <div className="text-center mb-20">
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] mb-3"
                style={{ color: '#C4A77D' }}
              >
                Como funciona
              </p>
              <h2
                className="font-display font-bold leading-tight"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#1C0F07' }}
              >
                Em menos de uma hora,
                <br />
                sua padaria está gerida.
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector */}
            <div
              className="hidden md:block absolute top-6 left-1/3 right-1/3 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(196,167,125,0.3), transparent)' }}
            />

            {[
              {
                n: '01',
                icon: Wheat,
                title: 'Configure sua padaria',
                desc: 'Cadastre produtos, ingredientes e fornecedores em minutos com nosso assistente de setup guiado.',
              },
              {
                n: '02',
                icon: Zap,
                title: 'Ative os módulos',
                desc: 'Estoque, produção e compras se conectam automaticamente. Zero integração manual.',
              },
              {
                n: '03',
                icon: TrendingUp,
                title: 'Tome decisões com dados',
                desc: 'O sistema alerta, sugere e entrega relatórios claros. Você decide com confiança.',
              },
            ].map(({ n, icon: Icon, title, desc }, i) => (
              <AnimateOnScroll key={n} delay={i * 80}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div
                      className="w-14 h-14 rounded-3xl flex items-center justify-center"
                      style={{ background: '#FFFFFF', border: '1px solid rgba(28,15,7,0.08)', boxShadow: '0 4px 16px rgba(28,15,7,0.06)' }}
                    >
                      <Icon size={20} style={{ color: '#C4A77D' }} />
                    </div>
                    <div
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                      style={{ background: '#1C0F07', color: '#FAF8F3' }}
                    >
                      {n.slice(1)}
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#1C0F07' }}>{title}</h3>
                  <p className="text-sm leading-relaxed max-w-[220px]" style={{ color: '#8C7B6E' }}>{desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-36 relative overflow-hidden" style={{ background: '#0F0906' }}>
        {/* Subtle radial */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(196,167,125,0.07) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <div className="space-y-8">
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'rgba(196,167,125,0.6)' }}
              >
                Pronto para começar?
              </p>

              <h2
                className="font-display font-bold leading-[1.05]"
                style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', color: '#FAF8F3' }}
              >
                Transforme sua padaria
                <br />
                <span style={{ color: '#C4A77D' }}>em uma empresa de verdade.</span>
              </h2>

              <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(250,248,243,0.45)' }}>
                Acesse o SuperPão e descubra como a tecnologia pode clarear seu negócio,
                reduzir desperdícios e fazer seus resultados crescerem.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2.5 font-bold text-base px-10 py-4 rounded-2xl transition-all duration-200 hover:opacity-90 hover:-translate-y-px"
                  style={{
                    background: '#C4A77D',
                    color: '#0F0906',
                    boxShadow: '0 8px 40px rgba(196,167,125,0.25)',
                  }}
                >
                  <Zap size={17} />
                  Entrar no sistema agora
                  <ArrowRight size={17} />
                </Link>
              </div>

              <p className="text-xs" style={{ color: 'rgba(250,248,243,0.2)' }}>
                Sem cartão de crédito · Setup em menos de 1 hora · Suporte incluído
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer
        className="px-6 md:px-12 py-10 border-t"
        style={{ background: '#FAF8F3', borderColor: 'rgba(28,15,7,0.07)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#C4A77D' }}>
              <Wheat size={13} style={{ color: '#0F0906' }} />
            </div>
            <span className="font-display text-base font-semibold" style={{ color: '#8C7B6E' }}>SuperPão</span>
          </div>

          <p className="text-xs" style={{ color: 'rgba(28,15,7,0.3)' }}>
            © {new Date().getFullYear()} SuperPão · Gestão inteligente para padarias modernas
          </p>

          <div className="flex gap-6 text-xs" style={{ color: 'rgba(28,15,7,0.35)' }}>
            {['Privacidade', 'Termos de Uso', 'Contato'].map((item) => (
              <span key={item} className="hover:text-[#1C0F07] cursor-pointer transition-colors">{item}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
