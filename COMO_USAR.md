# SuperPão — Como rodar

## Pré-requisitos
- Node.js 20+
- pnpm (`npm i -g pnpm`)
- Docker Desktop rodando

---

## 1. Subir o banco de dados (PostgreSQL)

```bash
docker compose -f docker/docker-compose.yml up -d
```

> Banco sobe na porta **5433**. Só precisa fazer isso uma vez (ou após reiniciar o PC).

Verificar se está rodando:
```bash
docker ps
```

---

## 2. Rodar as migrations e seed (primeira vez)

```bash
pnpm db:migrate
pnpm db:seed
```

> Cria as tabelas e insere o usuário admin padrão.
>
> **Login padrão:** `admin@superpao.com` / `admin123`

---

## 3. Rodar a aplicação

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs

---

## Parar tudo

```bash
# Para os servidores: Ctrl+C no terminal

# Para o banco:
docker compose -f docker/docker-compose.yml down
```

---

## Comandos úteis

| Comando | O que faz |
|---|---|
| `pnpm dev` | Sobe API + Web em modo desenvolvimento |
| `pnpm build` | Faz build de todos os pacotes |
| `pnpm db:migrate` | Roda as migrations do banco |
| `pnpm db:seed` | Popula o banco com dados iniciais |
| `pnpm lint` | Lint em todos os pacotes |
| `pnpm type-check` | Verifica tipos TypeScript |

---

## Estrutura rápida

```
superpao/
├── apps/
│   ├── api/        → NestJS (porta 3001)
│   └── web/        → Next.js (porta 3000)
├── packages/
│   ├── database/   → Entidades MikroORM + migrations
│   ├── shared-types/
│   └── shared-utils/
└── docker/
    └── docker-compose.yml
```

