import Link from 'next/link'
import {
  Wheat,
  ArrowRight,
  BarChart3,
  Package,
  ShoppingCart,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  Activity,
  Bot,
  Bell,
  Zap,
  Star,
  Shield,
  Clock,
} from 'lucide-react'
import { AnimateOnScroll } from '@/components/landing/animate-on-scroll'

/* ── Mini bar chart (SVG-free, pure CSS) ─────────────────────────────────── */
function MiniBarChart() {
  const bars = [38, 55, 42, 70, 58, 82, 68, 90, 78, 100]
  return (
    <div className="flex items-end gap-1.5 h-12 w-full">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-gradient-to-t from-accent-gold/60 to-accent-gold/20 border-t border-accent-gold/40"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}

/* ── Hero visual — floating dashboard ────────────────────────────────────── */
function DashboardPreview() {
  return (
    <div className="relative select-none">
      {/* Main ambient glow */}
      <div className="absolute -inset-16 bg-accent-gold/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -inset-8 bg-brand-700/15 rounded-full blur-[60px] pointer-events-none" />

      {/* Main card */}
      <div
        className="relative w-[400px] bg-brand-900/70 backdrop-blur-2xl border border-brand-700/50 rounded-3xl p-6
                   shadow-[0_40px_100px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)]
                   animate-pulse-glow"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-gold to-brand-600 rounded-xl flex items-center justify-center shadow-md">
              <Activity size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-accent-cream">Visão Geral · SuperPão</p>
              <p className="text-[10px] text-brand-400">Atualizado agora</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-400 tracking-wide">AO VIVO</span>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-brand-400 font-medium">Faturamento — últimos 10 dias</span>
            <span className="text-[10px] font-bold text-emerald-400">↑ 18.4%</span>
          </div>
          <MiniBarChart />
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { label: 'Receita hoje', value: 'R$5.240', color: 'text-accent-gold' },
            { label: 'Pedidos', value: '164', color: 'text-accent-cream' },
            { label: 'Produção', value: '14', color: 'text-emerald-400' },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-brand-950/70 rounded-2xl p-2.5 border border-brand-800/60"
            >
              <p className="text-[9px] text-brand-500 mb-1">{m.label}</p>
              <p className={`text-sm font-bold font-display ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Alert */}
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl px-3.5 py-2.5 flex items-start gap-2.5">
          <Bell size={12} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-300 leading-relaxed">
            <span className="font-semibold">Alerta automático:</span> Farinha de trigo abaixo do
            mínimo — pedido sugerido para Fornecedor A.
          </p>
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent animate-scan" />
        </div>
      </div>

      {/* Floating top-right card */}
      <div
        className="absolute -top-8 -right-14 w-36 bg-brand-900/90 backdrop-blur-xl border border-brand-700/50
                   rounded-2xl p-3.5 shadow-xl animate-float"
      >
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-5 h-5 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp size={10} className="text-emerald-400" />
          </div>
          <span className="text-[9px] text-brand-400 font-medium">Crescimento</span>
        </div>
        <p className="text-2xl font-bold text-emerald-400 font-display">+32%</p>
        <p className="text-[8px] text-brand-500 mt-0.5">vs. mês anterior</p>
      </div>

      {/* Floating bottom-left card */}
      <div
        className="absolute -bottom-8 -left-12 w-44 bg-brand-900/90 backdrop-blur-xl border border-brand-700/50
                   rounded-2xl p-3.5 shadow-xl animate-float-slow"
      >
        <div className="flex items-center gap-1.5 mb-2.5">
          <Bell size={10} className="text-accent-gold" />
          <p className="text-[9px] font-semibold text-brand-300">Próximas produções</p>
        </div>
        <div className="space-y-1.5">
          {['Pão Francês × 300 un.', 'Croissant × 80 un.', 'Bolo Choc. × 6'].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-accent-gold/60" />
              <span className="text-[8px] text-brand-400">{i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating top-left notification */}
      <div
        className="absolute top-16 -left-16 w-32 bg-brand-900/90 backdrop-blur-xl border border-brand-700/50
                   rounded-2xl p-3 shadow-xl animate-float"
        style={{ animationDelay: '2s' }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={9} className="text-accent-gold" />
          <span className="text-[8px] text-accent-gold font-bold">Sistema online</span>
        </div>
        <p className="text-[8px] text-brand-400 leading-relaxed">Todas as áreas integradas</p>
        <div className="mt-1.5 h-0.5 bg-brand-800 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-accent-gold/50 to-accent-gold rounded-full" />
        </div>
      </div>
    </div>
  )
}

/* ── Feature card ────────────────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  items,
  accentColor,
  delay,
}: {
  icon: React.ElementType
  title: string
  description: string
  items: string[]
  accentColor: string
  delay: number
}) {
  return (
    <AnimateOnScroll delay={delay}>
      <div
        className="group relative h-full bg-brand-900/40 backdrop-blur-xl border border-brand-800/60
                   hover:border-brand-700 rounded-3xl p-7 transition-all duration-500
                   hover:-translate-y-2 hover:shadow-[0_32px_80px_rgba(0,0,0,0.5)]
                   overflow-hidden"
      >
        {/* Subtle glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                     bg-gradient-to-b from-brand-800/20 to-transparent rounded-3xl"
        />

        {/* Corner accent */}
        <div
          className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] opacity-0 group-hover:opacity-100
                      transition-opacity duration-500 ${accentColor}`}
        />

        <div
          className="relative w-12 h-12 rounded-2xl bg-brand-800/80 border border-brand-700/60
                     flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
        >
          <Icon size={22} className="text-accent-gold" />
        </div>

        <h3 className="relative font-display text-lg font-semibold text-accent-cream mb-2">
          {title}
        </h3>
        <p className="relative text-sm text-brand-400 leading-relaxed mb-5">{description}</p>

        <ul className="relative space-y-2.5">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-brand-300">
              <div
                className="w-4 h-4 rounded-full bg-accent-gold/15 border border-accent-gold/30
                           flex items-center justify-center shrink-0"
              >
                <CheckCircle2 size={9} className="text-accent-gold" />
              </div>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </AnimateOnScroll>
  )
}

/* ── Process step ────────────────────────────────────────────────────────── */
function StepCard({
  n,
  icon: Icon,
  title,
  desc,
  delay,
}: {
  n: number
  icon: React.ElementType
  title: string
  desc: string
  delay: number
}) {
  return (
    <AnimateOnScroll delay={delay}>
      <div className="flex flex-col items-center text-center px-4">
        <div
          className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900
                     border border-accent-gold/30 flex items-center justify-center mb-5
                     shadow-[0_0_40px_rgba(196,167,125,0.15)]"
        >
          <Icon size={22} className="text-accent-gold" />
          <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-accent-gold rounded-full flex items-center justify-center shadow-md">
            <span className="text-[10px] font-black text-brand-950">{n}</span>
          </div>
        </div>
        <h3 className="font-display text-lg font-semibold text-accent-cream mb-2">{title}</h3>
        <p className="text-sm text-brand-400 leading-relaxed max-w-[220px]">{desc}</p>
      </div>
    </AnimateOnScroll>
  )
}

/* ── Ticker item ─────────────────────────────────────────────────────────── */
function TickerItems() {
  const items = [
    { icon: TrendingUp, text: 'Controle total de estoque' },
    { icon: BarChart3, text: 'Dashboard em tempo real' },
    { icon: Bot, text: 'Assistente inteligente de gestão' },
    { icon: Shield, text: 'Dados 100% seguros' },
    { icon: Zap, text: 'Alertas automáticos de reposição' },
    { icon: Clock, text: 'Disponível 24 horas por dia' },
    { icon: Star, text: 'Gestão financeira integrada' },
    { icon: Activity, text: 'Ordens de produção inteligentes' },
  ]
  return (
    <>
      {[...items, ...items].map(({ icon: Icon, text }, i) => (
        <div key={i} className="flex items-center gap-3 shrink-0 px-8">
          <Icon size={14} className="text-accent-gold shrink-0" />
          <span className="text-sm font-medium text-brand-300 whitespace-nowrap">{text}</span>
          <div className="w-1 h-1 rounded-full bg-brand-700 ml-4" />
        </div>
      ))}
    </>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070402] overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-xl bg-[#070402]/80 border-b border-brand-800/40">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 bg-gradient-to-br from-accent-gold to-brand-600 rounded-xl
                       flex items-center justify-center shadow-[0_0_20px_rgba(196,167,125,0.4)]"
          >
            <Wheat size={17} className="text-[#070402]" />
          </div>
          <span className="font-display text-lg font-semibold text-accent-cream tracking-tight">
            SuperPão
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-brand-400">
          {['Funcionalidades', 'Como funciona', 'Módulos'].map((item) => (
            <a
              key={item}
              href="#features"
              className="hover:text-accent-cream transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-accent-gold hover:bg-accent-wheat text-brand-950
                     text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200
                     shadow-[0_0_20px_rgba(196,167,125,0.3)] hover:shadow-[0_0_30px_rgba(196,167,125,0.5)]
                     hover:-translate-y-px"
        >
          Acessar sistema
          <ArrowRight size={14} />
        </Link>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#070402_80%)] pointer-events-none" />

        {/* Orbs */}
        <div className="absolute top-1/4 left-[-10%] w-[600px] h-[600px] bg-brand-800/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-[-5%] w-[500px] h-[500px] bg-accent-gold/6 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-700/8 rounded-full blur-[160px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full px-6 md:px-12 grid lg:grid-cols-2 gap-20 items-center py-24">

          {/* Left — text */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="animate-fade-up inline-flex items-center gap-2.5 bg-brand-900/80 border border-accent-gold/30 text-accent-wheat text-xs font-medium px-4 py-2 rounded-full backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
              <Sparkles size={11} className="text-accent-gold" />
              Gestão completa para padarias modernas
            </div>

            {/* Headline */}
            <div className="animate-fade-up delay-100 space-y-3">
              <h1 className="font-display text-5xl md:text-6xl xl:text-[72px] font-bold text-accent-cream leading-[1.02] tracking-tight">
                Gestão que
                <br />
                <span
                  className="shimmer-text text-transparent bg-clip-text"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, #C4A77D, #F0D5A0, #C4A77D, #8B6342, #C4A77D)',
                  }}
                >
                  pensa e cresce
                </span>
                <br />
                com você.
              </h1>
              <p className="text-brand-400 text-lg leading-relaxed max-w-[500px]">
                A plataforma completa para padarias modernas — estoque, produção, compras e finanças integrados em um único lugar. Do forno ao resultado financeiro.
              </p>
            </div>

            {/* CTAs */}
            <div className="animate-fade-up delay-200 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2.5 bg-accent-gold hover:bg-accent-wheat
                           text-brand-950 font-bold px-8 py-4 rounded-2xl transition-all duration-300
                           shadow-[0_0_30px_rgba(196,167,125,0.35)] hover:shadow-[0_0_50px_rgba(196,167,125,0.55)]
                           hover:-translate-y-1 text-sm"
              >
                <Zap size={16} />
                Começar agora — grátis
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-brand-900/60 hover:bg-brand-800/60
                           text-brand-300 hover:text-accent-cream font-semibold px-8 py-4 rounded-2xl
                           border border-brand-700/50 hover:border-brand-600/70 transition-all duration-300 text-sm"
              >
                Ver funcionalidades
                <ChevronDown size={15} />
              </a>
            </div>

            {/* Stats */}
            <div className="animate-fade-up delay-300 flex items-center gap-10 pt-2">
              {[
                { value: '360°', label: 'Visão do negócio' },
                { value: '24/7', label: 'Disponível sempre' },
                { value: 'BI+', label: 'Análise de dados' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-accent-gold font-display">{s.value}</p>
                  <p className="text-[11px] text-brand-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dashboard */}
          <div className="animate-fade-up delay-300 flex justify-center lg:justify-end">
            <DashboardPreview />
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#ticker"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
                     text-brand-600 hover:text-brand-400 transition-colors animate-bounce"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">explorar</span>
          <ChevronDown size={16} />
        </a>
      </section>

      {/* ── Ticker ─────────────────────────────────────────────────────── */}
      <div id="ticker" className="relative border-y border-brand-800/50 bg-brand-950/60 backdrop-blur-md py-4 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#070402] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#070402] to-transparent z-10" />
        <div className="flex animate-ticker">
          <TickerItems />
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-brand-900/60 border border-brand-800/60 text-accent-gold text-[11px] font-semibold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-5">
                <Sparkles size={11} />
                Funcionalidades
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-accent-cream mb-4 leading-tight">
                Tudo que sua padaria
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-brand-400">
                  precisa para crescer
                </span>
              </h2>
              <p className="text-brand-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Módulos completos, conectados entre si e automatizados,
                para que você foque no que realmente importa: crescer.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={Package}
              title="Controle de Estoque"
              description="Alertas automáticos antes do produto acabar. Nunca mais perca uma venda por falta de ingrediente."
              items={[
                'Alertas de estoque mínimo',
                'Movimentações rastreadas',
                'Relatórios em tempo real',
                'Previsão de demanda automatizada',
              ]}
              accentColor="bg-gradient-to-bl from-brand-700/10 to-transparent"
              delay={0}
            />
            <FeatureCard
              icon={ShoppingCart}
              title="Gestão de Compras"
              description="Pedidos, fornecedores e histórico unificados. Do pedido ao recebimento em um único fluxo digital."
              items={[
                'Cadastro de fornecedores',
                'Ordens de compra automatizadas',
                'Histórico completo de NF-e',
                'Avaliação de fornecedores',
              ]}
              accentColor="bg-gradient-to-bl from-brand-700/10 to-transparent"
              delay={80}
            />
            <FeatureCard
              icon={BarChart3}
              title="Ordens de Produção"
              description="Planeje, produza e rastreie cada lote com precisão cirúrgica. Fichas técnicas que calculam tudo automaticamente."
              items={[
                'Fichas técnicas completas',
                'Consumo automático de estoque',
                'Status por etapa de produção',
                'Custo por lote calculado',
              ]}
              accentColor="bg-gradient-to-bl from-brand-700/10 to-transparent"
              delay={160}
            />
            <FeatureCard
              icon={Bot}
              title="Assistente de Gestão"
              description="Análise de tendências, detecção de gargalos e recomendações de ação para o seu negócio."
              items={[
                'Chat com dados da sua padaria',
                'Alertas proativos automáticos',
                'Sugestões de otimização',
                'Relatórios explicados em texto',
              ]}
              accentColor="bg-gradient-to-bl from-accent-gold/5 to-transparent"
              delay={240}
            />
          </div>
        </div>
      </section>

      {/* ── Metrics strip ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-brand-950/40">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="grid md:grid-cols-3 gap-px bg-brand-800/30 rounded-3xl overflow-hidden border border-brand-800/40">
              {[
                {
                  value: '360°',
                  label: 'Visão completa',
                  desc: 'Todos os módulos integrados e conectados em tempo real',
                  icon: Activity,
                },
                {
                  value: '24/7',
                  label: 'Sempre disponível',
                  desc: 'Acesse de qualquer dispositivo, em qualquer hora do dia',
                  icon: Clock,
                },
                {
                  value: '100%',
                  label: 'Controle total',
                  desc: 'Da farinha no estoque à margem de lucro do mês',
                  icon: Shield,
                },
              ].map(({ value, label, desc, icon: Icon }, i) => (
                <div
                  key={i}
                  className="group bg-brand-950/60 px-10 py-14 text-center hover:bg-brand-900/40 transition-colors duration-300"
                >
                  <div className="w-10 h-10 bg-accent-gold/10 border border-accent-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-gold/20 transition-colors">
                    <Icon size={18} className="text-accent-gold" />
                  </div>
                  <p className="font-display text-5xl font-bold text-accent-gold mb-2">{value}</p>
                  <p className="text-accent-cream font-semibold mb-2">{label}</p>
                  <p className="text-brand-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,99,66,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <AnimateOnScroll>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-brand-900/60 border border-brand-800/60 text-accent-gold text-[11px] font-semibold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-5">
                <Zap size={11} />
                Como funciona
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-accent-cream mb-4">
                Simples de usar.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-brand-400">
                  Poderoso por dentro.
                </span>
              </h2>
              <p className="text-brand-400 text-lg max-w-xl mx-auto leading-relaxed">
                Em menos de uma hora sua padaria já está operando com gestão inteligente.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="relative grid md:grid-cols-3 gap-12">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent" />

            <StepCard
              n={1}
              icon={Wheat}
              title="Cadastre sua padaria"
              desc="Configure produtos, ingredientes, fornecedores e usuários em minutos com nosso assistente de setup."
              delay={0}
            />
            <StepCard
              n={2}
              icon={BarChart3}
              title="Ative os módulos"
              desc="Estoque, produção, compras e finanças se conectam automaticamente. Nenhuma integração manual necessária."
              delay={100}
            />
            <StepCard
              n={3}
              icon={TrendingUp}
              title="Decole com dados"
              desc="Tome decisões baseadas em números reais. O sistema sugere ações, alerta sobre gargalos e entrega relatórios claros."
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* ── Testimonial belt ───────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-brand-950/40 border-y border-brand-800/40">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-brand-900/60 border border-brand-800/60 text-accent-gold text-[11px] font-semibold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-5">
                <Star size={11} />
                Parcerias estratégicas
              </div>
              <h2 className="font-display text-3xl font-bold text-accent-cream mb-3">
                Construído para liderar o mercado
              </h2>
              <p className="text-brand-400 text-base max-w-lg mx-auto">
                Parcerias e integrações em desenvolvimento para ampliar ainda mais o ecossistema SuperPão.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-2xl mx-auto mb-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/2] rounded-2xl border border-dashed border-brand-800/70
                             bg-brand-900/30 flex items-center justify-center
                             hover:border-brand-700/70 transition-colors"
                >
                  <span className="text-brand-700 text-lg font-bold">+</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-brand-900/60 border border-accent-gold/20 text-brand-400 text-sm px-6 py-3 rounded-full">
                <Sparkles size={14} className="text-accent-gold" />
                Integrações e parcerias chegando em breve
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────── */}
      <section className="relative py-36 px-6 md:px-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 via-[#070402] to-brand-950/80" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-accent-gold/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full">
                <Zap size={10} />
                Pronto para começar?
              </div>

              <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-accent-cream leading-[1.05]">
                Transforme sua padaria
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-accent-wheat to-brand-400">
                  em uma empresa de verdade.
                </span>
              </h2>

              <p className="text-brand-400 text-lg max-w-xl mx-auto leading-relaxed">
                Acesse o SuperPão agora e descubra como a tecnologia pode multiplicar
                seus resultados, reduzir desperdícios e dar clareza ao seu negócio.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2.5 bg-accent-gold hover:bg-accent-wheat
                             text-brand-950 font-bold px-10 py-4 rounded-2xl text-base transition-all duration-300
                             shadow-[0_0_40px_rgba(196,167,125,0.4)] hover:shadow-[0_0_60px_rgba(196,167,125,0.6)]
                             hover:-translate-y-1"
                >
                  <Zap size={17} />
                  Entrar no sistema agora
                  <ArrowRight size={17} />
                </Link>
              </div>

              <p className="text-brand-600 text-xs">
                Sem cartão de crédito · Setup em menos de 1 hora · Suporte incluído
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-brand-800/40 px-6 md:px-12 py-10 bg-[#050300]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 bg-gradient-to-br from-accent-gold to-brand-700 rounded-xl
                         flex items-center justify-center shadow-[0_0_16px_rgba(196,167,125,0.3)]"
            >
              <Wheat size={15} className="text-[#050300]" />
            </div>
            <span className="font-display text-base font-semibold text-brand-500">SuperPão</span>
          </div>

          <p className="text-[11px] text-brand-700">
            © {new Date().getFullYear()} SuperPão · Gestão inteligente para padarias modernas
          </p>

          <div className="flex gap-6 text-[11px] text-brand-700">
            <span className="hover:text-brand-500 cursor-pointer transition-colors">Privacidade</span>
            <span className="hover:text-brand-500 cursor-pointer transition-colors">Termos de Uso</span>
            <span className="hover:text-brand-500 cursor-pointer transition-colors">Contato</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
