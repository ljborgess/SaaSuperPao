export type ProductionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface ProductionOrderDto {
  id: string
  product: { id: string; name: string }
  recipe: { id: string; yieldQty: number; yieldUnit: string }
  quantity: number
  scheduledDate: string
  completedAt?: string
  responsible: { id: string; name: string }
  status: ProductionStatus
  notes?: string
  createdAt: string
}

export interface CreateProductionOrderDto {
  productId: string
  quantity: number
  scheduledDate?: string
  responsibleId: string
  notes?: string
}
