import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator'

export class LoginDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password!: string
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string
}

export class ResetPasswordDto {
  @IsString()
  token!: string

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(64, { message: 'Senha deve ter no máximo 64 caracteres' })
  password!: string
}

export class RefreshTokenDto {
  @IsString()
  refreshToken!: string
}

export class UpdateProfileDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100)
  name!: string

  @IsOptional()
  @IsString()
  @MaxLength(500000, { message: 'Imagem muito grande' })
  avatarUrl?: string
}
