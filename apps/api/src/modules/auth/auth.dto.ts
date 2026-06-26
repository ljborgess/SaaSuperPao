import { IsEmail, IsOptional, IsString, Matches, MinLength, MaxLength, registerDecorator, ValidationOptions } from 'class-validator'

function IsDataUrl(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDataUrl',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown) {
          if (!value) return true
          if (typeof value !== 'string') return false
          return value.startsWith('data:image/')
        },
        defaultMessage: () => 'avatarUrl deve ser uma imagem em base64 (data:image/...)',
      },
    })
  }
}

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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
  })
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
  @MaxLength(200000, { message: 'Imagem muito grande. Máximo 150KB.' })
  @IsDataUrl()
  avatarUrl?: string
}
