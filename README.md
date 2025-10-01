# RentBrasil - Sistema de Aluguel C2C

Sistema de aluguel de itens entre pessoas (Consumer-to-Consumer) desenvolvido com Next.js, React e TypeScript.

## 🚀 Tecnologias

- **Next.js 14** com App Router
- **React 18** com TypeScript
- **CSS Modules** para estilização
- **Recharts** para gráficos no dashboard

## 🎨 Design

Design minimalista inspirado no Airbnb com as seguintes cores:
- **Principal**: #161616
- **Secundária**: #8e2f30 (usada moderadamente)
- **Background**: #f7f7f7
- **Foreground**: #f7f7f7

## 📁 Estrutura do Projeto

```
rent-test/
├── app/                          # App Router do Next.js
│   ├── admin/                    # Páginas administrativas
│   │   ├── dashboard/           # Dashboard com gráficos
│   │   ├── pessoas/             # CRUD de pessoas
│   │   ├── itens/               # CRUD de itens
│   │   └── locacoes/            # CRUD de locações
│   ├── item/[id]/               # Página de detalhes do item
│   ├── itens-publicados/        # Lista pública de itens
│   ├── globals.css              # Estilos globais
│   ├── layout.tsx               # Layout raiz
│   └── page.tsx                 # Página inicial
├── components/                   # Componentes reutilizáveis
│   ├── Header.tsx               # Cabeçalho com navegação
│   └── Header.module.css        # Estilos do cabeçalho
├── lib/                         # Utilitários e dados
│   └── mockData.ts              # Dados mock do sistema
└── package.json
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `pessoa`
- `id`: UUID (chave primária)
- `nome_pessoa`: VARCHAR(100) - Nome da pessoa
- `email`: VARCHAR(100) - Email (opcional)
- `telefone`: VARCHAR(20) - Telefone
- `apartamento`: VARCHAR(15) - Número do apartamento

### Tabela `item`
- `id`: UUID (chave primária)
- `anunciante_id`: UUID - Referência para pessoa
- `nome_item`: VARCHAR(100) - Nome do item
- `foto_url`: TEXT - URL da foto (opcional)
- `preco_diario`: NUMERIC(10,2) - Preço por dia
- `observacoes`: VARCHAR(300) - Observações sobre o item

### Tabela `locacao`
- `id`: UUID (chave primária)
- `item_id`: UUID - Referência para item
- `data_inicio`: DATE - Data de início
- `data_fim`: DATE - Data de fim
- `status_pagamento`: VARCHAR(10) - Status do pagamento
- `locatario_id`: UUID - Referência para pessoa

### Tabela `avaliacao`
- `id`: UUID (chave primária)
- `avaliador_id`: UUID - Referência para pessoa
- `item_id`: UUID - Referência para item
- `estrelas`: INT - Avaliação de 1 a 5 estrelas
- `comentario`: VARCHAR(200) - Comentário da avaliação

## 📱 Páginas do Sistema

### 🏠 Página Inicial (`/`)
- Landing page com apresentação do sistema
- Links para área pública e administrativa

### 📊 AdminDashboardPage (`/admin/`)
- Visão geral do sistema com estatísticas
- Gráficos de receita mensal, status de locações
- Ranking de itens mais alugados
- Média de avaliações por item

### 👥 AdminPessoasPage (`/admin/pessoas`)
- CRUD completo de pessoas
- Formulário para adicionar/editar pessoas
- Tabela com todas as pessoas cadastradas

### 📦 AdminItemsPage (`/admin/itens`)
- CRUD completo de itens
- Seleção de anunciante
- Upload de foto e preço diário
- Campo de observações

### 📋 AdminLocacoesPage (`/admin/locacoes`)
- CRUD completo de locações
- Cálculo automático de dias e valor total
- Status de pagamento (pendente/pago)
- Seleção de item e locatário

### 🛍️ ItemsPublicadosPage (`/itens-publicados`)
- Lista pública de itens disponíveis
- Filtros de busca e ordenação
- Cards com foto, preço e avaliações
- Navegação para detalhes do item

### 🔍 ItemPage (`/item/[id]`)
- Detalhes completos do item
- Informações do anunciante
- Sistema de avaliações com estrelas
- Botão para alugar via WhatsApp

## 🚀 Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em modo desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar no navegador:**
   ```
   http://localhost:3000
   ```

## ✨ Funcionalidades

- ✅ Interface responsiva e moderna
- ✅ Navegação intuitiva entre páginas
- ✅ CRUD completo para todas as entidades
- ✅ Gráficos interativos no dashboard
- ✅ Sistema de avaliações com estrelas
- ✅ Integração com WhatsApp para aluguel
- ✅ Filtros e ordenação na lista de itens
- ✅ Design minimalista inspirado no Airbnb
- ✅ Dados mock para demonstração

## 🎯 Próximos Passos

- Implementar autenticação e autorização
- Conectar com banco de dados real (PostgreSQL)
- Adicionar upload de imagens
- Implementar notificações
- Adicionar sistema de mensagens
- Implementar pagamento online
