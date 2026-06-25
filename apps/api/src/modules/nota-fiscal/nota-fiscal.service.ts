import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { NotaFiscal, NotaFiscalStatus, Client, User } from '@superpao/database'
import type { EmitirNotaFiscalDto, CancelarNotaFiscalDto, PaginationQuery } from '@superpao/shared-types'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'
import { GerandoNotaFacilClient } from './gerandonotafacil.client'

@Injectable()
export class NotaFiscalService {
  private readonly gnfClient = new GerandoNotaFacilClient()

  constructor(
    @InjectRepository(NotaFiscal) private readonly notaRepo: EntityRepository<NotaFiscal>,
    @InjectRepository(Client) private readonly clientRepo: EntityRepository<Client>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
  ) {}

  async findAll(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const [data, total] = await this.notaRepo.findAndCount({}, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
      populate: ['client', 'createdBy'],
    })
    return buildPaginatedResponse(data, total, page, limit)
  }

  async findOne(id: string): Promise<NotaFiscal> {
    const nota = await this.notaRepo.findOne(id, { populate: ['client', 'createdBy'] })
    if (!nota) throw new NotFoundException('Nota fiscal não encontrada.')
    return nota
  }

  async emitir(dto: EmitirNotaFiscalDto, userId: string): Promise<NotaFiscal> {
    if (!dto.clientName?.trim()) throw new BadRequestException('Nome do cliente é obrigatório.')
    if (!dto.serviceDescription?.trim()) throw new BadRequestException('Descrição do serviço é obrigatória.')
    if (!dto.value || dto.value <= 0) throw new BadRequestException('Valor deve ser maior que zero.')
    if (dto.value > 9999999) throw new BadRequestException('Valor fora do limite permitido.')

    const em = this.notaRepo.getEntityManager()

    const createdBy = await this.userRepo.findOne(userId)
    if (!createdBy) throw new NotFoundException('Usuário não encontrado.')

    let client: Client | undefined
    if (dto.clientId) {
      const found = await this.clientRepo.findOne(dto.clientId)
      if (!found) throw new NotFoundException('Cliente não encontrado.')
      client = found
    }

    const nota = this.notaRepo.create({
      client,
      clientName: dto.clientName,
      clientCpfCnpj: dto.clientCpfCnpj,
      clientEmail: dto.clientEmail,
      serviceDescription: dto.serviceDescription,
      serviceCode: dto.serviceCode,
      value: dto.value,
      status: NotaFiscalStatus.PENDING,
      createdBy,
    } as any)

    await em.persistAndFlush(nota)

    const token = process.env.GERANDONOTAFACIL_TOKEN ?? ''
    const tokenConfigured = token.length > 0 && !token.startsWith('(')

    if (!tokenConfigured) {
      nota.status = NotaFiscalStatus.ISSUED
      nota.nfseNumber = `INT-${Date.now().toString().slice(-6)}`
      nota.issuedAt = new Date()
    } else {
      try {
        const response = await this.gnfClient.emitir({
          tomador: {
            nome: dto.clientName,
            cpfCnpj: dto.clientCpfCnpj,
            email: dto.clientEmail,
          },
          servico: {
            descricao: dto.serviceDescription,
            codigo: dto.serviceCode,
            valor: dto.value,
          },
          competencia: new Date().toISOString().slice(0, 10),
        })

        nota.status = NotaFiscalStatus.ISSUED
        nota.externalId = response.id
        nota.nfseNumber = response.numero
        nota.issuedAt = new Date()
      } catch (err) {
        nota.status = NotaFiscalStatus.ERROR
        nota.errorMessage = err instanceof Error ? err.message : String(err)
      }
    }

    await em.flush()
    return nota
  }

  async cancelar(id: string, dto: CancelarNotaFiscalDto): Promise<NotaFiscal> {
    const nota = await this.findOne(id)

    if (nota.status !== NotaFiscalStatus.ISSUED) {
      throw new BadRequestException('Apenas notas emitidas podem ser canceladas.')
    }

    if (!nota.externalId) {
      throw new BadRequestException('Nota sem ID externo — não é possível cancelar via API.')
    }

    await this.gnfClient.cancelar(nota.externalId, dto.motivo)

    nota.status = NotaFiscalStatus.CANCELLED
    nota.cancelledAt = new Date()
    await this.notaRepo.getEntityManager().flush()

    return nota
  }
}
