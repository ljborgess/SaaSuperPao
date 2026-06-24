import Link from 'next/link'
import {
  Wheat, ArrowRight, BarChart3, Package, ShoppingCart,
  TrendingUp, Activity, Bot, Bell, Zap, Shield, Clock,
  ChevronDown, Factory, CheckCircle2,
} from 'lucide-react'
import { AnimateOnScroll } from '@/components/landing/animate-on-scroll'

/* ── Sponsors ───────────────────────────────────────────────────────────── */
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
        <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(196,167,125,${0.2 + h / 200})` }} />
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
          background: 'rgba(28,15,7,0.7)',
          backdropFilter: 'blur(24px)',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 64px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.05]">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-4 h-6 rounded-lg bg-white/[0.04] flex items-center justify-center">
            <span className="text-[10px] tracking-wide" style={{ color: 'rgba(196,167,125,0.3)' }}>superpao.app · Dashboard</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'rgba(196,167,125,0.8)' }}>Visão Geral</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(196,167,125,0.35)' }}>Segunda-feira, 23 de junho</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-400 tracking-wide">AO VIVO</span>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px]" style={{ color: 'rgba(196,167,125,0.4)' }}>Faturamento — 10 dias</span>
              <span className="text-[10px] font-semibold text-emerald-400">↑ 18.4%</span>
            </div>
            <MiniBarChart />
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {[
              { label: 'Receita hoje', value: 'R$5.240', color: '#C4A77D' },
              { label: 'Pedidos', value: '164', color: 'rgba(196,167,125,0.85)' },
              { label: 'Em produção', value: '14', color: '#34d399' },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl p-3 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[9px] mb-1" style={{ color: 'rgba(196,167,125,0.4)' }}>{m.label}</p>
                <p className="text-sm font-bold font-display" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl px-4 py-3 border flex items-start gap-2.5" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.12)' }}>
            <Bell size={11} className="shrink-0 mt-0.5 text-yellow-400" />
            <p className="text-[10px] leading-relaxed text-yellow-400/80">
              <span className="font-semibold">Estoque:</span> Farinha de trigo abaixo do mínimo — reposição sugerida.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute -top-6 -right-6 rounded-2xl p-4 border" style={{ background: 'rgba(10,7,5,0.95)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.07)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <TrendingUp size={10} className="text-emerald-400" />
          <span className="text-[9px]" style={{ color: 'rgba(196,167,125,0.4)' }}>Crescimento</span>
        </div>
        <p className="text-2xl font-bold font-display text-emerald-400">+32%</p>
        <p className="text-[8px] mt-0.5" style={{ color: 'rgba(196,167,125,0.3)' }}>vs. mês anterior</p>
      </div>

      <div className="absolute -bottom-4 -left-6 rounded-2xl p-3.5 border" style={{ background: 'rgba(10,7,5,0.95)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.07)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: 168 }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Factory size={9} style={{ color: '#C4A77D' }} />
          <p className="text-[9px] font-semibold" style={{ color: 'rgba(196,167,125,0.5)' }}>Produções do dia</p>
        </div>
        <div className="space-y-1.5">
          {['Pão Francês × 300', 'Croissant × 80', 'Bolo Choc. × 6'].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(196,167,125,0.4)' }} />
              <span className="text-[8px]" style={{ color: 'rgba(196,167,125,0.35)' }}>{i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Bento card ─────────────────────────────────────────────────────────── */
function BentoCard({
  icon: Icon, eyebrow, title, description, items, className = '', highlight = false,
}: {
  icon: React.ElementType
  eyebrow: string
  title: string
  description: string
  items?: string[]
  className?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-3xl p-8 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.01] ${className}`}
      style={{
        background: highlight ? 'rgba(196,167,125,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${highlight ? 'rgba(196,167,125,0.18)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(196,167,125,0.1)' }}>
        <Icon size={20} style={{ color: '#C4A77D' }} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: 'rgba(196,167,125,0.6)' }}>{eyebrow}</p>
        <h3 className="font-display text-xl font-bold mb-2 leading-snug" style={{ color: '#C4A77D' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(196,167,125,0.55)' }}>{description}</p>
      </div>
      {items && (
        <ul className="space-y-2 mt-auto">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(196,167,125,0.6)' }}>
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
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#2C1508' }}>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12"
        style={{
          background: 'rgba(10,7,5,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          height: 52,
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#C4A77D' }}>
            <Wheat size={14} style={{ color: '#2C1508' }} />
          </div>
          <span className="font-display text-base font-semibold" style={{ color: '#C4A77D' }}>SuperPão</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm">
          {[
            { label: 'Funcionalidades', href: '#features' },
            { label: 'Como funciona', href: '#how' },
            { label: 'Módulos', href: '#features' },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="transition-colors duration-200" style={{ color: 'rgba(196,167,125,0.55)' }}>
              {label}
            </a>
          ))}
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl transition-all duration-200 hover:opacity-85"
          style={{ background: '#C4A77D', color: '#2C1508' }}
        >
          Acessar sistema
          <ArrowRight size={13} />
        </Link>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6" style={{ paddingTop: 52 }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(196,167,125,0.06) 0%, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto space-y-8">
          <AnimateOnScroll>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full"
              style={{ color: 'rgba(196,167,125,0.65)', border: '1px solid rgba(196,167,125,0.15)', background: 'rgba(196,167,125,0.05)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C4A77D' }} />
              Plataforma de gestão para padarias
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={60}>
            <h1
              className="font-display font-bold leading-[1.0] tracking-tight"
              style={{ fontSize: 'clamp(48px, 8vw, 96px)', color: '#C4A77D' }}
            >
              Gestão que pensa
              <br />
              <span style={{ color: 'rgba(196,167,125,0.45)' }}>e cresce</span> com você.
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll delay={120}>
            <p className="text-xl leading-relaxed mx-auto max-w-2xl" style={{ color: 'rgba(196,167,125,0.55)' }}>
              Estoque, produção, compras e finanças integrados em uma só plataforma.
              Da farinha no depósito ao resultado do mês — tudo em tempo real.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={180}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 font-bold text-sm px-8 py-4 rounded-2xl transition-all duration-200 hover:opacity-90 hover:-translate-y-px"
                style={{ background: '#C4A77D', color: '#2C1508', boxShadow: '0 4px 32px rgba(196,167,125,0.25)' }}
              >
                <Zap size={15} />
                Começar agora — grátis
              </Link>
              <a
                href="#product"
                className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-8 py-4 rounded-2xl transition-all duration-200"
                style={{ color: 'rgba(196,167,125,0.65)', border: '1px solid rgba(196,167,125,0.15)', background: 'transparent' }}
              >
                Ver o sistema
                <ChevronDown size={14} />
              </a>
            </div>
          </AnimateOnScroll>
        </div>

        <a href="#product" className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: 'rgba(196,167,125,0.35)' }}>
          <span className="text-[9px] tracking-[0.25em] uppercase font-semibold">Explorar</span>
          <ChevronDown size={14} className="animate-bounce" />
        </a>
      </section>

      {/* ── Sponsors ticker ──────────────────────────────────────────── */}
      <section
        className="py-10 border-y overflow-hidden"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
      >
        <p
          className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] mb-6"
          style={{ color: 'rgba(196,167,125,0.3)' }}
        >
          Parceiros e fornecedores de confiança
        </p>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10" style={{ background: 'linear-gradient(to right, #2C1508, transparent)' }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10" style={{ background: 'linear-gradient(to left, #2C1508, transparent)' }} />
          <div className="marquee-track flex items-center gap-14 whitespace-nowrap w-max">
            {[...SPONSORS, ...SPONSORS].map((s, i) => (
              <div key={i} className="flex items-center gap-3 select-none">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black" style={{ background: 'rgba(196,167,125,0.08)', color: 'rgba(196,167,125,0.6)' }}>
                  {s.abbr}
                </div>
                <span className="text-sm font-semibold" style={{ color: 'rgba(196,167,125,0.3)' }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product stage ─────────────────────────────────────────────── */}
      <section id="product" className="px-6 md:px-12 py-32" style={{ background: '#381B09' }}>
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: 'rgba(196,167,125,0.5)' }}>
                Seu negócio em tempo real
              </p>
              <h2 className="font-display font-bold leading-tight" style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: '#C4A77D' }}>
                Tudo que importa,
                <br />
                <span style={{ color: 'rgba(196,167,125,0.5)' }}>em uma só tela.</span>
              </h2>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={80}>
            <DashboardPreview />
          </AnimateOnScroll>
          <AnimateOnScroll delay={160}>
            <div className="flex flex-wrap justify-center gap-3 mt-16">
              {[
                { icon: Activity, label: 'Dashboard ao vivo' },
                { icon: Shield, label: 'Alertas automáticos' },
                { icon: Clock, label: 'Disponível 24/7' },
                { icon: TrendingUp, label: 'Métricas de crescimento' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-full border" style={{ color: 'rgba(196,167,125,0.5)', borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <Icon size={13} style={{ color: '#C4A77D' }} />
                  {label}
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Bento features ────────────────────────────────────────────── */}
      <section id="features" className="px-6 md:px-12 py-32" style={{ background: '#2C1508' }}>
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="mb-14">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: 'rgba(196,167,125,0.5)' }}>Funcionalidades</p>
              <h2 className="font-display font-bold leading-tight max-w-2xl" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#C4A77D' }}>
                Cada módulo faz
                um trabalho preciso.
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimateOnScroll delay={0} className="md:col-span-2">
              <BentoCard
                icon={Package} eyebrow="Estoque"
                title="Nunca mais fique sem ingrediente."
                description="Alertas automáticos antes do produto acabar. Movimentações rastreadas em tempo real — entrada, saída, ajuste manual."
                items={['Alertas de mínimo configuráveis', 'Histórico completo de movimentações', 'Relatório de consumo por receita']}
                className="h-full"
              />
            </AnimateOnScroll>
            <AnimateOnScroll delay={60}>
              <BentoCard icon={Factory} eyebrow="Produção" title="Do planejamento ao forno." description="Fichas técnicas que baixam o estoque automaticamente quando uma ordem é concluída." className="h-full" />
            </AnimateOnScroll>
            <AnimateOnScroll delay={80}>
              <BentoCard icon={ShoppingCart} eyebrow="Compras" title="Pedidos e fornecedores unificados." description="Histórico de preços, avaliação de fornecedores e ordens de compra em um único fluxo." className="h-full" />
            </AnimateOnScroll>
            <AnimateOnScroll delay={100} className="md:col-span-2">
              <BentoCard
                icon={BarChart3} eyebrow="Dashboard"
                title="Dados que guiam decisões."
                description="Faturamento diário, produtos mais produzidos, custo por lote e margem de lucro. Tudo calculado automaticamente."
                items={['Faturamento e custo em tempo real', 'Margem por produto calculada', 'Comparativo mensal automático']}
                className="h-full"
              />
            </AnimateOnScroll>
            <AnimateOnScroll delay={120} className="md:col-span-3">
              <BentoCard
                icon={Bot} eyebrow="Assistente IA"
                title="Inteligência que entende sua padaria."
                description="Converse com seus dados. Pergunte sobre o estoque, peça um relatório, receba sugestões de produção baseadas no histórico."
                items={['Chat com os dados do seu negócio', 'Sugestões proativas de reposição', 'Relatórios em linguagem natural', 'Detecção de padrões e anomalias']}
                highlight
                className="h-full"
              />
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── Metrics ───────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24 border-y" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x" style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}>
              {[
                { value: '360°', label: 'Visão completa', desc: 'Todos os módulos integrados e conectados em tempo real' },
                { value: '24/7', label: 'Sempre disponível', desc: 'Acesse de qualquer dispositivo, qualquer hora' },
                { value: '100%', label: 'Controle total', desc: 'Da farinha no depósito à margem de lucro do mês' },
              ].map(({ value, label, desc }) => (
                <div key={label} className="flex flex-col items-center text-center py-12 px-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="font-display text-5xl font-bold mb-2" style={{ color: '#C4A77D' }}>{value}</p>
                  <p className="font-semibold text-base mb-2" style={{ color: 'rgba(196,167,125,0.8)' }}>{label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(196,167,125,0.45)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section id="how" className="px-6 md:px-12 py-32" style={{ background: '#2C1508' }}>
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-20">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: 'rgba(196,167,125,0.5)' }}>Como funciona</p>
              <h2 className="font-display font-bold leading-tight" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#C4A77D' }}>
                Em menos de uma hora,
                <br />
                <span style={{ color: 'rgba(196,167,125,0.5)' }}>sua padaria está gerida.</span>
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { n: '01', icon: Wheat, title: 'Configure sua padaria', desc: 'Cadastre produtos, ingredientes e fornecedores em minutos com nosso assistente de setup guiado.' },
              { n: '02', icon: Zap, title: 'Ative os módulos', desc: 'Estoque, produção e compras se conectam automaticamente. Zero integração manual.' },
              { n: '03', icon: TrendingUp, title: 'Tome decisões com dados', desc: 'O sistema alerta, sugere e entrega relatórios claros. Você decide com confiança.' },
            ].map(({ n, icon: Icon, title, desc }, i) => (
              <AnimateOnScroll key={n} delay={i * 80}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-14 h-14 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(196,167,125,0.08)', border: '1px solid rgba(196,167,125,0.15)' }}>
                      <Icon size={20} style={{ color: '#C4A77D' }} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: '#C4A77D', color: '#2C1508' }}>
                      {n.slice(1)}
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#C4A77D' }}>{title}</h3>
                  <p className="text-sm leading-relaxed max-w-[220px]" style={{ color: 'rgba(196,167,125,0.5)' }}>{desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-36 relative overflow-hidden" style={{ background: '#381B09' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(196,167,125,0.06) 0%, transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <div className="space-y-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(196,167,125,0.4)' }}>
                Pronto para começar?
              </p>
              <h2 className="font-display font-bold leading-[1.05]" style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', color: '#C4A77D' }}>
                Transforme sua padaria
                <br />
                <span style={{ color: 'rgba(196,167,125,0.5)' }}>em uma empresa de verdade.</span>
              </h2>
              <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(196,167,125,0.45)' }}>
                Acesse o SuperPão e descubra como a tecnologia pode clarear seu negócio,
                reduzir desperdícios e fazer seus resultados crescerem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2.5 font-bold text-base px-10 py-4 rounded-2xl transition-all duration-200 hover:opacity-90 hover:-translate-y-px"
                  style={{ background: '#C4A77D', color: '#2C1508', boxShadow: '0 8px 40px rgba(196,167,125,0.2)' }}
                >
                  <Zap size={17} />
                  Entrar no sistema agora
                  <ArrowRight size={17} />
                </Link>
              </div>
              <p className="text-xs" style={{ color: 'rgba(196,167,125,0.25)' }}>
                Sem cartão de crédito · Setup em menos de 1 hora · Suporte incluído
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-10 border-t" style={{ background: '#2C1508', borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#C4A77D' }}>
              <Wheat size={13} style={{ color: '#2C1508' }} />
            </div>
            <span className="font-display text-base font-semibold" style={{ color: 'rgba(196,167,125,0.6)' }}>SuperPão</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(196,167,125,0.25)' }}>
            © {new Date().getFullYear()} SuperPão · Gestão inteligente para padarias modernas
          </p>
          <div className="flex gap-6 text-xs" style={{ color: 'rgba(196,167,125,0.3)' }}>
            {['Privacidade', 'Termos de Uso', 'Contato'].map((item) => (
              <span key={item} className="cursor-pointer hover:text-[#C4A77D] transition-colors">{item}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
