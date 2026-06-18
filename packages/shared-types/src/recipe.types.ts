export interface RecipeItemDto {
  id: string
  ingredient: { id: string; name: string; unit: string }
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
