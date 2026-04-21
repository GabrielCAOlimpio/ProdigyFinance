# 📄 PRD — Prodigy Finance (MVP)

---

## 🧠 1. Visão do Produto

**Nome:** Prodigy Finance

**Objetivo:** Permitir que usuários acompanhem sua vida financeira de forma simples, visual e acionável — entendendo claramente para onde o dinheiro vai, de onde vem e como melhorar o controle.

**Proposta de valor:** *"Controle seu dinheiro em segundos, sem complicação."*

**Diferenciais do MVP:**
- Simplicidade extrema (menos fricção que planilhas)
- Visual direto com dashboard claro
- Estrutura preparada para evolução com IA

---

## 👤 2. Público-Alvo

**Segmento principal:** Jovens e adultos (18–35 anos), renda baixa a média, pouca organização financeira.

**Problemas que resolve:**
- Não sabem quanto gastam por categoria
- Não controlam entradas vs saídas
- Acham planilhas difíceis

---

## 🎯 3. Escopo do MVP

### 🔐 Autenticação (Supabase Auth)
- Cadastro (email + senha)
- Login / Logout
- Persistência de sessão
- Recuperação de senha *(MVP+)*

### 💰 Transações (CORE)

**Criar transação**

| Campo | Tipo | Regra |
|---|---|---|
| `title` | string | obrigatório |
| `amount` | number | positivo |
| `type` | `"income"` \| `"expense"` | obrigatório |
| `category` | string | obrigatório |
| `date` | date | obrigatório |

**Listar transações**
- Ordenação: data desc
- Filtros: tipo, categoria, intervalo de datas
- Paginação *(MVP+)*

**Atualizar transação**
- Todos os campos editáveis
- Validação de integridade

**Deletar transação**
- Hard delete no MVP
- Soft delete no futuro

### 📂 Categorias

**MVP (fixas):** Alimentação · Transporte · Moradia · Lazer · Outros

**Pós-MVP:** CRUD de categorias personalizadas

### 📊 Dashboard

**Métricas principais:**
- Saldo total
- Total de entradas (mês atual)
- Total de gastos (mês atual)

**Componentes:**
- Cards de resumo
- Lista de transações recentes (últimas 5–10)
- Gráfico de gastos por categoria (Recharts)

### ⚡ Input Inteligente (IA Ready)

> Exemplo: *"gastei 30 no mercado"* → `amount: 30 | type: expense | category: Alimentação`

- **MVP:** entrada manual
- **Futuro:** parsing com IA

---

## 🛠️ 4. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js (App Router) |
| Linguagem | TypeScript (strict) |
| UI | Tailwind CSS + shadcn/ui |
| Banco | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Deploy | Vercel |
| IDE | Cursor |

---

## 🧱 5. Modelagem de Dados

### `users` *(Supabase Auth)*
| Campo | Tipo |
|---|---|
| `id` | uuid |
| `email` | text |
| `created_at` | timestamp |

### `transactions`
| Campo | Tipo | Regra |
|---|---|---|
| `id` | uuid (PK) | auto |
| `user_id` | uuid (FK) | NOT NULL |
| `title` | text | NOT NULL |
| `amount` | numeric(10,2) | > 0 |
| `type` | text | `'income'` \| `'expense'` |
| `category` | text | NOT NULL |
| `date` | date | NOT NULL |
| `created_at` | timestamp | auto |

---

## 🔐 6. Segurança

- **Row Level Security (RLS)** obrigatório em todas as tabelas
- Policy: `user_id = auth.uid()`
- Nunca confiar em `user_id` vindo do frontend
- Sanitização de inputs em todas as rotas

---

## 🔄 7. Fluxos do Sistema

```
Auth:        User → Supabase → JWT → Sessão

CRUD:        Frontend → API Route → Service → Supabase → DB → Response → UI

Dashboard:   API agrega dados → retorna resumo → UI renderiza
```

---

## 🧠 8. Regras de Negócio

- `amount` sempre positivo
- `type` define a operação: `income` soma, `expense` subtrai
- **Saldo** = Σ incomes − Σ expenses

---

## ⚠️ 9. Edge Cases

| Situação | Tratamento |
|---|---|
| Valor = 0 | Bloquear na validação |
| Datas futuras | Permitir (decisão de produto) |
| Categoria inválida | Fallback para "Outros" |
| ID inexistente na deleção | Retornar 404 sem erro |
| Update simultâneo | Last-write-wins (MVP) |

---

## 🗂️ 10. Estrutura de Código

```
/app
  /dashboard
  /login
  /register
  /transactions
  /api

/components
  /ui
  /charts
  /forms

/lib
  /supabase
  /utils

/services
  transactionService.ts

/types
  transaction.ts
```

---

## 🔌 11. API REST

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/transactions` | Criar transação |
| `GET` | `/api/transactions` | Listar transações |
| `PUT` | `/api/transactions/:id` | Atualizar transação |
| `DELETE` | `/api/transactions/:id` | Deletar transação |

---

## 🎨 12. Telas

- **Auth:** Login, Register
- **Dashboard:** Cards de resumo, lista recente, gráfico
- **Nova transação:** Formulário simples e rápido

---

## ⚡ 13. Performance

- Evitar overfetching
- Queries simples e indexadas
- Server Components onde possível

---

## 📈 14. Métricas de Sucesso

- DAU (usuários ativos diários)
- Transações por usuário
- Retenção D1 / D7

---

## 💰 15. Monetização (Futuro)

- Plano premium
- Insights com IA
- Relatórios avançados exportáveis