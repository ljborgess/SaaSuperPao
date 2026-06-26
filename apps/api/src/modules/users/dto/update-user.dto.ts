import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { UserRoleDto } from './create-user.dto'

export enum UserStatusDto {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(150)
  email?: string

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
  })
  password?: string

  @IsOptional()
  @IsEnum(UserRoleDto, { message: 'Role inválida' })
  role?: UserRoleDto

  @IsOptional()
  @IsEnum(UserStatusDto, { message: 'Status inválido' })
  status?: UserStatusDto
}
