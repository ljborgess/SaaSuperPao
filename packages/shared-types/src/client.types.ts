export interface ClientDto {
  id: string
  name: string
  cpfCnpj?: string
  phone?: string
  whatsapp?: string
  email?: string
  address?: string
  active: boolean
  createdAt: string
}

export interface CreateClientDto {
  name: string
  cpfCnpj?: string
  phone?: string
  whatsapp?: string
  email?: string
  address?: string
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  active?: boolean
}
