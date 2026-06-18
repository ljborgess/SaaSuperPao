export interface SupplierDto {
  id: string
  razaoSocial: string
  nomeFantasia?: string
  cnpj?: string
  contact?: string
  phone?: string
  email?: string
  address?: string
  active: boolean
  createdAt: string
}

export interface CreateSupplierDto {
  razaoSocial: string
  nomeFantasia?: string
  cnpj?: string
  contact?: string
  phone?: string
  email?: string
  address?: string
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {
  active?: boolean
}
