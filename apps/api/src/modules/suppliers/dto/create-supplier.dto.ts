import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { IsCpfCnpj } from '../../../common/validators/cpf-cnpj.validator'

export class CreateSupplierDto {
  @IsString()
  @MinLength(2, { message: 'Razão social deve ter no mínimo 2 caracteres' })
  @MaxLength(150)
  razaoSocial!: string

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nomeFantasia?: string

  @IsOptional()
  @IsString()
  @IsCpfCnpj()
  cnpj?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contact?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(100)
  email?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string
}
