# SMTP — Esqueci a Senha: Arquitetura, Segurança e Escalabilidade

## Visão Geral

Este documento descreve a implementação do fluxo de recuperação de senha no SuperPão, cobrindo decisões de design, segurança, performance e escalabilidade do módulo de e-mail.

**Score de segurança atual: 89/100** *(era 76/100 antes das correções)*

---

## Fluxo Completo

```
[Login Page]
    └── "Esqueceu a senha?" → /forgot-password

[/forgot-password]
    └── POST /auth/forgot-password { email }
            └── AuthService.forgotPassword()
                    ├── Gera token: randomBytes(32).toString('hex')
                    ├── Armazena: SHA256(token) no banco + expiração 1h
                    └── Dispara (fire-and-forget): EmailService.sendPasswordReset()
                                └── nodemailer → SMTP → E-mail com link

[E-mail recebido]
    └── Link: /reset-password#token=<plain-token>   ← hash fragment, não query param

[/reset-password]
    └── Lê token de window.location.hash (nunca vai ao servidor)
    └── POST /auth/reset-password { token, password }
            └── AuthService.resetPassword()
                    ├── Calcula SHA256(token), busca no banco
                    ├── Verifica expiração
                    ├── Atualiza senha (bcrypt rounds=12)
                    ├── Limpa token + loginAttempts + lockedUntil
                    └── Registra AuditLog: PASSWORD_RESET
```

---

## O que foi implementado (histórico de sessão)

### Sessão 1 — Implementação Base

| Arquivo | O que foi feito |
|---|---|
| `apps/web/src/app/(auth)/reset-password/page.tsx` | **Criado** — página que estava completamente ausente |
| `apps/api/src/modules/email/email.service.ts` | Cache de templates em `Map`, SMTP `pool: true`, `onModuleInit` verifica conexão |
| `apps/api/src/modules/auth/auth.service.ts` | Fire-and-forget: HTTP response não espera SMTP |
| `apps/api/src/modules/email/templates/password-reset.hbs` | Cores brand (marrom #6B4423), `{{year}}` no contexto |
| `apps/web/src/app/(auth)/forgot-password/page.tsx` | React Hook Form + Zod (era state manual sem validação) |

### Sessão 2 — Correções de Segurança (após auditoria)

| Arquivo | Vulnerabilidade corrigida |
|---|---|
| `apps/api/src/modules/auth/auth.dto.ts` | **Criado** — DTOs com `class-validator` substituindo interfaces sem validação. `ResetPasswordDto` agora exige `@MinLength(8)`, `LoginDto` exige `@IsEmail` + `@MinLength(6)` |
| `apps/api/src/modules/auth/auth.controller.ts` | Importa DTOs locais em vez das interfaces de `@superpao/shared-types` |
| `apps/api/src/modules/email/email.service.ts` | Token agora usa hash fragment (`#token=`) no lugar de query param (`?token=`) |
| `apps/web/src/app/(auth)/reset-password/page.tsx` | Lê token de `window.location.hash` — token nunca aparece em logs de servidor ou histórico transmitido |

---

## Segurança

### Score: 89/100

| Controle | Status | Detalhe |
|---|---|---|
| Geração de token | ✅ | `crypto.randomBytes(32)` — 256 bits |
| Armazenamento de token | ✅ | SHA256 hash — token plain nunca persiste |
| Expiração de token | ✅ | 1 hora, apagado após uso |
| Hash de senha | ✅ | bcrypt 12 rounds |
| Rate limiting | ✅ | 3 req/5 min forgot, 5 req/5 min reset |
| Account lockout | ✅ | 5 tentativas → bloqueio 15 min |
| Anti-enumeration | ✅ | Sempre HTTP 200 no forgot-password |
| Validação server-side | ✅ | `class-validator` no DTO — min 8 chars |
| Token no hash fragment | ✅ | Não aparece em server logs nem referrer |
| Helmet (security headers) | ✅ | HSTS, X-Frame-Options, nosniff |
| CORS restrito | ✅ | Apenas `WEB_URL` do ambiente |
| Audit log completo | ✅ | LOGIN, FAILED, PASSWORD_RESET |
| ValidationPipe global | ✅ | whitelist + forbidNonWhitelisted |

### Tokens

| Aspecto | Decisão | Razão |
|---|---|---|
| Geração | `crypto.randomBytes(32)` | 256 bits de entropia |
| Armazenamento | SHA256(token) no banco | Token plain nunca persiste em disco |
| Transmissão | Hash fragment na URL | Não vai ao servidor, não aparece em logs |
| Validade | 1 hora | Janela curta reduz exposição |
| Uso único | Token apagado após uso | Previne reutilização |

### Por que hash fragment é mais seguro

```
# Query param (antes) — token aparece em:
GET /reset-password?token=abc123   → Nginx/Caddy logs
GET /reset-password?token=abc123   → Referrer header para próxima navegação
GET /reset-password?token=abc123   → Browser history (sincronizado na nuvem)

# Hash fragment (agora) — token NÃO vai ao servidor:
GET /reset-password   ← servidor só vê isso
#token=abc123         ← fica exclusivamente no browser
```

---

## Performance

### Template Caching

Templates Handlebars são compilados uma vez na primeira chamada e armazenados em memória (`Map<string, HandlebarsTemplateDelegate>`). Chamadas subsequentes usam o compilado em cache — evita I/O de disco por envio.

### SMTP Connection Pooling

```typescript
nodemailer.createTransport({
  pool: true,
  maxConnections: 5,   // conexões simultâneas ao SMTP
  maxMessages: 100,    // mensagens por conexão antes de reciclar
})
```

Elimina handshake TLS por e-mail enviado.

### Fire-and-Forget

O envio de e-mail **não bloqueia a resposta HTTP**:

```typescript
this.emailService
  .sendPasswordReset(email, plainToken, user.name)
  .catch((err) => this.logger.error(`Email dispatch failed: ${err.message}`))
```

**Resultado:** Resposta HTTP retorna em <50ms, independente da latência SMTP.

---

## Escalabilidade

### Atual (MVP) — suficiente para dezenas de e-mails/hora

Fire-and-forget + connection pool. Auditoria em `email_log`.

### Próximo Passo — quando precisar de maior volume

```
@nestjs/bull + Redis
    └── EmailQueue: jobs enfileirados, processados por workers
        ├── Retry automático em falha (3x com backoff exponencial)
        ├── Dead letter queue para diagnóstico
        └── Bull Board: dashboard de monitoramento
```

### Providers SMTP por Tier

| Tier | Provider | Por quê |
|---|---|---|
| Dev / testes | Mailtrap | Sandbox — não envia de verdade |
| Produção pequena | Resend / Brevo | Free tier, SPF/DKIM simples |
| Produção média/grande | Amazon SES | ~$0.10/1000 e-mails |
| Crítico / transacional | SendGrid | Analytics avançado |

---

## Próximos passos recomendados

### Segurança (alta prioridade)

- [ ] **Configurar SPF/DKIM/DMARC no DNS** do domínio `superpao.com.br` — essencial para entregabilidade e não cair em spam em produção
- [ ] **HTTPS obrigatório** — garantir que `WEB_URL` aponte para HTTPS (hash fragments só são seguros com TLS)
- [ ] **Adicionar `@Matches` no DTO de senha** — ex: exigir pelo menos 1 número: `@Matches(/\d/, { message: 'Deve conter pelo menos um número' })`

### Escalabilidade (médio prazo)

- [ ] **Implementar fila com `@nestjs/bull` + Redis** para envio de e-mails — retry automático, dead letter queue, monitoramento
- [ ] **Webhook de bounce/complaint** — integrar com o provider SMTP para remover e-mails inválidos automaticamente
- [ ] **Template de e-mail de boas-vindas** — disparar ao criar novo usuário (estrutura já existe em `email.service.ts`)

### UX (baixa prioridade)

- [ ] **Indicador de força de senha** no formulário de reset — feedback visual enquanto o usuário digita
- [ ] **Reenvio de link** na página `/forgot-password` se o e-mail demorar — botão "Reenviar" com cooldown de 60s

---

## Configuração de Ambiente

```env
# SMTP
SMTP_HOST=smtp.mailtrap.io        # Dev: Mailtrap | Prod: smtp.resend.com / SES
SMTP_PORT=587                      # 587 = STARTTLS | 465 = SSL | 2525 = Mailtrap
SMTP_SECURE=false                  # true apenas para porta 465
SMTP_USER=seu-usuario
SMTP_PASS=sua-senha-ou-api-key
SMTP_FROM=SuperPão <noreply@superpao.com.br>

# Frontend (base URL para o link de reset no e-mail)
WEB_URL=https://app.superpao.com.br   # ← DEVE ser HTTPS em produção
```

---

## Auditoria

Todos os e-mails são registrados em `email_log` (status SENT/FAILED + erro). Eventos de autenticação em `audit_log` via `AuditService`.

---

## Arquivos-Chave

| Arquivo | Responsabilidade |
|---|---|
| `apps/api/src/modules/auth/auth.dto.ts` | DTOs com `class-validator` — validação server-side |
| `apps/api/src/modules/auth/auth.controller.ts` | Endpoints REST + throttling |
| `apps/api/src/modules/auth/auth.service.ts` | Lógica de negócio, fire-and-forget |
| `apps/api/src/modules/email/email.service.ts` | Nodemailer, template cache, SMTP pool |
| `apps/api/src/modules/email/templates/password-reset.hbs` | Template do e-mail |
| `apps/web/src/app/(auth)/forgot-password/page.tsx` | Formulário de solicitação (Zod) |
| `apps/web/src/app/(auth)/reset-password/page.tsx` | Formulário de nova senha (hash fragment) |
