export type IngredientUnit = 'KG' | 'G' | 'L' | 'ML' | 'UN' | 'PCT' | 'CX'

export interface IngredientDto {
  id: string
  name: string
  unit: IngredientUnit
  costPrice: number
  currentStock: number
  minStock: number
  supplier?: { id: string; razaoSocial: string }
  active: boolean
  createdAt: string
}

export interface CreateIngredientDto {
  name: string
  unit: IngredientUnit
  costPrice: number
  minStock?: number
  supplierId?: string
}

export interface UpdateIngredientDto extends Partial<CreateIngredientDto> {
  active?: boolean
}
