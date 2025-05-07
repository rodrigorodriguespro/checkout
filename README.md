# 💳 Projeto Checkout - Fullstack com NestJS, Vue 3 e PNPM Monorepo

Este projeto é um sistema de checkout fullstack desenvolvido com **NestJS (backend)** e **Vue 3 (frontend)**, utilizando **PNPM Workspaces** com **TurboRepo** para gerenciamento eficiente de pacotes e scripts. Ele simula o processo de pagamento com cartões ou Pix, gerando QR Code, controlando o status da transação, e utilizando filas com Redis para processamentos assíncronos.

---

## 🧰 Tecnologias Utilizadas

### Backend
- [NestJS](https://nestjs.com/)
- [Bull](https://docs.nestjs.com/techniques/queues) com Redis
- [Zod](https://zod.dev/) para validações
- JWT para autenticação

### Frontend
- [Vue 3 + Vite](https://vitejs.dev/)
- [Bootstrap 5](https://getbootstrap.com/)
- Axios para comunicação com a API

### DevOps e Ferramentas
- [Docker](https://www.docker.com/) e Docker Compose
- [PNPM](https://pnpm.io/) com Workspaces
- [TurboRepo](https://turbo.build/repo) para orquestração de scripts
- Testes com Jest no backend

---

## 📦 Estrutura do Projeto

```
├── apps/
│   ├── backend/ → NestJS API com filas e autenticação  
│   └── frontend/ → Vue 3 + Bootstrap  
├── docker-compose.dev.yml  
├── start.sh → Script para subir o projeto com ou sem Docker  
├── .env.example → Variáveis de ambiente (exemplo)  
```

---

## ⚙️ Requisitos

| Ferramenta | Versão mínima |
|------------|----------------|
| Node.js    | >= 18          |
| PNPM       | >= 9.0         |
| Docker     | recomendado (para Redis e dev) |

---

## 🛠️ Setup do Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/rodrigorodriguespro/checkout
cd checkout
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Copie o .env
```bash
cp .env.example .env
```

## ▶️ Rodando o projeto

### 🔹 Com PNPM (sem Docker)

Utilize esse comando para rodar Redis via Docker e iniciar backend + frontend com hot reload:

```bash
pnpm dev:all
```

Esse script executa:

* docker compose up -d (apenas para Redis)

* pnpm --filter backend start:dev

* pnpm --filter frontend dev

### 🔹 Com Docker Compose

Utilize o ambiente de desenvolvimento completo com containers isolados:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Ou utilize o script `start.sh` para rodar o projeto com Docker:

```bash
./start.sh
```

✅ Essa opção é ideal se você não quer rodar serviços localmente ou está em uma máquina configurada apenas com Docker.

## 🌐 Endpoints e Acesso

* Frontend: http://localhost:5173
* Backend: http://localhost:3000

## ✅ Scripts Disponíveis
Workspace (package.json raiz)

```bash
"dev:all": "docker compose up -d && pnpm --filter backend start:dev & pnpm --filter frontend dev",
```

Backend
```bash
pnpm --filter backend start:dev     # Hot reload API
pnpm --filter backend test          # Executar testes
```

Frontend
```bash
pnpm --filter frontend dev          # Inicia o Vite Dev Server
```

🧪 Testes
No backend:

```bash
pnpm --filter backend test
```