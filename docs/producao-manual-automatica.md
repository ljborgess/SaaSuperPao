# Produção Manual vs Automática — Análise e Plano de Implementação

> **Data:** Junho 2026  
> **Escopo:** Módulo de Produção (`apps/api/src/modules/production/`)  
> **Objetivo:** Suportar dois modos de registro de produção — automático (baseado em receita) e manual (consumo real informado pelo operador)

---

## 1. Diagnóstico: O Que Já Existe

O módulo de produção está bem estruturado. Antes de implementar qualquer coisa, é importante entender o que já funciona:

### Fluxo atual (modo automático implícito)

```
POST /api/production          → Cria ordem (PENDING)
                                  ↓ escala ingredientes da receita
PATCH /api/production/:id/complete → Conclui ordem
                                  ↓ deduz requiredQty de cada ingrediente
                                  ↓ adiciona produto ao estoque
                                  ↓ gera StockMovements (audit trail)
```

### Entidades relevantes já existentes

| Entidade | Campo crítico | Observação |
|---|---|---|
| `ProductionOrder` | `status`, `quantity`, `recipe` | Já suporta ciclo de vida completo |
| `ProductionOrderItem` | `requiredQty`, `consumedQty` | **`consumedQty` já existe no schema mas não é usado** |
| `Recipe` / `RecipeItem` | `yieldQty`, `quantity` por ingrediente | Base do escalonamento automático |
| `StockMovement` | `type`, `reason`, `referenceId` | Audit trail completo já funciona |

### O que o `complete()` faz hoje

```typescript
// production.service.ts — complete()
for (const item of order.items) {
  // usa requiredQty (calculado da receita na criação)
  ingredient.currentStock -= item.requiredQty;
  // cria StockMovement com reason: PRODUCTION
}
// adiciona order.quantity ao product.currentStock
```

**Conclusão:** O modo automático já está 80% implementado. O `consumedQty` foi planejado mas nunca conectado à lógica de dedução.

---

## 2. O Que Está Faltando

### Gap 1 — Modo Manual não funciona
O campo `consumedQty` existe em `ProductionOrderItem` mas:
- Nenhum endpoint permite preenchê-lo antes do `complete()`
- O `complete()` ignora `consumedQty` e sempre usa `requiredQty`

### Gap 2 — Sem distinção de modo na ordem
A `ProductionOrder` não tem campo `mode` para indicar se ela é `AUTOMATIC` ou `MANUAL`. Isso impede lógica condicional no `complete()`.

### Gap 3 — Sem validação de completude do modo manual
No modo manual, o `complete()` deve validar que todos os `consumedQty` foram preenchidos antes de aceitar a conclusão.

### Gap 4 — Sem relatório de variância (receita vs real)
Para análise de custo real de produção, é necessário comparar `requiredQty` com `consumedQty` e calcular a diferença (desperdício ou economia).

---

## 3. Vale a Pena?

**Sim. É uma das funcionalidades de maior valor para o negócio de padaria/confeitaria.** Os motivos:

### 3.1 Receita vs Realidade

Em produção artesanal, o consumo real raramente é igual à receita:
- Forno com temperatura incorreta → produto falha → refaz usando mais ingredientes
- Medição por volume (copo, colher) vs peso tem variação natural
- Desperdício durante preparo (massa grudada na batedeira, etc.)

Sem isso, o **CMV (Custo da Mercadoria Vendida) fica impreciso** e a margem de lucro é fictícia.

### 3.2 Exemplo concreto

| Situação | Com modo automático | Com modo manual |
|---|---|---|
| Fiz 1 bolo (receita: 10 ovos) | Sistema deduz 10 ovos | Operador informa: usei 12 (quebrei 2) |
| Fiz 50 pães (receita: 2kg farinha) | Sistema deduz 2kg | Operador informa: usei 2,3kg (forno seco) |
| CMV calculado | R$ 8,00 (irreal) | R$ 9,60 (real) |

### 3.3 Análise de viabilidade técnica

| Critério | Avaliação |
|---|---|
| Esforço backend | **Baixo** — campo `consumedQty` já existe, só falta conectar |
| Esforço banco de dados | **Mínimo** — apenas um campo `mode` na `ProductionOrder` |
| Risco de regressão | **Baixo** — modo automático existente não é afetado se mantiver default |
| Valor para o usuário | **Alto** — controle real de custo de produção |

**Estimativa de implementação:** 1–2 dias de desenvolvimento backend + frontend para o fluxo de preenchimento manual.

---

## 4. Arquitetura Recomendada

### 4.1 Enum de modo

```typescript
// packages/database/src/enums/production-mode.enum.ts
export enum ProductionMode {
  AUTOMATIC = 'AUTOMATIC',  // usa requiredQty (receita escalada)
  MANUAL    = 'MANUAL',     // usa consumedQty (informado pelo operador)
}
```

### 4.2 Alteração na entidade `ProductionOrder`

```typescript
// Adicionar campo:
@Property({ default: 'AUTOMATIC' })
mode: ProductionMode = ProductionMode.AUTOMATIC;
```

### 4.3 Novo endpoint para registrar consumo real

```
PATCH /api/production/:id/consumption
Body: { items: [{ ingredientId: string, consumedQty: number }] }
Regra: Só funciona em ordens com mode=MANUAL e status=PENDING|IN_PROGRESS
```

### 4.4 Lógica atualizada do `complete()`

```typescript
async complete(id: string, userId: string) {
  const order = await this.findOne(id);

  if (order.mode === ProductionMode.MANUAL) {
    // Valida que todos os itens têm consumedQty preenchido
    const hasUnfilled = order.items.some(i => i.consumedQty == null);
    if (hasUnfilled) {
      throw new BadRequestException(
        'Modo manual: preencha o consumo real de todos os ingredientes antes de concluir'
      );
    }
  }

  for (const item of order.items) {
    // Usa consumedQty se manual, requiredQty se automático
    const qty = order.mode === ProductionMode.MANUAL
      ? item.consumedQty
      : item.requiredQty;

    if (ingredient.currentStock < qty) {
      throw new BadRequestException(`Estoque insuficiente: ${ingredient.name}`);
    }

    ingredient.currentStock -= qty;

    // StockMovement com referência à ordem
    await this.inventoryService.createMovement({
      type: MovementType.OUT,
      reason: MovementReason.PRODUCTION,
      ingredientId: ingredient.id,
      quantity: qty,
      referenceId: order.id,
      referenceType: 'PRODUCTION',
    });
  }

  order.status = ProductionStatus.COMPLETED;
  order.completedAt = new Date();
  // ... adicionar produto ao estoque
}
```

### 4.5 Diagrama de fluxo completo

```
                    ┌─────────────────────────────┐
                    │   POST /api/production       │
                    │   { productId, quantity,      │
                    │     mode: AUTOMATIC|MANUAL }  │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │   Cria ProductionOrder       │
                    │   Escala ingredientes        │
                    │   → ProductionOrderItems     │
                    │     requiredQty = escalado   │
                    │     consumedQty = null       │
                    └────────────┬────────────────┘
                                 │
               ┌─────────────────┴──────────────────┐
               │ AUTOMATIC                           │ MANUAL
               │                                    │
               ▼                                    ▼
  ┌────────────────────────┐         ┌─────────────────────────────┐
  │ PATCH /:id/complete    │         │ PATCH /:id/consumption       │
  │ Deduz requiredQty      │         │ Operador informa consumo real│
  │ Gera StockMovements    │         │ consumedQty = [12, 2.3, ...]│
  └────────────────────────┘         └───────────┬─────────────────┘
                                                  │
                                     ┌────────────▼────────────────┐
                                     │ PATCH /:id/complete          │
                                     │ Valida consumedQty preenchido│
                                     │ Deduz consumedQty            │
                                     │ Gera StockMovements          │
                                     └─────────────────────────────┘
```

---

## 5. Plano de Implementação Passo a Passo

### Passo 1 — Enum e migração de banco (30min)

1. Criar `ProductionMode` enum em `packages/database/src/enums/`
2. Adicionar `mode` column em `ProductionOrder` com default `AUTOMATIC`
3. Gerar migração MikroORM: `pnpm --filter @superpao/database migration:create`

### Passo 2 — DTO atualizado (20min)

```typescript
// CreateProductionOrderDto — adicionar:
@IsEnum(ProductionMode)
@IsOptional()
mode?: ProductionMode = ProductionMode.AUTOMATIC;
```

### Passo 3 — Novo endpoint de consumo (1h)

Criar método `updateConsumption(id, dto, userId)` no `ProductionService`:
- Busca a ordem pelo id
- Valida status: apenas PENDING ou IN_PROGRESS
- Valida mode: apenas MANUAL
- Para cada item no dto, atualiza `consumedQty` no `ProductionOrderItem`

DTO:
```typescript
class UpdateConsumptionDto {
  @IsArray()
  items: { ingredientId: string; consumedQty: number }[];
}
```

Controller:
```
PATCH /api/production/:id/consumption
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
```

### Passo 4 — Atualizar `complete()` (1h)

- Adicionar lógica condicional `mode === MANUAL` → usa `consumedQty`
- Adicionar validação de completude no modo manual
- Garantir que o modo automático continua idêntico (sem regressão)

### Passo 5 — Relatório de variância (opcional, 2h)

Novo endpoint:
```
GET /api/production/:id/variance
Response: {
  items: [{
    ingredient: string,
    requiredQty: number,
    consumedQty: number,
    variance: number,        // consumedQty - requiredQty
    variancePct: number,     // % de desvio
    cost: number             // custo do desvio
  }],
  totalVarianceCost: number
}
```

Útil para análise periódica de eficiência produtiva.

### Passo 6 — Frontend (2h)

No formulário de criação de ordem:
- Adicionar toggle `Modo: Automático / Manual`

Na view de ordem em progresso (modo manual):
- Formulário para preencher consumo real de cada ingrediente
- Botão "Registrar consumo" → chama `PATCH /:id/consumption`
- Só libera "Concluir produção" após consumo preenchido

---

## 6. Exemplos de Uso

### Exemplo 1 — Bolo de chocolate (modo automático)

```
Receita: 1 bolo = 10 ovos + 2L leite + 0,5kg farinha + 0,3kg açúcar
Pedido: fazer 3 bolos

Sistema escala automaticamente:
  - ovos: 30 un
  - leite: 6L
  - farinha: 1,5kg
  - açúcar: 0,9kg

Ao concluir → deduz automaticamente esses valores do estoque
```

### Exemplo 2 — Pão artesanal (modo manual)

```
Receita: 1 receita = 20 pães → 2kg farinha + 0,8L água + 30g fermento
Pedido: fazer 100 pães (scale: 5x)
  requiredQty: farinha=10kg, água=4L, fermento=150g

Operador produz e informa consumo real:
  consumedQty: farinha=10,8kg, água=3,9L, fermento=155g

Ao concluir → deduz consumedQty (real) do estoque
Variância: +0,8kg farinha (+8%), -0,1L água (-2,5%), +5g fermento (+3,3%)
```

### Exemplo 3 — Croissant com falha de fornada

```
Pedido automático: 50 croissants → manteiga: 1,5kg
Forno falhou na primeira fornada → refez tudo

Operador muda para modo manual e informa:
  consumedQty manteiga: 2,8kg (quase o dobro)

StockMovement registra 2,8kg (real) e a variância fica documentada
```

---

## 7. Decisões de Design

| Decisão | Escolha | Alternativa descartada | Motivo |
|---|---|---|---|
| Default de modo | `AUTOMATIC` | `MANUAL` | Não quebra comportamento existente |
| Quando preencher consumo | Antes do `complete()` | Durante | Mais claro para o operador; permite revisão |
| Dedução no modo manual | `consumedQty` (sem fallback) | fallback para `requiredQty` | Falhar explicitamente é melhor que deduzir errado silenciosamente |
| Variância | Endpoint separado | Embutido no `complete()` | Não polui o fluxo principal; consultado sob demanda |

---

## 8. Resumo de Arquivos a Modificar

| Arquivo | Tipo de mudança |
|---|---|
| `packages/database/src/enums/production-mode.enum.ts` | **Criar** — novo enum |
| `packages/database/src/entities/production-order.entity.ts` | **Editar** — adicionar campo `mode` |
| `packages/database/src/migrations/` | **Gerar** — migration do campo `mode` |
| `apps/api/src/modules/production/dto/create-production-order.dto.ts` | **Editar** — adicionar `mode` |
| `apps/api/src/modules/production/dto/update-consumption.dto.ts` | **Criar** — novo DTO |
| `apps/api/src/modules/production/production.service.ts` | **Editar** — `complete()` + novo `updateConsumption()` |
| `apps/api/src/modules/production/production.controller.ts` | **Editar** — novo endpoint `PATCH /:id/consumption` |
| `packages/shared-types/src/production.types.ts` | **Editar** — exportar `ProductionMode` |




## Resumo do que foi feito:

Novos endpoints

PATCH /api/production/:id/consumption   → registra consumo real (modo MANUAL)
GET   /api/production/:id/variance      → relatório receita vs real (pós-conclusão)
Fluxo modo MANUAL
POST /api/production com { mode: "MANUAL", ... } → cria ordem
PATCH /api/production/:id/consumption com { items: [{ ingredientId, consumedQty }] } → operador informa o que usou de verdade (pode chamar N vezes)
PATCH /api/production/:id/complete → valida que todos os ingredientes têm consumedQty, deduz do estoque com os valores reais
GET /api/production/:id/variance → mostra desvio por ingrediente e custo do desperdício
Próximo passo necessário
Rodar a migration no banco:


pnpm --filter @superpao/database migration:up