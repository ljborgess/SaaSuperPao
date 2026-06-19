export type ProductionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ProductionMode = 'AUTOMATIC' | 'MANUAL'

export interface ProductionOrderItemDto {
  id: string
  ingredient: { id: string; name: string; unit: string }
  requiredQty: number
  consumedQty?: number
}

export interface ProductionOrderDto {
  id: string
  product: { id: string; name: string }
  recipe: { id: string; yieldQty: number; yieldUnit: string }
  quantity: number
  scheduledDate: string
  completedAt?: string
  responsible: { id: string; name: string }
  status: ProductionStatus
  mode: ProductionMode
  notes?: string
  items?: ProductionOrderItemDto[]
  createdAt: string
}

export interface CreateProductionOrderDto {
  productId: string
  quantity: number
  scheduledDate?: string
  responsibleId: string
  mode?: ProductionMode
  notes?: string
}

export interface UpdateConsumptionItemDto {
  ingredientId: string
  consumedQty: number
}

export interface UpdateConsumptionDto {
  items: UpdateConsumptionItemDto[]
}

export interface UpdateProductionOrderDto {
  scheduledDate?: string
  notes?: string
}

export interface ProductionVarianceItemDto {
  ingredientId: string
  ingredientName: string
  unit: string
  requiredQty: number
  consumedQty: number
  variance: number
  variancePct: number
  costPrice: number
  varianceCost: number
}

export interface ProductionVarianceDto {
  orderId: string
  mode: ProductionMode
  items: ProductionVarianceItemDto[]
  totalVarianceCost: number
}
