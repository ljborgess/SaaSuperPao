import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator'

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
