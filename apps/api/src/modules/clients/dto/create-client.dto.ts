import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { IsCpfCnpj } from '../../../common/validators/cpf-cnpj.validator'

export class CreateClientDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100)
  name!: string

  @IsOptional()
  @IsString()
  @IsCpfCnpj()
  cpfCnpj?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsapp?: string

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(100)
  email?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string
}
