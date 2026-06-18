export type ProductStatus = 'ACTIVE' | 'INACTIVE'
export type ProductUnit = 'UN' | 'KG' | 'G' | 'L' | 'ML' | 'CX' | 'PCT'

export interface ProductDto {
  id: string
  name: string
  code: string
  category?: { id: string; name: string }
  unit: ProductUnit
  costPrice: number
  salePrice: number
  margin: number
  currentStock: number
  minStock: number
  status: ProductStatus
  createdAt: string
}

export interface CreateProductDto {
  name: string
  code: string
  categoryId?: string
  unit: ProductUnit
  costPrice: number
  salePrice: number
  minStock?: number
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  status?: ProductStatus
}
