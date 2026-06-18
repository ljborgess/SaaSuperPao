export interface DashboardStats {
  totalProducts: number
  totalIngredients: number
  totalClients: number
  totalSuppliers: number
  lowStockIngredients: number
  lowStockProducts: number
  purchasesThisMonth: number
  purchasesValueThisMonth: number
  pendingPurchases: number
  productionToday: number
  productionThisMonth: number
  activeProdOrders: number
}

export interface TopProducedProduct {
  id: string
  name: string
  totalQty: number
}

export interface LowStockItem {
  id: string
  name: string
  currentStock: number
  minStock: number
  unit: string
  type: 'ingredient' | 'product'
}

export interface RecentPurchase {
  id: string
  supplierName: string
  totalValue: number
  status: string
  purchaseDate: string
  invoiceNumber?: string
}

export interface ActiveProductionOrder {
  id: string
  productName: string
  quantity: number
  scheduledDate: string
  status: string
}

export interface DashboardActivity {
  recentPurchases: RecentPurchase[]
  activeProdOrders: ActiveProductionOrder[]
}
