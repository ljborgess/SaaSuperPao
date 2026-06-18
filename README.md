# SuperPão

Sistema de gestão para padarias desenvolvido para centralizar operações, otimizar processos e fornecer maior controle sobre estoque, produção, compras e produtos.

O projeto foi construído com foco em escalabilidade, manutenibilidade e performance, utilizando uma arquitetura moderna baseada em monorepo, permitindo a evolução contínua da plataforma e a incorporação de novos módulos conforme as necessidades do negócio.

---

## Visão Geral

O SuperPão tem como objetivo simplificar a gestão operacional de padarias por meio de uma plataforma única e integrada.

A aplicação oferece uma base sólida para controle de produtos, categorias, estoque, produção e processos administrativos, reduzindo a complexidade operacional e aumentando a eficiência das equipes.

---

## Principais Funcionalidades

### Gestão de Produtos

* Cadastro e manutenção de produtos
* Organização por categorias
* Controle de informações comerciais e operacionais

### Controle de Estoque

* Movimentação de entradas e saídas
* Atualização automática de saldos
* Rastreabilidade das operações

### Produção

* Controle de processos produtivos
* Registro de produção realizada
* Integração com movimentação de estoque

### Compras

* Gestão de fornecedores
* Registro e acompanhamento de compras
* Histórico de movimentações

### Gestão de Usuários

* Controle de acesso baseado em perfis
* Permissões granulares por função
* Autenticação segura

### Auditoria

* Registro de ações realizadas no sistema
* Histórico para rastreabilidade e conformidade

---

## Arquitetura

O projeto segue uma arquitetura monorepo organizada para facilitar manutenção, reutilização de código e escalabilidade.

```text
apps/
├── api
└── web

packages/
├── database
├── shared-types
├── shared-utils
├── configs
└── ui

docker/
docs/
```

---

## Stack Tecnológica

### Backend

* NestJS
* MikroORM
* PostgreSQL
* JWT Authentication
* Swagger/OpenAPI

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* TanStack Query
* React Hook Form
* Zod

### Infraestrutura

* Docker
* Docker Compose
* Turborepo
* pnpm

---

## Segurança

A aplicação foi desenvolvida seguindo práticas modernas de segurança:

* Autenticação JWT com Refresh Token
* Controle de acesso baseado em perfis (RBAC)
* Proteção contra tentativas de acesso indevido
* Rate Limiting
* Validação de dados em todas as camadas
* Auditoria de operações
* Gerenciamento seguro de credenciais

---

## Execução do Projeto

### Instalação

```bash
pnpm install
```

### Configuração

```bash
cp .env.example .env
```

### Banco de Dados

```bash
docker compose up -d postgres
```

### Migrations

```bash
pnpm db:migrate
```

### Seed

```bash
pnpm db:seed
```

### Ambiente de Desenvolvimento

```bash
pnpm dev
```

---

## Roadmap

Funcionalidades planejadas para versões futuras:

* Relatórios avançados
* Dashboards analíticos
* Integração com Inteligência Artificial
* Indicadores operacionais em tempo real
* Gestão financeira
* Aplicação mobile

---

## Objetivo

O SuperPão busca fornecer uma solução moderna para gestão de padarias, combinando tecnologia, segurança e escalabilidade para apoiar o crescimento sustentável do negócio.

---

## Licença

Este projeto está licenciado sob a licença MIT.
