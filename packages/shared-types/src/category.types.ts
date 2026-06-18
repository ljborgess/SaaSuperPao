export interface CategoryDto {
  id: string
  name: string
  description?: string
  createdAt: string
}

export interface CreateCategoryDto {
  name: string
  description?: string
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
}
