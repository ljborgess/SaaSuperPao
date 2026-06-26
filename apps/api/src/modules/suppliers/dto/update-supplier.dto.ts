import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { IsCpfCnpj } from '../../../common/validators/cpf-cnpj.validator'

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  razaoSocial?: string

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

  @IsOptional()
  @IsBoolean()
  active?: boolean
}
