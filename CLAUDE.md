# SuperPão — Escopo e Arquitetura (Monorepo)

## Visão Geral

Sistema de gestão para padarias focado em:
- Controle de produtos
- Estoque e movimentações
- Produção com fichas técnicas
- Compras de insumos
- Clientes e fornecedores
- Auditoria completa
- Dashboard operacional

Monorepo escalável preparado para evolução futura com IA.

## Arquitetura do Projeto

```
superpao/
apps/
├── api/                      # Backend NestJS
├── web/                      # Frontend Next.js

packages/
├── database/                 # MikroORM config + entities + migrations
├── shared-types/             # Tipagens globais
├── shared-utils/             # Utils reutilizáveis
├── ui/                       # Design system (components)
├── configs/                  # ESLint, TSConfig, Prettier

docker/
├── postgres/
├── api/
└── web/

docs/
```

## Stack Tecnológica

**Backend**
- NestJS 11, TypeScript
- MikroORM + PostgreSQL 15
- JWT Authentication, Passport, Bcrypt
- Nodemailer + Handlebars
- Swagger/OpenAPI

**Frontend**
- Next.js 15, React 19, TypeScript
- TailwindCSS + Shadcn/UI
- TanStack Query, React Hook Form, Zod

**Infra & Dev**
- pnpm Workspaces + Turborepo
- Docker + Docker Compose
- GitHub Actions

## Estrutura Backend (NestJS)

```
apps/api/src/
modules/
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
├── ai/                 # preparado para futuro

common/
├── decorators/
├── guards/
├── interceptors/
├── filters/
├── dto/

database/
├── entities/
├── migrations/
├── seeders/
```

## Entidades (MikroORM)

- User, Role
- Client, Supplier
- Category, Product, Ingredient
- Recipe, RecipeItem
- Purchase, PurchaseItem
- StockMovement
- ProductionOrder, ProductionOrderItem
- EmailLog, AuditLog

## Módulo de Autenticação

- Login com JWT + Refresh Token + Logout
- Recuperação de senha
- Roles: Admin, Manager, Operator

## Módulos Principais

**Usuários** — CRUD: nome, email, senha, role, status

**Clientes** — CRUD: nome, CPF/CNPJ, telefone, WhatsApp, email, endereço

**Fornecedores** — Razão social, nome fantasia, CNPJ, contato, endereço

**Produtos** — Nome, código, categoria, unidade, preço de custo/venda, margem, status

**Estoque** — Entrada (compra/produção), saída (venda/perda/uso interno), ajustes manuais. Toda movimentação gera histórico auditado.

**Produção** — Fichas técnicas (receitas) com baixa automática de insumos e entrada automática de produto final.

**Compras** — Registro com vinculação de fornecedor e atualização automática de estoque.

**Emails** — Templates Handlebars: recuperação de senha, boas-vindas, alertas de estoque, notificações operacionais.

**Dashboard** — Produtos mais produzidos, estoque baixo, compras do mês, produção diária, custos gerais.

**Auditoria** — Registra login, criação, edição, exclusão e movimentações. Campos: usuário, ação, entidade, data, payload.

## Módulo de IA (Futuro)

Estrutura criada em `modules/ai/` com subdiretórios application, domain, infrastructure, providers.

Funcionalidades planejadas: relatórios inteligentes, previsão de demanda, sugestão de produção/compras, análise de desperdício, chat operacional.

## Escopo MVP

Incluído: autenticação JWT, usuários e permissões, clientes, fornecedores, produtos, estoque completo, compras, produção com fichas técnicas, auditoria, emails transacionais, dashboard básico.

Fora do MVP (futuro): IA, app mobile, PDV, multiempresa (SaaS), integração com balança, relatórios avançados.

## Objetivo Final

Sistema modular e escalável pronto para virar SaaS, com base em NestJS + MikroORM, Next.js + React, Turborepo e arquitetura preparada para IA.
