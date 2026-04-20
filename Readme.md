# 💰 Finance Tracker

> Controle seu dinheiro em segundos, sem complicação.

![Finance Tracker](https://img.shields.io/badge/Finance-Tracker-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 📌 Sobre o Projeto

O **Finance Tracker** é uma aplicação web de controle financeiro pessoal desenvolvida para ajudar usuários a acompanhar receitas e despesas de forma simples, visual e acionável.

Com uma interface moderna inspirada em sistemas de gamificação (como o Duolingo), o app incentiva o usuário a registrar suas finanças diariamente através de um sistema de **ofensiva (streak)** — recompensando a consistência.

### ✨ Funcionalidades

- 🔐 **Autenticação completa** — cadastro, login, logout e recuperação de senha via Supabase Auth
- 💰 **Gestão de transações** — criação, listagem e exclusão de receitas e despesas
- 📊 **Dashboard visual** — cards de resumo, gráfico de pizza interativo e resumo mensal
- 🔥 **Sistema de streak** — ofensiva de dias consecutivos com transações registradas
- 👤 **Perfil completo** — foto de perfil, edição de nome, email e senha
- 🌙 **Tema claro/escuro** — toggle de tema com persistência
- 📱 **Responsivo** — funciona em mobile, tablet e desktop
- 🔒 **Segurança** — Row Level Security (RLS) no banco de dados

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript (strict) |
| UI | Tailwind CSS + shadcn/ui |
| Animações | Framer Motion |
| Gráficos | Recharts |
| Banco de dados | PostgreSQL via Supabase |
| Autenticação | Supabase Auth |
| Storage | Supabase Storage (avatares) |
| Deploy | Vercel |

---

## 📁 Estrutura do Projeto

```
FinanceTracker/
├── app/
│   ├── api/
│   │   ├── incomes/          # CRUD de receitas
│   │   ├── expenses/         # CRUD de despesas
│   │   └── stats/            # Estatísticas gerais
│   ├── dashboard/            # Página principal
│   ├── login/                # Autenticação
│   ├── register/             # Cadastro
│   ├── perfil/               # Perfil do usuário
│   ├── configuracoes/        # Configurações
│   └── transactions/new/     # Nova transação
│
├── components/
│   ├── dashboard/
│   │   ├── header.tsx
│   │   ├── greeting.tsx
│   │   ├── summary-cards.tsx
│   │   ├── transaction-list.tsx
│   │   ├── expense-chart.tsx
│   │   ├── monthly-summary.tsx
│   │   └── add-transaction-fab.tsx
│   └── ui/                   # Componentes shadcn/ui
│
├── hooks/
│   └── use-transactions.ts   # Hook de transações
│
├── lib/
│   ├── auth/
│   │   └── api-route.ts      # Guard de autenticação
│   ├── supabase/
│   │   └── server.ts         # Cliente Supabase servidor
│   ├── categories.ts         # Categorias e labels
│   ├── env.ts                # Variáveis de ambiente
│   └── utils.ts
│
├── services/
│   ├── incomeService.ts      # CRUD receitas
│   └── expenseService.ts     # CRUD despesas
│
├── types/
│   ├── income.ts
│   └── expense.ts
│
├── lib/validations/
│   ├── income.ts             # Schema Zod
│   └── expense.ts
│
└── middleware.ts             # Proteção de rotas
```

---

## 🗄️ Banco de Dados

### Tabelas

```sql
-- Receitas
CREATE TABLE incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Despesas
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_incomes" ON incomes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_expenses" ON expenses FOR ALL USING (auth.uid() = user_id);
```

### Categorias

**Receitas:** `salario` · `freelance` · `investimentos` · `presente` · `outros`

**Despesas:** `alimentacao` · `transporte` · `moradia` · `lazer` · `saude` · `educacao` · `shopping` · `outros`

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/GabrielCAOlimpio/FinanceTracker.git
cd FinanceTracker
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

> Encontre essas chaves em: **Supabase → Project Settings → API**

### 4. Configure o banco de dados

No **Supabase → SQL Editor**, execute o SQL da seção [Banco de Dados](#-banco-de-dados) acima.

### 5. Configure o Storage (avatares)

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

### 6. Inicie o servidor

```bash
npm run dev
```

Acesse **http://localhost:3000**

---

## 🌐 Deploy (Vercel)

1. Suba o projeto no GitHub
2. Acesse [vercel.com](https://vercel.com) e conecte o repositório
3. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**

---

## 🔐 Segurança

- Todas as tabelas possuem **Row Level Security (RLS)** ativado
- Cada usuário acessa **apenas seus próprios dados**
- O `user_id` nunca é confiado pelo frontend — sempre verificado via `auth.uid()` no banco
- Variáveis sensíveis ficam apenas no `.env.local` (nunca commitadas)
- Middleware de autenticação protege todas as rotas privadas

---

## 📈 Roadmap

- [ ] Editar e deletar transações
- [ ] Filtros avançados por período
- [ ] Exportar relatório em PDF
- [ ] Metas financeiras mensais
- [ ] Input inteligente com IA ("gastei 30 no mercado")
- [ ] Notificações de gastos excessivos
- [ ] Versão mobile (React Native)

---

## 📄 Licença e Direitos Autorais

```
Copyright (c) 2026 Gabriel C. A. Olimpio — ProdigyTech

Todos os direitos reservados.

Este software e seu código-fonte são propriedade exclusiva de Gabriel C. A. Olimpio.
É proibida a reprodução, distribuição, modificação ou uso comercial deste projeto
sem autorização expressa e por escrito do autor.

Este projeto foi desenvolvido para fins pessoais e comerciais pelo autor.
O uso não autorizado deste código para criação de produtos derivados,
redistribuição ou venda é estritamente proibido.

Para licenciamento ou parcerias, entre em contato:
→ github.com/GabrielCAOlimpio
```

---

<div align="center">
  <p>Feito com 💚 por <strong>Gabriel C. A. Olimpio</strong></p>
  <p>
    <a href="https://github.com/GabrielCAOlimpio">GitHub</a>
  </p>
</div>