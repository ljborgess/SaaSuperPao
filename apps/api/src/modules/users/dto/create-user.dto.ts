import { IsEmail, IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export enum UserRoleDto {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
}

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100)
  name!: string

  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(150)
  email!: string

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(64, { message: 'Senha deve ter no máximo 64 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
  })
  password!: string

  @IsEnum(UserRoleDto, { message: 'Role inválida' })
  role!: UserRoleDto
}
