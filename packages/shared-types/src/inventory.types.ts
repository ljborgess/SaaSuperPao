export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT'
export type MovementReason =
  | 'PURCHASE'
  | 'PRODUCTION'
  | 'SALE'
  | 'LOSS'
  | 'INTERNAL_USE'
  | 'MANUAL_ADJUSTMENT'
  | 'INITIAL_STOCK'

export interface StockMovementDto {
  id: string
  type: MovementType
  reason: MovementReason
  ingredient?: { id: string; name: string; unit: string }
  product?: { id: string; name: string; unit: string }
  quantity: number
  previousStock: number
  newStock: number
  notes?: string
  createdAt: string
}

export interface CreateStockMovementDto {
  type: MovementType
  reason: MovementReason
  ingredientId?: string
  productId?: string
  quantity: number
  notes?: string
}
