# SaaS Boilerplate — Guia Completo de Escopo e Arquitetura

> Documento de referência para qualquer projeto SaaS construído com este stack.
> Aplica-se diretamente ao SuperPão e a qualquer novo projeto que siga o mesmo padrão.

---

## Índice

1. [Visão Geral da Stack](#1-visão-geral-da-stack)
2. [Estrutura de Monorepo](#2-estrutura-de-monorepo)
3. [Arquitetura do Backend (NestJS)](#3-arquitetura-do-backend-nestjs)
4. [Arquitetura do Frontend (Next.js)](#4-arquitetura-do-frontend-nextjs)
5. [Autenticação e Autorização](#5-autenticação-e-autorização)
6. [Segurança — Checklist Completo](#6-segurança--checklist-completo)
7. [Banco de Dados e ORM](#7-banco-de-dados-e-orm)
8. [Padrões de Código API](#8-padrões-de-código-api)
9. [Padrões de Código Web](#9-padrões-de-código-web)
10. [Email e Notificações](#10-email-e-notificações)
11. [Inteligência Artificial (Groq)](#11-inteligência-artificial-groq)
12. [Docker e Infraestrutura](#12-docker-e-infraestrutura)
13. [Variáveis de Ambiente](#13-variáveis-de-ambiente)
14. [Workflows de Desenvolvimento](#14-workflows-de-desenvolvimento)
15. [Controle de Acesso por Roles](#15-controle-de-acesso-por-roles)
16. [Audit Logging](#16-audit-logging)
17. [Landing Page SaaS](#17-landing-page-saas)
18. [Convenções e Nomenclatura](#18-convenções-e-nomenclatura)
19. [Checklist de Novo Projeto](#19-checklist-de-novo-projeto)

---

## 1. Visão Geral da Stack

### Versões fixas (não rebaixar)

| Camada | Tecnologia | Versão |
|---|---|---|
| Runtime | Node.js | `>= 20` |
| Package manager | pnpm | `>= 9` |
| Monorepo | Turborepo | `^2.x` |
| Backend framework | NestJS | `^11.x` |
| ORM | MikroORM | `^6.x` |
| Banco de dados | PostgreSQL | `15` (Docker) |
| Frontend framework | Next.js | `^15.x` (App Router) |
| UI library | React | `^19.x` |
| Estilos | Tailwind CSS | `^3.x` |
| Linguagem | TypeScript | `^5.7` |
| AI provider | Groq SDK | `^1.x` |

### Por que este stack

- **pnpm + Turborepo** — cache inteligente, builds paralelos, workspace sem hoisting acidental
- **NestJS 11** — DI nativa, decorators, modularidade real, Swagger embutido
- **MikroORM 6** — Unit of Work pattern, migrations versionadas, `hidden: true` resolve serialização sem class-transformer
- **Next.js 15 App Router** — Server Components por padrão, streaming, cache granular
- **TanStack Query** — cache de servidor no cliente, invalidação automática, sem Redux
- **Zod + React Hook Form** — validação end-to-end com tipos compartilhados entre API e Web

---

## 2. Estrutura de Monorepo

```
projeto/
├── apps/
│   ├── api/                  # NestJS — porta 3001
│   └── web/                  # Next.js — porta 3000
├── packages/
│   ├── database/             # Entidades MikroORM + migrations + seed
│   ├── shared-types/         # Interfaces TypeScript compartilhadas
│   ├── shared-utils/         # Funções utilitárias puras
│   ├── configs/              # tsconfig base, eslint config, etc.
│   └── ui/                   # Componentes React compartilhados (opcional)
├── docker/
│   ├── api/Dockerfile
│   ├── web/Dockerfile
│   └── docker-compose.yml
├── docs/                     # Documentação do projeto
├── turbo.json
├── package.json              # Root — apenas scripts e devDeps de workspace
└── pnpm-workspace.yaml
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^lint"] },
    "type-check": { "dependsOn": ["^build"] },
    "db:migrate": { "cache": false },
    "db:seed": { "cache": false, "dependsOn": ["db:migrate"] }
  }
}
```

### Scripts raiz (`package.json`)

```json
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "db:migrate": "turbo db:migrate",
    "db:seed": "turbo db:seed",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\""
  }
}
```

### Regra de dependências entre pacotes

- `apps/api` e `apps/web` podem depender de `packages/*`
- `packages/*` **não** dependem de `apps/*`
- `packages/database` exporta entidades e é importado apenas pelo `apps/api`
- `packages/shared-types` é importado por ambos os apps
- Referências: `"@projeto/database": "workspace:*"`

---

## 3. Arquitetura do Backend (NestJS)

### Estrutura de `apps/api/src/`

```
src/
├── main.ts                   # Bootstrap, Helmet, CORS, ValidationPipe, Swagger
├── app.module.ts             # Módulo raiz — importa todos os módulos
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── guards/
│       └── roles.guard.ts
└── modules/
    ├── auth/
    ├── users/
    ├── clients/
    ├── suppliers/
    ├── categories/
    ├── products/
    ├── inventory/
    ├── purchases/
    ├── production/
    ├── dashboard/
    ├── email/
    ├── audit/
    └── ai/
```

### `main.ts` — configuração obrigatória

```typescript
import helmet from 'helmet'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const corsOrigin = process.env.WEB_URL
  if (!corsOrigin) throw new Error('WEB_URL environment variable is required')

  app.use(helmet())
  app.setGlobalPrefix('api')
  app.enableCors({ origin: corsOrigin, credentials: true })
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  // Swagger (desabilitar em produção se necessário)
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config))

  await app.listen(process.env.API_PORT ?? 3001)
}
bootstrap()
```

### `app.module.ts` — providers globais

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    MikroOrmModule.forRootAsync({ ... }),
    // módulos de domínio...
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // JwtAuthGuard global se preferir (alternativa: decorar cada controller)
  ],
})
export class AppModule {}
```

### Estrutura de um módulo de domínio

```
modules/clientes/
├── clients.module.ts
├── clients.controller.ts     # Rotas, guards, throttle, swagger
├── clients.service.ts        # Lógica de negócio
└── dto/
    ├── create-client.dto.ts
    └── update-client.dto.ts
```

---

## 4. Arquitetura do Frontend (Next.js)

### Estrutura de `apps/web/src/`

```
src/
├── app/                      # App Router
│   ├── layout.tsx            # Root layout — providers, fonts
│   ├── page.tsx              # Landing page pública
│   ├── login/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   └── dashboard/
│       ├── layout.tsx        # Shell autenticada (sidebar, header)
│       ├── page.tsx
│       └── [módulo]/page.tsx
├── components/
│   ├── landing/              # Componentes da landing page
│   ├── ui/                   # Primitivos (Button, Input, Modal, etc.)
│   └── [feature]/            # Componentes por feature
├── lib/
│   ├── api.ts                # Instância Axios + interceptors (token, refresh, logout)
│   └── auth.ts               # Helpers de sessão (sessionStorage)
├── hooks/                    # React Query hooks por feature
├── providers/
│   └── query-provider.tsx    # TanStack Query + DevTools
└── middleware.ts             # Proteção de rotas
```

### `middleware.ts` — proteção de rotas

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const exactPublicPaths = ['/']
const prefixPublicPaths = ['/login', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic =
    exactPublicPaths.includes(pathname) ||
    prefixPublicPaths.some((p) => pathname.startsWith(p))
  const token = request.cookies.get('accessToken')?.value

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
```

**Importante:** `'/'` deve ser checado com match exato, não `startsWith` — senão toda rota é pública.

### `lib/api.ts` — instância Axios

```typescript
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta token em cada request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Tenta refresh em 401, senão desloga
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = sessionStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
            { refreshToken },
          )
          sessionStorage.setItem('accessToken', data.accessToken)
          sessionStorage.setItem('refreshToken', data.refreshToken)
          err.config.headers.Authorization = `Bearer ${data.accessToken}`
          return axios(err.config)
        } catch {
          sessionStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  },
)
```

### `lib/auth.ts` — helpers de sessão

```typescript
export function saveTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem('accessToken', accessToken)
  sessionStorage.setItem('refreshToken', refreshToken)
  // Cookie para o middleware (SSR)
  document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict`
}

export function clearTokens() {
  sessionStorage.clear()
  document.cookie = 'accessToken=; path=/; max-age=0'
}
```

**Por que `sessionStorage` e não `localStorage`:**
- `sessionStorage` é isolado por aba e limpo ao fechar o browser
- Não persiste XSS entre sessões
- Cookie apenas para leitura do middleware (sem `httpOnly` no client-side)

---

## 5. Autenticação e Autorização

### Fluxo completo

```
1. POST /api/auth/login
   → LocalStrategy.validate() → AuthService.validateUser()
   → Checa bloqueio de conta (lockedUntil)
   → bcrypt.compare(plain, hash)
   → Incrementa loginAttempts em falha (bloqueia após 5 em 15min)
   → Zera loginAttempts em sucesso
   → Retorna { accessToken, refreshToken, user }

2. Request autenticado
   → JwtStrategy.validate(payload) → busca user no banco por payload.sub
   → @CurrentUser() injeta user no controller

3. POST /api/auth/refresh
   → Verifica refreshToken com JWT_REFRESH_SECRET
   → Compara com hash armazenado no banco
   → Gera novo par de tokens (rotation)

4. POST /api/auth/logout
   → Limpa refreshToken do banco

5. POST /api/auth/forgot-password
   → Gera token aleatório (crypto.randomBytes)
   → Armazena SHA-256(token) no banco
   → Envia token plain por email

6. POST /api/auth/reset-password
   → Recebe token plain
   → SHA-256(token) → busca no banco
   → Valida expiração
   → Atualiza senha
```

### JWT Payload mínimo

```typescript
// NUNCA incluir email ou outros dados no payload
interface JwtPayload {
  sub: string    // user.id
  role: UserRole
}
```

O `email` está disponível via `@CurrentUser()` pois `JwtStrategy.validate()` busca o user completo no banco. Não é necessário no token.

### Segredos obrigatórios (sem fallback)

```typescript
// auth.module.ts
const secret = config.get<string>('JWT_SECRET')
if (!secret) throw new Error('JWT_SECRET environment variable is required')

// jwt.strategy.ts
const secret = (() => {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET environment variable is required')
  return s
})()
```

**Nunca usar:** `?? 'secret'`, `?? 'fallback'` ou qualquer string hardcoded como fallback de segredo.

### Brute force — campos na entidade User

```typescript
@Property({ default: 0 })
loginAttempts: number = 0

@Property({ nullable: true, hidden: true })
lockedUntil?: Date
```

Constantes: `MAX_LOGIN_ATTEMPTS = 5`, `LOCK_DURATION_MS = 15 * 60 * 1000`

---

## 6. Segurança — Checklist Completo

Cada item abaixo deve estar presente em qualquer projeto desta stack.

### Headers HTTP

- [x] `helmet()` habilitado no `main.ts` (CSP, X-Frame-Options, HSTS, X-Content-Type-Options, etc.)
- [x] CORS configurado com origem explícita via env var (`WEB_URL`)
- [x] `credentials: true` apenas se necessário cookies cross-origin

### Validação de input

- [x] `ValidationPipe` com `whitelist: true` — remove campos não declarados no DTO
- [x] `forbidNonWhitelisted: true` — erro 400 se campo extra for enviado
- [x] `transform: true` — converte strings para tipos primitivos automaticamente
- [x] Todos os endpoints com DTOs validados via `class-validator`

### Serialização — campos sensíveis

- [x] Campos sensíveis na entidade com `@Property({ hidden: true })` (MikroORM-nativo)
- [x] **Não usar** `ClassSerializerInterceptor` com MikroORM — causa stack overflow por proxies circulares
- [x] Campos: `password`, `refreshToken`, `passwordResetToken`, `passwordResetExpires`, `lockedUntil`

### Rate limiting

- [x] `ThrottlerModule` global: 100 req/min por IP (default)
- [x] `@Throttle` por endpoint:
  - Login: 5 req / 60s
  - Forgot password: 3 req / 5min
  - Refresh: 10 req / 60s
  - Reset password: 5 req / 5min

### Segredos e tokens

- [x] `JWT_SECRET` e `JWT_REFRESH_SECRET` obrigatórios — lançar erro se ausentes
- [x] Password reset: armazenar `SHA-256(token)` no banco, enviar `token` plain por email
- [x] bcrypt com custo `12` para hashing de senhas

### Armazenamento de tokens no frontend

- [x] `sessionStorage` (não `localStorage`) — isolado por aba, limpo ao fechar browser
- [x] Cookie `SameSite=Strict` para o middleware SSR
- [x] `sessionStorage.clear()` completo em 401 não recuperável antes do redirect

### Brute force

- [x] Contador `loginAttempts` por usuário no banco
- [x] Bloqueio de 15 minutos após 5 tentativas
- [x] Reset do contador após login bem-sucedido
- [x] Falhas registradas no audit log (`LOGIN_FAILED`)

### Controle de acesso

- [x] `JwtAuthGuard` em todos os endpoints autenticados
- [x] `RolesGuard` + `@Roles()` em endpoints sensíveis
- [x] Roles granulares por método HTTP (GET → OPERATOR, POST/PATCH → MANAGER, DELETE → ADMIN)

### Containers

- [x] `USER node` nos Dockerfiles (não rodar como root)
- [x] Imagens Alpine (menor superfície de ataque)

### Exception handling

- [x] `GlobalExceptionFilter` — log server-side de exceções não tratadas
- [x] Em produção: não vazar stack trace ou mensagens internas — retornar `'Internal server error'`

---

## 7. Banco de Dados e ORM

### Localização do pacote

`packages/database/src/`
```
database/
├── entities/
│   ├── user.entity.ts
│   ├── audit-log.entity.ts
│   └── [domínio].entity.ts
├── migrations/
│   └── Migration[timestamp].ts
├── mikro-orm.config.ts
├── seed.ts
└── index.ts                  # Re-exporta tudo
```

### Entidade base — padrão obrigatório

```typescript
import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'

@Entity({ tableName: 'nome_da_tabela' })
export class MinhaEntidade {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  // ... campos de domínio

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
```

### Campos sensíveis

```typescript
@Property({ hidden: true })
campoSecreto!: string
```

`hidden: true` faz o MikroORM omitir o campo no `toJSON()` injetado pelo decorator `@Entity()`. É transparente e não requer nenhum interceptor adicional.

### Migrations

- Nunca editar uma migration existente após executada
- Usar `pnpm db:migrate` para aplicar
- Nomear: `Migration[YYYYMMDDHHMMSS].ts`
- Incluir rollback (`down()`) sempre que possível

```typescript
export class Migration20260618120000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`ALTER TABLE "users" ADD COLUMN "login_attempts" integer NOT NULL DEFAULT 0`)
  }

  async down(): Promise<void> {
    this.addSql(`ALTER TABLE "users" DROP COLUMN "login_attempts"`)
  }
}
```

### Seed

- Seed deve ser idempotente (verificar antes de inserir)
- Sempre criar pelo menos um usuário ADMIN com senha de `.env`
- Executar via `pnpm db:seed`

---

## 8. Padrões de Código API

### Controller — estrutura padrão

```typescript
@ApiTags('clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findAll() { ... }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateClientDto) { ... }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) { ... }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) { ... }
}
```

### DTO — validação com class-validator

```typescript
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  name!: string

  @ApiProperty()
  @IsEmail()
  email!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string
}
```

### Decorator `@CurrentUser()`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().user,
)
```

### Decorator `@Roles()`

```typescript
import { SetMetadata } from '@nestjs/common'
import { UserRole } from '@superpao/database'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
```

### Guard de roles

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required) return true
    const { user } = context.switchToHttp().getRequest()
    return required.includes(user?.role)
  }
}
```

---

## 9. Padrões de Código Web

### Página autenticada — estrutura padrão

```typescript
// app/dashboard/[feature]/page.tsx — Server Component
export default function FeaturePage() {
  return <FeatureView />
}

// components/[feature]/feature-view.tsx — Client Component
'use client'
export function FeatureView() {
  const { data, isLoading } = useFeature()
  // ...
}
```

### React Query hook padrão

```typescript
// hooks/use-clients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/api/clients')
      return data
    },
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateClientDto) => api.post('/api/clients', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}
```

### Formulário padrão (React Hook Form + Zod)

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

type FormData = z.infer<typeof schema>

export function ClientForm() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) })
  const create = useCreateClient()

  return (
    <form onSubmit={form.handleSubmit((data) => create.mutate(data))}>
      {/* ... */}
    </form>
  )
}
```

### Tailwind — paleta de cores do projeto

```typescript
// tailwind.config.ts — extend obrigatório
colors: {
  brand: {
    50: '#FAF6F1', 100: '#F0E8DC', 200: '#E0D0BC',
    300: '#C9AD8E', 400: '#B08B66', 500: '#8B6342',
    600: '#6B4423', 700: '#553619', 800: '#3F2812',
    900: '#2C1810', 950: '#1A0E08',
  },
  surface: {
    50: '#FDFBF8', 100: '#F8F4EE', 200: '#F0EBE3',
    300: '#E5DDD3', 400: '#D4C9BA',
  },
  accent: {
    gold: '#C4A77D',
    cream: '#FFF8F0',
    wheat: '#E8D5B5',
  },
}
```

### Fontes

- `font-display` → Playfair Display (headings, logos)
- `font-sans` → Plus Jakarta Sans (body, UI)

---

## 10. Email e Notificações

### Módulo de email

- **Driver:** Nodemailer (`nodemailer`)
- **Templates:** Handlebars (`handlebars`)
- **Templates em:** `apps/api/src/modules/email/templates/`

### Variáveis de ambiente necessárias

```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASS=senha_smtp
EMAIL_FROM="SuperPão <noreply@superpao.com.br>"
WEB_URL=https://app.superpao.com.br    # usado nos links dos emails
```

**Nunca usar `NEXT_PUBLIC_*` no backend.** Env vars com prefixo `NEXT_PUBLIC_` são embutidas no bundle do frontend. No backend, usar vars sem prefixo.

### Template de email padrão (Handlebars)

```html
<!-- templates/reset-password.hbs -->
<h1>Redefinir senha</h1>
<p>Clique no link abaixo para redefinir sua senha:</p>
<a href="{{resetUrl}}">Redefinir senha</a>
<p>O link expira em 1 hora.</p>
```

---

## 11. Inteligência Artificial (Groq)

### Setup

- **SDK:** `groq-sdk`
- **Modelo padrão:** `llama-3.3-70b-versatile` (rápido e capaz)
- **Módulo:** `apps/api/src/modules/ai/`

### Variável obrigatória

```
GROQ_API_KEY=gsk_...
```

A chave deve estar em `apps/api/.env` — **não apenas no `.env` raiz.** Turborepo executa cada app no seu próprio diretório; `.env` da raiz não é herdado automaticamente pelo `apps/api`.

### Padrão de uso

```typescript
import Groq from 'groq-sdk'

@Injectable()
export class AiService {
  private groq: Groq

  constructor() {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is required')
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }

  async chat(prompt: string, context?: string): Promise<string> {
    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: context ?? 'Você é um assistente especializado.' },
        { role: 'user', content: prompt },
      ],
    })
    return completion.choices[0]?.message?.content ?? ''
  }
}
```

---

## 12. Docker e Infraestrutura

### `docker/api/Dockerfile`

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @projeto/database build
RUN pnpm --filter @projeto/api build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# Nunca rodar como root em produção
USER node
CMD ["node", "dist/main"]
```

### `docker/web/Dockerfile`

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @projeto/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
```

### `docker-compose.yml`

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    ports:
      - '5433:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DATABASE_USER}']
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ..
      dockerfile: docker/api/Dockerfile
    restart: unless-stopped
    env_file: ../.env
    ports:
      - '3001:3001'
    depends_on:
      postgres:
        condition: service_healthy

  web:
    build:
      context: ..
      dockerfile: docker/web/Dockerfile
    restart: unless-stopped
    env_file: ../.env
    ports:
      - '3000:3000'
    depends_on:
      - api

volumes:
  postgres_data:
```

**Regra:** credenciais do banco nunca hardcoded no compose — sempre via `env_file` ou variáveis de ambiente do CI/CD.

---

## 13. Variáveis de Ambiente

### `.env.example` — template obrigatório no repositório

```bash
# ── Banco de dados ────────────────────────────────────
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=app_user
DATABASE_PASSWORD=troque_essa_senha
DATABASE_NAME=app_db

# ── API ───────────────────────────────────────────────
API_PORT=3001

# ── JWT ───────────────────────────────────────────────
# Gerar com: openssl rand -base64 64
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

# ── CORS ──────────────────────────────────────────────
WEB_URL=http://localhost:3000

# ── Email ─────────────────────────────────────────────
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASS=
EMAIL_FROM="App <noreply@example.com>"

# ── IA ────────────────────────────────────────────────
GROQ_API_KEY=

# ── Web (prefixo NEXT_PUBLIC_ = exposto no browser) ──
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Regras de env vars

1. `NEXT_PUBLIC_*` → apenas dados não sensíveis usados no frontend (ex: URL da API)
2. Backend nunca lê `NEXT_PUBLIC_*` — usar equivalente sem prefixo
3. Cada segredo sem valor no `.env.example` (preenchido no CI/CD ou `.env` local)
4. `.env` no `.gitignore` sempre; `.env.example` comitado sempre

---

## 14. Workflows de Desenvolvimento

### Setup inicial de um projeto novo

```bash
# 1. Clonar / criar repositório
git clone ... && cd projeto

# 2. Instalar dependências
pnpm install

# 3. Configurar ambiente
cp .env.example .env
# Editar .env com valores reais

# 4. Subir banco
docker compose -f docker/docker-compose.yml up postgres -d

# 5. Aplicar migrations
pnpm db:migrate

# 6. Popular com dados iniciais
pnpm db:seed

# 7. Rodar em desenvolvimento
pnpm dev
# API: http://localhost:3001
# Web: http://localhost:3000
# Swagger: http://localhost:3001/docs
```

### Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `pnpm dev` | Roda api + web em paralelo (turbo) |
| `pnpm build` | Build completo em ordem de dependência |
| `pnpm type-check` | TypeScript em todos os pacotes |
| `pnpm lint` | ESLint em todos os pacotes |
| `pnpm format` | Prettier em todo o repositório |
| `pnpm db:migrate` | Aplica migrations pendentes |
| `pnpm db:seed` | Popula o banco com dados iniciais |
| `pnpm --filter @projeto/database build` | Rebuilda apenas o pacote database |

### Workflow de feature

```
1. Criar branch: feat/nome-da-feature
2. Implementar backend (entity → migration → service → controller → DTO)
3. Implementar frontend (hook → componentes → página)
4. Rodar type-check e lint
5. PR → review → merge
```

### Workflow de migration

```bash
# Gerar nova migration
pnpm --filter @projeto/database mikro-orm migration:create

# Aplicar
pnpm db:migrate

# Reverter última
pnpm --filter @projeto/database mikro-orm migration:down
```

---

## 15. Controle de Acesso por Roles

### Roles disponíveis

| Role | Permissões |
|---|---|
| `OPERATOR` | Leitura (GET) de dados operacionais |
| `MANAGER` | Leitura + Criação + Edição (GET, POST, PATCH) |
| `ADMIN` | Tudo, incluindo exclusão (DELETE) e configurações |

### Mapeamento por operação HTTP

```
GET    → ADMIN, MANAGER, OPERATOR
POST   → ADMIN, MANAGER
PATCH  → ADMIN, MANAGER
DELETE → ADMIN
```

### Aplicação nos controllers

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resource')
export class ResourceController {
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findAll() {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create() {}

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update() {}

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove() {}
}
```

---

## 16. Audit Logging

### Por que auditar

Toda ação sensível deve ser rastreável: quem fez, quando, o quê, de onde.

### Entidade `AuditLog`

```typescript
export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity({ tableName: 'audit_logs' })
export class AuditLog {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @Property({ nullable: true })
  userId?: string

  @Enum(() => AuditAction)
  action!: AuditAction

  @Property()
  entity!: string

  @Property({ type: 'json', nullable: true })
  payload?: Record<string, unknown>

  @Property({ nullable: true })
  ip?: string

  @Property()
  createdAt: Date = new Date()
}
```

### `AuditService`

```typescript
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: EntityRepository<AuditLog>,
  ) {}

  async log(data: {
    userId?: string
    action: AuditAction
    entity: string
    payload?: Record<string, unknown>
    ip?: string
  }) {
    const log = this.repo.create(data)
    await this.repo.getEntityManager().persistAndFlush(log)
  }
}
```

### O que auditar (mínimo)

- `LOGIN` / `LOGIN_FAILED` / `LOGOUT`
- `PASSWORD_RESET`
- `CREATE` / `UPDATE` / `DELETE` em entidades de negócio relevantes

---

## 17. Landing Page SaaS

### Estrutura de seções (ordem)

1. **Navbar fixa** — logo + nome à esquerda, botão "Entrar" à direita
2. **Hero** — headline, subheadline, 2 CTAs, métricas rápidas, mockup animado
3. **Features** — 4 cards com ícone, título, descrição e bullets
4. **Stats** — 3 números de impacto em fundo escuro
5. **Parcerias** — slots vazios com "Em breve" se ainda não houver
6. **CTA final** — headline + botão único
7. **Footer** — logo, copyright, links de Privacidade e Termos

### Componente `AnimateOnScroll`

```typescript
// components/landing/animate-on-scroll.tsx
'use client'
import { useEffect, useRef, type ReactNode } from 'react'

export function AnimateOnScroll({ children, delay = 0, className = '' }: {
  children: ReactNode; delay?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.transitionDelay = `${delay}ms`
        el.classList.add('is-visible')
        observer.unobserve(el)
      }
    }, { threshold: 0.12 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return <div ref={ref} className={`scroll-animate ${className}`}>{children}</div>
}
```

### CSS de animações (`globals.css`)

```css
/* Scroll reveal */
.scroll-animate {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}
.scroll-animate.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Animação float (mockup) — `tailwind.config.ts`

```typescript
animation: {
  'float': 'float 4s ease-in-out infinite',
  'float-slow': 'float 6s ease-in-out infinite',
},
keyframes: {
  float: {
    '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
    '50%': { transform: 'translateY(-16px) rotate(1deg)' },
  },
}
```

---

## 18. Convenções e Nomenclatura

### Arquivos e pastas

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componente React | `kebab-case.tsx` | `client-form.tsx` |
| Hook | `use-kebab-case.ts` | `use-clients.ts` |
| Serviço NestJS | `kebab-case.service.ts` | `clients.service.ts` |
| Controller | `kebab-case.controller.ts` | `clients.controller.ts` |
| DTO | `kebab-case.dto.ts` | `create-client.dto.ts` |
| Entidade | `kebab-case.entity.ts` | `user.entity.ts` |
| Migration | `MigrationYYYYMMDDHHMMSS.ts` | `Migration20260618120000.ts` |

### Nomenclatura de código

- Classes: `PascalCase`
- Funções/variáveis/propriedades: `camelCase`
- Enums: `SCREAMING_SNAKE_CASE` para valores (`UserRole.ADMIN`)
- Tabelas SQL: `snake_case` (definido no `tableName` da entidade)
- Env vars: `SCREAMING_SNAKE_CASE`

### Nomenclatura de rotas API

```
GET    /api/clients           → listar
GET    /api/clients/:id       → buscar por ID
POST   /api/clients           → criar
PATCH  /api/clients/:id       → atualizar parcialmente
DELETE /api/clients/:id       → remover
```

Prefixo global `/api` definido em `main.ts` via `app.setGlobalPrefix('api')`.

---

## 19. Checklist de Novo Projeto

Use este checklist ao iniciar um novo SaaS com esta stack.

### Estrutura

- [ ] Monorepo criado com `apps/api`, `apps/web`, `packages/database`, `packages/shared-types`, `packages/shared-utils`, `packages/configs`
- [ ] `pnpm-workspace.yaml` configurado
- [ ] `turbo.json` com tasks: `build`, `dev`, `lint`, `type-check`, `db:migrate`, `db:seed`
- [ ] `package.json` raiz com todos os scripts
- [ ] `.env.example` criado e comitado
- [ ] `.env` no `.gitignore`

### Backend

- [ ] `main.ts` com `helmet()`, CORS estrito, `ValidationPipe`, `GlobalExceptionFilter`
- [ ] `app.module.ts` com `ThrottlerModule` global e `ThrottlerGuard` no `APP_GUARD`
- [ ] Módulo de Auth completo (JWT, refresh, forgot/reset password, brute force)
- [ ] `JWT_SECRET` e `JWT_REFRESH_SECRET` sem fallback (lança erro se ausente)
- [ ] `WEB_URL` sem fallback no CORS
- [ ] `GROQ_API_KEY` em `apps/api/.env` (não apenas na raiz)
- [ ] Entidade `User` com `hidden: true` nos campos sensíveis
- [ ] Entidade `AuditLog` com enum de ações
- [ ] Migration para as tabelas iniciais
- [ ] Seed com usuário ADMIN

### Segurança

- [ ] Todos os campos sensíveis com `@Property({ hidden: true })`
- [ ] `ClassSerializerInterceptor` **não** instalado globalmente (incompatível com MikroORM)
- [ ] Rate limiting por endpoint de auth
- [ ] Brute force: `loginAttempts` + `lockedUntil` na entidade User
- [ ] Password reset com hash SHA-256 no banco
- [ ] `sessionStorage` (não `localStorage`) no frontend
- [ ] `USER node` nos Dockerfiles

### Frontend

- [ ] `middleware.ts` com rotas públicas por match exato para `/`
- [ ] `lib/api.ts` com refresh automático em 401
- [ ] `lib/auth.ts` com `saveTokens` / `clearTokens`
- [ ] `QueryProvider` com `TanStack Query`
- [ ] Fontes configuradas: Playfair Display (display) + Plus Jakarta Sans (sans)
- [ ] Paleta de cores da marca no `tailwind.config.ts`
- [ ] Landing page com navbar, hero, features, stats, parcerias, CTA, footer
- [ ] `AnimateOnScroll` com `IntersectionObserver`

### Infraestrutura

- [ ] `docker-compose.yml` com postgres, api, web
- [ ] Credenciais do banco via env vars (não hardcoded)
- [ ] Healthcheck no container do postgres
- [ ] `depends_on` com `condition: service_healthy` na api

---

Stack completa com versões fixas e justificativa de cada escolha
Monorepo — estrutura de pastas, turbo.json, scripts raiz, regras de dependência entre pacotes
Backend — main.ts obrigatório, padrão de módulo, controller/service/DTO
Frontend — App Router, middleware com bug do startsWith('/') já corrigido, lib/api.ts, lib/auth.ts
Autenticação — fluxo completo (login → refresh → logout → forgot/reset), JWT payload mínimo, segredos sem fallback
Segurança — checklist de 20+ itens (helmet, throttle, brute force, hidden fields, sessionStorage, USER node, etc.)
Banco — padrão de entidade, migrations, seed, hidden: true vs ClassSerializerInterceptor
Docker — Dockerfiles multi-stage, compose com healthcheck, credenciais via env
Env vars — .env.example completo, regra NEXT_PUBLIC_* só no frontend, GROQ em apps/api/.env
Audit logging — entidade + serviço + o que auditar no mínimo
Landing page — estrutura de seções, AnimateOnScroll, animação float
Checklist final — ~35 itens para copiar em qualquer projeto novo

*Documento gerado a partir do projeto SuperPão — junho de 2026.*
*Atualizar este documento sempre que uma decisão arquitetural relevante for tomada.*
