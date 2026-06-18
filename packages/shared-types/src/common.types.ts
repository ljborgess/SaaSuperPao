export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  message?: string
}
