export type PurchaseStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED'

export interface PurchaseItemDto {
  id: string
  ingredient: { id: string; name: string; unit: string }
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface PurchaseDto {
  id: string
  supplier: { id: string; razaoSocial: string }
  totalValue: number
  purchaseDate: string
  status: PurchaseStatus
  invoiceNumber?: string
  notes?: string
  items: PurchaseItemDto[]
  createdAt: string
}

export interface CreatePurchaseItemDto {
  ingredientId: string
  quantity: number
  unitPrice: number
}

export interface CreatePurchaseDto {
  supplierId: string
  purchaseDate?: string
  invoiceNumber?: string
  notes?: string
  items: CreatePurchaseItemDto[]
}
