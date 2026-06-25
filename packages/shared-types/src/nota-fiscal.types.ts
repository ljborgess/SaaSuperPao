export type NotaFiscalStatus = 'PENDING' | 'ISSUED' | 'CANCELLED' | 'ERROR'

export interface NotaFiscalDto {
  id: string
  client?: { id: string; name: string }
  clientName: string
  clientCpfCnpj?: string
  clientEmail?: string
  serviceDescription: string
  serviceCode?: string
  value: number
  status: NotaFiscalStatus
  externalId?: string
  nfseNumber?: string
  errorMessage?: string
  issuedAt?: string
  cancelledAt?: string
  createdAt: string
}

export interface EmitirNotaFiscalDto {
  clientId?: string
  clientName: string
  clientCpfCnpj?: string
  clientEmail?: string
  serviceDescription: string
  serviceCode?: string
  value: number
}

export interface CancelarNotaFiscalDto {
  motivo: string
}
