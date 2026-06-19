export interface RecipeItemDto {
  id: string
  ingredient: { id: string; name: string; unit: string; costPrice: number }
  quantity: number
  unit: string
}

export interface RecipeDto {
  id: string
  product: { id: string; name: string }
  yieldQty: number
  yieldUnit: string
  instructions?: string
  items: RecipeItemDto[]
  createdAt: string
  updatedAt: string
}

export interface CreateRecipeItemDto {
  ingredientId: string
  quantity: number
  unit: string
}

export interface CreateRecipeDto {
  productId: string
  yieldQty: number
  yieldUnit: string
  instructions?: string
  items: CreateRecipeItemDto[]
}

export interface UpdateRecipeDto {
  yieldQty?: number
  yieldUnit?: string
  instructions?: string
}

export interface UpdateRecipeItemDto {
  quantity?: number
  unit?: string
}
