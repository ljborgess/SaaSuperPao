const BASE_URL = 'https://gerandonotafacil.com.br/api/v1'

export interface GnfEmitirPayload {
  tomador: {
    nome: string
    cpfCnpj?: string
    email?: string
  }
  servico: {
    descricao: string
    codigo?: string
    valor: number
  }
  competencia?: string
}

export interface GnfNfseResponse {
  id: string
  numero?: string
  status: string
  pdf?: string
  xml?: string
  [key: string]: unknown
}

export class GerandoNotaFacilClient {
  private readonly token: string
  private readonly cnpjPrestador: string
  private readonly homologacao: boolean

  constructor() {
    this.token = process.env.GERANDONOTAFACIL_TOKEN ?? ''
    this.cnpjPrestador = process.env.GERANDONOTAFACIL_CNPJ ?? ''
    this.homologacao = process.env.GERANDONOTAFACIL_HOMOLOGACAO === 'true'
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    }
  }

  private get baseUrl() {
    return this.homologacao ? `${BASE_URL}/homologacao` : BASE_URL
  }

  private async extractErrorMessage(res: Response): Promise<string> {
    try {
      const body = await res.json() as Record<string, unknown>
      if (typeof body.message === 'string') return body.message.slice(0, 200)
      if (typeof body.error === 'string') return body.error.slice(0, 200)
    } catch {
      // response was not JSON
    }
    return `Erro ${res.status} ao comunicar com GerandoNotaFacil`
  }

  async emitir(payload: GnfEmitirPayload): Promise<GnfNfseResponse> {
    const body = {
      prestador: { cnpj: this.cnpjPrestador },
      ...payload,
    }

    const res = await fetch(`${this.baseUrl}/nfse/emitir`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      throw new Error(await this.extractErrorMessage(res))
    }

    return res.json() as Promise<GnfNfseResponse>
  }

  async cancelar(externalId: string, motivo: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/nfse/${externalId}/cancelar`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ motivo }),
    })

    if (!res.ok) {
      throw new Error(await this.extractErrorMessage(res))
    }
  }
}
