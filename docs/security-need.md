Ready for review
Select text to add comments on the plan
Plano: Security Review — SuperPão
Contexto
O usuário quer um relatório completo de segurança do projeto SuperPão focado em:

Vazamento de dados (respostas da API, campos sensíveis)
Controle de acesso (roles, guards, autorização)
Qualquer outro tipo de exposição indevida
O resultado deve ser um arquivo .md dentro da pasta docs/ do projeto.

O que será criado
Arquivo: c:\Users\User\Documents\superpao\docs\security-review.md

A pasta docs/ não existe — será criada junto com o arquivo.

Estrutura do documento
O relatório será organizado em seções com severidade clara (CRÍTICO / ALTO / MÉDIO / BAIXO), cada item com:

Arquivo(s) afetado(s) com linha exata
Descrição do problema
Impacto real
Recomendação de correção
Seções planejadas
Resumo Executivo — tabela de contagem por severidade
CRÍTICO — itens que exigem ação imediata
ALTO — vulnerabilidades sérias a corrigir esta semana
MÉDIO — melhorias importantes mas sem urgência imediata
BAIXO / Boas Práticas — hardening adicional
Plano de Ação — checklist priorizado
Vulnerabilidades encontradas (resumo por categoria)
CRÍTICO (2)
#	Problema	Arquivo
C1	Fallback de segredos JWT fracos ('secret', 'refresh-secret') se env não configurada	auth.module.ts:21, auth.service.ts:32,73, jwt.strategy.ts:14
C2	password, refreshToken e passwordResetToken expostos nas respostas da API — ClassSerializerInterceptor não está configurado globalmente, e as entidades não têm @Exclude() do class-transformer	user.entity.ts, main.ts, users.controller.ts
ALTO (5)
#	Problema	Arquivo
A1	Tokens JWT e refreshToken armazenados no localStorage (vulnerável a XSS)	apps/web/src/lib/auth.ts:14-18
A2	Nenhum middleware Helmet configurado (sem headers de segurança: CSP, X-Frame-Options, HSTS, etc.)	apps/api/src/main.ts
A3	Sem rate limiting em nenhum endpoint — brute force em login, enumeração em forgot-password	auth.controller.ts, nenhum ThrottlerModule
A4	Endpoints de clients e suppliers sem @Roles() — qualquer usuário autenticado cria/edita/apaga clientes e fornecedores	clients.controller.ts, suppliers.controller.ts
A5	CORS com fallback para localhost:3000 quando WEB_URL não está definida + credentials: true	apps/api/src/main.ts:11
MÉDIO (7)
#	Problema	Arquivo
M1	passwordResetToken armazenado em texto plano no banco — deve ser hasheado	user.entity.ts:40-43
M2	Sem proteção de força bruta / bloqueio de conta após N tentativas de login	auth.service.ts:20-26
M3	Endpoint de refresh token sem guard — aceita qualquer string sem autenticação prévia	auth.controller.ts:30-34
M4	ValidationPipe sem forbidNonWhitelisted: true — campos extras ignorados silenciosamente	main.ts:13
M5	Containers Docker rodando como root (sem diretiva USER node)	docker/api/Dockerfile, docker/web/Dockerfile
M6	Dashboard e inventory sem restrição de roles — qualquer autenticado acessa métricas do negócio	dashboard.controller.ts, inventory.controller.ts
M7	Falhas de login não são logadas no audit trail — apenas sucessos	auth.service.ts
BAIXO (4)
#	Problema	Arquivo
B1	Payload do JWT contém email (informação desnecessária, exposta em logs HTTP)	auth.service.ts:29
B2	Exception filter pode vazar detalhes internos em produção	http-exception.filter.ts:10
B3	Credenciais fracas no Docker Compose (superpao:superpao)	docker/docker-compose.yml:9-11
B4	NEXT_PUBLIC_APP_URL usado no backend (email service) — env var de frontend usada no servidor	email.service.ts:55
Arquivos a ler antes de escrever (para confirmar linhas exatas)
apps/api/src/main.ts
apps/api/src/modules/auth/auth.module.ts
apps/api/src/modules/auth/auth.service.ts
apps/api/src/modules/auth/auth.controller.ts
apps/api/src/modules/auth/strategies/jwt.strategy.ts
apps/web/src/lib/auth.ts
packages/database/src/entities/user.entity.ts
apps/api/src/modules/clients/clients.controller.ts
apps/api/src/modules/suppliers/suppliers.controller.ts
apps/api/src/modules/dashboard/dashboard.controller.ts
docker/docker-compose.yml
docker/api/Dockerfile
Verificação
Após criação do arquivo:

Abrir docs/security-review.md no editor e confirmar que está legível e completo
Verificar que todos os caminhos de arquivo citados existem no projeto