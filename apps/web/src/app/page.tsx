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
} from 'lucide-react'
import { AnimateOnScroll } from '@/components/landing/animate-on-scroll'

/* ── Phone mockup ────────────────────────────────────────────────────────── */
function PhoneMockup() {
  const stockItems = [
    { name: 'Farinha', pct: 18 },
    { name: 'Manteiga', pct: 35 },
    { name: 'Ovos', pct: 22 },
  ]
  return (
    <div className="relative animate-float">
      {/* Glow */}
      <div className="absolute -inset-10 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -inset-6 bg-accent-gold/10 rounded-full blur-2xl pointer-events-none" />

      {/* Phone frame */}
      <div className="relative w-[252px] h-[508px] bg-gradient-to-b from-brand-700 to-brand-900 rounded-[44px] border border-brand-600/60 shadow-[0_32px_64px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]">
        {/* Dynamic island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[72px] h-[22px] bg-black rounded-full z-10" />

        {/* Side buttons */}
        <div className="absolute left-[-3px] top-28 w-[3px] h-8 bg-brand-600 rounded-l-sm" />
        <div className="absolute left-[-3px] top-40 w-[3px] h-12 bg-brand-600 rounded-l-sm" />
        <div className="absolute right-[-3px] top-32 w-[3px] h-14 bg-brand-600 rounded-r-sm" />

        {/* Screen */}
        <div className="absolute inset-[10px] top-12 bottom-7 bg-surface-50 rounded-[34px] overflow-hidden">
          {/* App topbar */}
          <div className="bg-brand-800 px-3.5 py-2.5 flex items-center justify-between">
            <Wheat size={13} className="text-accent-cream" />
            <span className="text-[10px] font-bold text-accent-cream tracking-wide">SuperPão</span>
            <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
              <span className="text-[7px] font-bold text-white">A</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 py-2.5 space-y-2.5 overflow-hidden">
            <div>
              <p className="text-[10px] font-semibold text-brand-700">Bom dia, Admin ☀️</p>
              <p className="text-[8px] text-brand-400">quarta-feira, 18 jun</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-white rounded-2xl p-2 shadow-soft border border-surface-200">
                <p className="text-[7px] text-brand-400 mb-0.5">Vendas hoje</p>
                <p className="text-[14px] font-bold text-brand-900">R$1.240</p>
                <p className="text-[7px] text-emerald-500 font-medium">↑ 12% vs ontem</p>
              </div>
              <div className="bg-white rounded-2xl p-2 shadow-soft border border-surface-200">
                <p className="text-[7px] text-brand-400 mb-0.5">Produções</p>
                <p className="text-[14px] font-bold text-brand-900">8</p>
                <p className="text-[7px] text-brand-400">em aberto hoje</p>
              </div>
            </div>

            {/* Stock alert card */}
            <div className="bg-white rounded-2xl p-2.5 shadow-soft border border-surface-200">
              <div className="flex items-center gap-1 mb-2">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                <p className="text-[8px] font-semibold text-brand-700">Estoque crítico</p>
              </div>
              <div className="space-y-1.5">
                {stockItems.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[7px] text-brand-600">{item.name}</span>
                      <span className="text-[7px] font-medium text-red-400">{item.pct}%</span>
                    </div>
                    <div className="h-1 bg-surface-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent items */}
            <div className="bg-white rounded-2xl p-2.5 shadow-soft border border-surface-200">
              <p className="text-[8px] font-semibold text-brand-700 mb-1.5">Últimas produções</p>
              {['Pão Francês × 200', 'Croissant × 60', 'Bolo Choc. × 5'].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 py-1 border-b border-surface-100 last:border-0"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  <span className="text-[7px] text-brand-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-brand-500/50 rounded-full" />
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
  delay,
}: {
  icon: React.ElementType
  title: string
  description: string
  items: string[]
  delay: number
}) {
  return (
    <AnimateOnScroll delay={delay}>
      <div className="group bg-white rounded-3xl p-7 border border-surface-200 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300">
        <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-brand-100 transition-colors">
          <Icon size={22} className="text-brand-600" />
        </div>
        <h3 className="font-display text-lg font-semibold text-brand-900 mb-2">{title}</h3>
        <p className="text-sm text-brand-400 leading-relaxed mb-4">{description}</p>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-brand-600">
              <CheckCircle2 size={14} className="text-brand-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </AnimateOnScroll>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-950 overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-md bg-brand-950/70 border-b border-brand-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-soft">
            <Wheat size={17} className="text-accent-cream" />
          </div>
          <span className="font-display text-lg font-semibold text-accent-cream tracking-tight">
            SuperPão
          </span>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-soft hover:shadow-elevated hover:-translate-y-px"
        >
          Entrar
          <ArrowRight size={15} />
        </Link>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-brand-700/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-gold/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-800/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center py-20">
          {/* Left — text */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-800/60 border border-brand-700/50 text-accent-wheat text-xs font-medium px-4 py-2 rounded-full">
              <Sparkles size={12} className="text-accent-gold" />
              Gestão completa para padarias
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-semibold text-accent-cream leading-[1.05] tracking-tight">
                Gestão
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-brand-400">
                  inteligente
                </span>
                <br />
                para sua padaria
              </h1>
              <p className="text-brand-400 text-lg leading-relaxed max-w-lg">
                Controle estoque, produções, compras e finanças em uma plataforma
                unificada. Com IA integrada para análises em tempo real.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-elevated hover:-translate-y-0.5"
              >
                Acessar sistema
                <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-brand-900/60 hover:bg-brand-800/60 text-brand-300 hover:text-accent-cream font-semibold px-7 py-3.5 rounded-xl border border-brand-700/50 transition-all duration-200"
              >
                Ver funcionalidades
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-8 pt-2">
              {[
                { value: '360°', label: 'Visão do negócio' },
                { value: '24/7', label: 'Disponibilidade' },
                { value: '100%', label: 'Controle total' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-accent-gold font-display">{stat.value}</p>
                  <p className="text-[11px] text-brand-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#features"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-600 hover:text-brand-400 transition-colors animate-bounce"
        >
          <span className="text-xs tracking-widest uppercase">scroll</span>
          <ChevronDown size={18} />
        </a>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="bg-surface-50 py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">
                Funcionalidades
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-brand-900 mb-4">
                Tudo que sua padaria precisa
              </h2>
              <p className="text-brand-400 text-lg max-w-2xl mx-auto">
                Uma plataforma completa, desenvolvida especificamente para as
                necessidades de padarias e confeitarias modernas.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={Package}
              title="Controle de Estoque"
              description="Gerencie ingredientes e produtos com alertas automáticos de reposição."
              items={['Alertas de estoque mínimo', 'Movimentações rastreadas', 'Relatórios em tempo real']}
              delay={0}
            />
            <FeatureCard
              icon={ShoppingCart}
              title="Gestão de Compras"
              description="Controle pedidos e fornecedores com histórico completo e notas fiscais."
              items={['Cadastro de fornecedores', 'Ordens de compra', 'Histórico detalhado']}
              delay={80}
            />
            <FeatureCard
              icon={BarChart3}
              title="Ordens de Produção"
              description="Planeje, acompanhe e controle cada lote de produção com precisão."
              items={['Fichas técnicas', 'Consumo automático', 'Status por etapa']}
              delay={160}
            />
            <FeatureCard
              icon={Sparkles}
              title="Assistente com IA"
              description="Analise dados, identifique gargalos e tome decisões com apoio da inteligência artificial."
              items={['Análise de tendências', 'Recomendações', 'Respostas instantâneas']}
              delay={240}
            />
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section className="bg-brand-900 py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="grid md:grid-cols-3 gap-px bg-brand-800/40 rounded-3xl overflow-hidden border border-brand-800/40">
              {[
                { value: '360°', label: 'Visão do negócio', desc: 'Todos os módulos integrados em um só lugar' },
                { value: '24/7', label: 'Disponibilidade', desc: 'Acesse de qualquer lugar, a qualquer hora' },
                { value: '100%', label: 'Controle total', desc: 'Da produção às finanças, sem gaps' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-brand-900 px-10 py-12 text-center hover:bg-brand-800/50 transition-colors"
                >
                  <p className="font-display text-5xl font-bold text-accent-gold mb-2">
                    {stat.value}
                  </p>
                  <p className="text-accent-cream font-semibold mb-2">{stat.label}</p>
                  <p className="text-brand-500 text-sm leading-relaxed">{stat.desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Partnerships ───────────────────────────────────────────────── */}
      <section className="bg-surface-100 py-28 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">
                Parcerias
              </span>
              <h2 className="font-display text-4xl font-semibold text-brand-900 mb-4">
                Nossos parceiros
              </h2>
              <p className="text-brand-400 text-lg max-w-xl mx-auto">
                Estamos construindo uma rede de parceiros para oferecer ainda
                mais valor para o seu negócio.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <div className="flex flex-col items-center gap-8">
              {/* Empty state slots */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 w-full max-w-2xl">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/2] rounded-2xl border-2 border-dashed border-surface-300 bg-white/60 flex items-center justify-center"
                  >
                    <span className="text-surface-300 text-xl font-bold">+</span>
                  </div>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-500 text-sm px-5 py-2.5 rounded-full">
                <Sparkles size={14} className="text-accent-gold" />
                Em breve — parcerias estratégicas
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────── */}
      <section className="bg-brand-950 py-28 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center space-y-6">
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-accent-cream">
                Pronto para transformar
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-brand-400">
                  sua padaria?
                </span>
              </h2>
              <p className="text-brand-400 text-lg max-w-xl mx-auto">
                Acesse agora e descubra como o SuperPão pode simplificar sua gestão
                e aumentar sua eficiência operacional.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-elevated hover:-translate-y-0.5 text-base"
              >
                Entrar no sistema
                <ArrowRight size={18} />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#0f0805] border-t border-brand-900/60 px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <Wheat size={13} className="text-accent-cream" />
            </div>
            <span className="font-display text-base font-semibold text-brand-500">SuperPão</span>
          </div>
          <p className="text-xs text-brand-700">
            © {new Date().getFullYear()} SuperPão. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-xs text-brand-700">
            <span className="hover:text-brand-500 cursor-pointer transition-colors">Privacidade</span>
            <span className="hover:text-brand-500 cursor-pointer transition-colors">Termos de Uso</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
