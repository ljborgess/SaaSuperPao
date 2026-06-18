export interface LoginDto {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface JwtPayload {
  sub: string
  role: string
  iat?: number
  exp?: number
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  password: string
}
