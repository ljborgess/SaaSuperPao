import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import {
  Product,
  ProductStatus,
  Ingredient,
  Purchase,
  ProductionOrder,
  Client,
  Supplier,
  PurchaseStatus,
  ProductionStatus,
} from '@superpao/database'
import type {
  DashboardStats,
  LowStockItem,
  TopProducedProduct,
  DashboardActivity,
  NotificationsDto,
  NotificationDto,
  DashboardTrends,
} from '@superpao/shared-types'

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: EntityRepository<Product>,
    @InjectRepository(Ingredient) private readonly ingredientRepo: EntityRepository<Ingredient>,
    @InjectRepository(Purchase) private readonly purchaseRepo: EntityRepository<Purchase>,
    @InjectRepository(ProductionOrder) private readonly productionRepo: EntityRepository<ProductionOrder>,
    @InjectRepository(Client) private readonly clientRepo: EntityRepository<Client>,
    @InjectRepository(Supplier) private readonly supplierRepo: EntityRepository<Supplier>,
  ) {}

  async getStats(): Promise<DashboardStats> {
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
      productionThisMonth,
    ] = await Promise.all([
      this.productRepo.count({ status: ProductStatus.ACTIVE }),
      this.ingredientRepo.count({ active: true }),
      this.clientRepo.count({ active: true }),
      this.supplierRepo.count({ active: true }),
      this.purchaseRepo.count({ status: PurchaseStatus.PENDING }),
      this.productionRepo.count({
        status: { $in: [ProductionStatus.PENDING, ProductionStatus.IN_PROGRESS] },
      }),
      this.productionRepo.count({
        scheduledDate: { $gte: startOfToday, $lt: endOfToday },
      }),
      this.productionRepo.count({
        status: ProductionStatus.COMPLETED,
        completedAt: { $gte: startOfMonth },
      }),
    ])

    const monthlyPurchases = await this.purchaseRepo.find({
      status: PurchaseStatus.RECEIVED,
      purchaseDate: { $gte: startOfMonth },
    })
    const purchasesValueThisMonth = monthlyPurchases.reduce(
      (sum, p) => sum + Number(p.totalValue),
      0,
    )

    const [allIngredients, allProducts] = await Promise.all([
      this.ingredientRepo.find({ active: true, minStock: { $gt: 0 } }),
      this.productRepo.find({ status: ProductStatus.ACTIVE, minStock: { $gt: 0 } }),
    ])
    const lowIngredients = allIngredients.filter((i) => Number(i.currentStock) <= Number(i.minStock))
    const lowProducts = allProducts.filter((p) => Number(p.currentStock) <= Number(p.minStock))

    return {
      totalProducts,
      totalIngredients,
      totalClients,
      totalSuppliers,
      pendingPurchases,
      activeProdOrders,
      productionToday,
      productionThisMonth,
      purchasesThisMonth: monthlyPurchases.length,
      purchasesValueThisMonth: Number(purchasesValueThisMonth.toFixed(2)),
      lowStockIngredients: lowIngredients.length,
      lowStockProducts: lowProducts.length,
    }
  }

  async getTopProducts(): Promise<TopProducedProduct[]> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const completedOrders = await this.productionRepo.find(
      { status: ProductionStatus.COMPLETED, completedAt: { $gte: startOfMonth } },
      { populate: ['product'] },
    )

    const totals = new Map<string, { product: Product; totalQty: number }>()
    for (const order of completedOrders) {
      const key = order.product.id
      const entry = totals.get(key)
      if (entry) {
        entry.totalQty += Number(order.quantity)
      } else {
        totals.set(key, { product: order.product, totalQty: Number(order.quantity) })
      }
    }

    return Array.from(totals.values())
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 6)
      .map(({ product, totalQty }) => ({ id: product.id, name: product.name, totalQty }))
  }

  async getLowStock(): Promise<LowStockItem[]> {
    const [allIngredients, allProducts] = await Promise.all([
      this.ingredientRepo.find({ active: true, minStock: { $gt: 0 } }, { orderBy: { name: 'ASC' } }),
      this.productRepo.find({ status: ProductStatus.ACTIVE, minStock: { $gt: 0 } }, { orderBy: { name: 'ASC' } }),
    ])
    const lowIngredients = allIngredients.filter((i) => Number(i.currentStock) <= Number(i.minStock))
    const lowProducts = allProducts.filter((p) => Number(p.currentStock) <= Number(p.minStock))

    const items: LowStockItem[] = [
      ...lowIngredients.map((i) => ({
        id: i.id,
        name: i.name,
        currentStock: Number(i.currentStock),
        minStock: Number(i.minStock),
        unit: i.unit,
        type: 'ingredient' as const,
      })),
      ...lowProducts.map((p) => ({
        id: p.id,
        name: p.name,
        currentStock: Number(p.currentStock),
        minStock: Number(p.minStock),
        unit: p.unit,
        type: 'product' as const,
      })),
    ]

    return items.sort((a, b) => a.currentStock / a.minStock - b.currentStock / b.minStock)
  }

  async getNotifications(): Promise<NotificationsDto> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [allIngredients, allProducts, recentPurchases, recentProduction] = await Promise.all([
      this.ingredientRepo.find({ active: true, minStock: { $gt: 0 } }, { orderBy: { name: 'ASC' } }),
      this.productRepo.find({ status: ProductStatus.ACTIVE, minStock: { $gt: 0 } }, { orderBy: { name: 'ASC' } }),
      this.purchaseRepo.find(
        { status: PurchaseStatus.RECEIVED, purchaseDate: { $gte: since } },
        { populate: ['supplier'], orderBy: { purchaseDate: 'DESC' }, limit: 10 },
      ),
      this.productionRepo.find(
        { status: ProductionStatus.COMPLETED, completedAt: { $gte: since } },
        { populate: ['product'], orderBy: { completedAt: 'DESC' }, limit: 10 },
      ),
    ])

    const alerts: NotificationDto[] = []

    for (const i of allIngredients) {
      if (Number(i.currentStock) <= Number(i.minStock)) {
        const ratio = Number(i.minStock) > 0 ? Number(i.currentStock) / Number(i.minStock) : 0
        alerts.push({
          id: `low-ing-${i.id}`,
          type: 'LOW_STOCK_INGREDIENT',
          severity: ratio === 0 ? 'alert' : 'alert',
          title: `Estoque baixo: ${i.name}`,
          description: `${Number(i.currentStock)} ${i.unit} restante${Number(i.currentStock) !== 1 ? 's' : ''} (mínimo: ${Number(i.minStock)} ${i.unit})`,
          occurredAt: new Date().toISOString(),
        })
      }
    }

    for (const p of allProducts) {
      if (Number(p.currentStock) <= Number(p.minStock)) {
        alerts.push({
          id: `low-prod-${p.id}`,
          type: 'LOW_STOCK_PRODUCT',
          severity: 'alert',
          title: `Estoque baixo: ${p.name}`,
          description: `${Number(p.currentStock)} ${p.unit} restante${Number(p.currentStock) !== 1 ? 's' : ''} (mínimo: ${Number(p.minStock)} ${p.unit})`,
          occurredAt: new Date().toISOString(),
        })
      }
    }

    const activity: NotificationDto[] = []

    for (const purchase of recentPurchases) {
      activity.push({
        id: `purchase-${purchase.id}`,
        type: 'PURCHASE_RECEIVED',
        severity: 'info',
        title: `Compra recebida`,
        description: `${purchase.supplier.razaoSocial} — R$ ${Number(purchase.totalValue).toFixed(2)}`,
        occurredAt: purchase.purchaseDate.toISOString(),
      })
    }

    for (const order of recentProduction) {
      activity.push({
        id: `production-${order.id}`,
        type: 'PRODUCTION_COMPLETED',
        severity: 'info',
        title: `Produção concluída`,
        description: `${order.product.name} — ${Number(order.quantity)} un.`,
        occurredAt: order.completedAt ? order.completedAt.toISOString() : new Date().toISOString(),
      })
    }

    activity.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())

    return { alerts, activity, totalUnread: alerts.length + activity.length }
  }

  async getActivity(): Promise<DashboardActivity> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [recentPurchasesRaw, activeProdOrdersRaw] = await Promise.all([
      this.purchaseRepo.find(
        { purchaseDate: { $gte: startOfMonth } },
        { populate: ['supplier'], orderBy: { purchaseDate: 'DESC' }, limit: 6 },
      ),
      this.productionRepo.find(
        { status: { $in: [ProductionStatus.PENDING, ProductionStatus.IN_PROGRESS] } },
        { populate: ['product'], orderBy: { scheduledDate: 'ASC' }, limit: 6 },
      ),
    ])

    return {
      recentPurchases: recentPurchasesRaw.map((p) => ({
        id: p.id,
        supplierName: p.supplier.razaoSocial,
        totalValue: Number(p.totalValue),
        status: p.status,
        purchaseDate: p.purchaseDate.toISOString(),
        invoiceNumber: p.invoiceNumber,
      })),
      activeProdOrders: activeProdOrdersRaw.map((o) => ({
        id: o.id,
        productName: o.product.name,
        quantity: Number(o.quantity),
        scheduledDate: o.scheduledDate.toISOString(),
        status: o.status,
      })),
    }
  }

  async getTrends(): Promise<DashboardTrends> {
    const now = new Date()

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOf6MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    const [allPurchases, clientsThisMonth, clientsLastMonth, suppliersThisMonth, suppliersLastMonth, totalClients, totalSuppliers] =
      await Promise.all([
        this.purchaseRepo.find(
          { purchaseDate: { $gte: startOf6MonthsAgo } },
          { orderBy: { purchaseDate: 'ASC' } },
        ),
        this.clientRepo.count({ createdAt: { $gte: startOfThisMonth } }),
        this.clientRepo.count({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
        this.supplierRepo.count({ createdAt: { $gte: startOfThisMonth } }),
        this.supplierRepo.count({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
        this.clientRepo.count({ active: true }),
        this.supplierRepo.count({ active: true }),
      ])

    const buckets = new Map<string, { value: number; count: number; month: string; year: number }>()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      buckets.set(key, { value: 0, count: 0, month: MONTH_LABELS[d.getMonth()], year: d.getFullYear() })
    }

    for (const p of allPurchases) {
      const key = `${p.purchaseDate.getFullYear()}-${p.purchaseDate.getMonth()}`
      const bucket = buckets.get(key)
      if (bucket) {
        bucket.value += Number(p.totalValue)
        bucket.count += 1
      }
    }

    const monthlyPurchases = Array.from(buckets.values()).map((b) => ({
      month: b.month,
      year: b.year,
      value: Number(b.value.toFixed(2)),
      count: b.count,
    }))

    const calcGrowth = (newThis: number, newLast: number, total: number) => ({
      total,
      newThisMonth: newThis,
      newLastMonth: newLast,
      growthPct: newLast === 0
        ? (newThis > 0 ? 100 : 0)
        : Number((((newThis - newLast) / newLast) * 100).toFixed(1)),
    })

    return {
      monthlyPurchases,
      clientsGrowth: calcGrowth(clientsThisMonth, clientsLastMonth, totalClients),
      suppliersGrowth: calcGrowth(suppliersThisMonth, suppliersLastMonth, totalSuppliers),
    }
  }
}
