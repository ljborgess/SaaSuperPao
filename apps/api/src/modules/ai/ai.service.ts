import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import Groq from 'groq-sdk'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import {
  Product,
  ProductStatus,
  Ingredient,
  Purchase,
  ProductionOrder,
  Supplier,
  Client,
  PurchaseStatus,
  ProductionStatus,
} from '@superpao/database'
import type { ChatMessage, ChatResponse, AiProvider } from '@superpao/shared-types'

const DEFAULT_MODELS: Record<AiProvider, string> = {
  groq: 'llama-3.3-70b-versatile',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-haiku-4-5-20251001',
}

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: EntityRepository<Product>,
    @InjectRepository(Ingredient) private readonly ingredientRepo: EntityRepository<Ingredient>,
    @InjectRepository(Purchase) private readonly purchaseRepo: EntityRepository<Purchase>,
    @InjectRepository(ProductionOrder) private readonly productionRepo: EntityRepository<ProductionOrder>,
    @InjectRepository(Supplier) private readonly supplierRepo: EntityRepository<Supplier>,
    @InjectRepository(Client) private readonly clientRepo: EntityRepository<Client>,
  ) {}

  async chat(
    message: string,
    history: ChatMessage[],
    provider: AiProvider = 'groq',
    apiKey?: string,
    model?: string,
  ): Promise<ChatResponse> {
    const key = apiKey || (provider === 'groq' ? process.env.GROQ_API_KEY : undefined)
    if (!key) throw new BadRequestException(`API key necessária para o provider "${provider}".`)

    const context = await this.buildContext()
    const systemPrompt = `Você é o assistente inteligente da Padaria SuperPão.
Seu papel é ajudar o gestor com análises, recomendações e respostas sobre a operação da padaria.
Responda sempre em português brasileiro, de forma direta e objetiva — como uma conversa natural.
Quando identificar problemas nos dados, sugira ações concretas. Nunca invente dados.

${context}`

    const resolvedModel = model || DEFAULT_MODELS[provider]
    let content: string

    if (provider === 'groq') {
      const groq = new Groq({ apiKey: key })
      const msgs: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message },
      ]
      const res = await groq.chat.completions.create({ model: resolvedModel, messages: msgs, max_tokens: 1024, temperature: 0.7 })
      content = res.choices[0]?.message?.content ?? ''
    } else if (provider === 'openai') {
      const openai = new OpenAI({ apiKey: key })
      const msgs: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message },
      ]
      const res = await openai.chat.completions.create({ model: resolvedModel, messages: msgs, max_tokens: 1024, temperature: 0.7 })
      content = res.choices[0]?.message?.content ?? ''
    } else if (provider === 'anthropic') {
      const anthropic = new Anthropic({ apiKey: key })
      const msgs: Anthropic.MessageParam[] = [
        ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message },
      ]
      const res = await anthropic.messages.create({
        model: resolvedModel,
        system: systemPrompt,
        messages: msgs,
        max_tokens: 1024,
      })
      content = res.content[0]?.type === 'text' ? res.content[0].text : ''
    } else {
      throw new BadRequestException(`Provider "${provider}" não suportado.`)
    }

    return {
      message: content || 'Não consegui processar sua mensagem.',
      timestamp: new Date().toISOString(),
    }
  }

  private async buildContext(): Promise<string> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 86_400_000)

    const [
      totalProducts,
      totalIngredients,
      totalClients,
      totalSuppliers,
      pendingPurchases,
      activeProdOrders,
      productionToday,
      allIngredients,
      allProducts,
      recentPurchases,
      activeOrders,
    ] = await Promise.all([
      this.productRepo.count({ status: ProductStatus.ACTIVE }),
      this.ingredientRepo.count({ active: true }),
      this.clientRepo.count({ active: true }),
      this.supplierRepo.count({ active: true }),
      this.purchaseRepo.count({ status: PurchaseStatus.PENDING }),
      this.productionRepo.count({ status: { $in: [ProductionStatus.PENDING, ProductionStatus.IN_PROGRESS] } }),
      this.productionRepo.count({ scheduledDate: { $gte: startOfToday, $lt: endOfToday } }),
      this.ingredientRepo.find({ active: true, minStock: { $gt: 0 } }),
      this.productRepo.find({ status: ProductStatus.ACTIVE, minStock: { $gt: 0 } }),
      this.purchaseRepo.find(
        { status: PurchaseStatus.PENDING },
        { populate: ['supplier'], orderBy: { purchaseDate: 'ASC' }, limit: 5 },
      ),
      this.productionRepo.find(
        { status: { $in: [ProductionStatus.PENDING, ProductionStatus.IN_PROGRESS] } },
        { populate: ['product'], orderBy: { scheduledDate: 'ASC' }, limit: 5 },
      ),
    ])

    const monthlyPurchases = await this.purchaseRepo.find({
      status: PurchaseStatus.RECEIVED,
      purchaseDate: { $gte: startOfMonth },
    })
    const purchasesValueThisMonth = monthlyPurchases.reduce((sum, p) => sum + Number(p.totalValue), 0)

    const lowIngredients = allIngredients.filter((i) => Number(i.currentStock) <= Number(i.minStock))
    const lowProducts = allProducts.filter((p) => Number(p.currentStock) <= Number(p.minStock))

    const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR')
    const fmtCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

    let ctx = `=== DADOS ATUAIS DA PADARIA (${fmtDate(now)}) ===
Produtos ativos: ${totalProducts} | Ingredientes: ${totalIngredients}
Clientes: ${totalClients} | Fornecedores: ${totalSuppliers}
Compras recebidas no mês: ${monthlyPurchases.length} pedidos — ${fmtCurrency(purchasesValueThisMonth)}
Compras pendentes: ${pendingPurchases} | Produções hoje: ${productionToday} | Produções ativas: ${activeProdOrders}
`

    if (lowIngredients.length > 0 || lowProducts.length > 0) {
      ctx += `\n=== ⚠️ ESTOQUE CRÍTICO (abaixo do mínimo) ===\n`
      for (const i of lowIngredients) ctx += `- [INGREDIENTE] ${i.name}: ${i.currentStock}${i.unit} (mínimo: ${i.minStock}${i.unit})\n`
      for (const p of lowProducts) ctx += `- [PRODUTO] ${p.name}: ${p.currentStock} un (mínimo: ${p.minStock} un)\n`
    } else {
      ctx += `\n=== ✅ ESTOQUE: Todos os itens acima do mínimo ===\n`
    }

    if (recentPurchases.length > 0) {
      ctx += `\n=== COMPRAS PENDENTES ===\n`
      for (const p of recentPurchases) ctx += `- ${p.supplier.razaoSocial}: ${fmtCurrency(Number(p.totalValue))} (${fmtDate(p.purchaseDate)})\n`
    }

    if (activeOrders.length > 0) {
      ctx += `\n=== PRODUÇÕES EM ABERTO ===\n`
      for (const o of activeOrders) {
        const status = o.status === ProductionStatus.IN_PROGRESS ? 'Em andamento' : 'Pendente'
        ctx += `- ${o.product.name}: ${o.quantity} un — ${status} (${fmtDate(o.scheduledDate)})\n`
      }
    }

    return ctx
  }
}
