## PegaAí+

> O **PegaAí+** é uma plataforma de aluguel colaborativo que conecta pessoas interessadas em disponibilizar ou alugar objetos de forma prática e segura.
Plataforma web para compartilhamento e aluguel de objetos entre usuários. O sistema foi desenvolvido utilizando React, Supabase e PostgreSQL, seguindo conceitos de economia compartilhada e sustentabilidade.

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Funcionalidades

- Cadastro e autenticação de usuários
- Gerenciamento de perfil
- Cadastro de produtos
- Busca e filtros de produtos
- Carrinho de locação
- Checkout
- Dashboard do usuário
- Histórico de locações
- Modo escuro
- Layout responsivo

## 🛠️ Tecnologias Utilizadas

### Frontend

- React 19
- React Router DOM
- Axios
- Vite

### Backend e Banco de Dados

- Supabase
- PostgreSQL
- Supabase Storage

### Qualidade de Código

- ESLint
- Git
- GitHub

## 🗄️ Banco de Dados

O sistema utiliza PostgreSQL hospedado no Supabase.

<img width="1400" height="700" alt="supabase-schema-suaqrtwnyommedzlrjri" src="https://github.com/user-attachments/assets/fd446204-714a-4685-bcea-e2ce06282b78" />

## 📁 Estrutura do Projeto

```text
src
├── components
│   ├── Auth
│   ├── Carousel
│   ├── Footer
│   ├── Header
│   ├── ProductCard
│   └── ThemeToggle
├── context
│   └── ThemeContext.jsx
├── data
│   └── mockData.js
├── hooks
│   ├── useAuth.js
│   ├── useProfileCheck.js
│   └── useTheme.js
├── pages
│   ├── Cart
│   ├── Checkout
│   ├── Dashboard
│   ├── Explorer
│   ├── Home
│   ├── Login
│   ├── MyProducts
│   ├── ProductsRentals
│   ├── Profile
│   ├── Register
│   ├── UpProduct
│   └── ViewProduct
├── routes
│   └── routes.jsx
│
├── styles
│   └── theme.css
├── utils
│   └── axios.js
├── App.jsx
├── App.css
├── main.jsx
```

## ⚙️ Instalação

### Clonar o repositório

```bash
git clone https://github.com/AnnaClr/PegaAi.git

cd PegaAi
```

### Instalar dependências

```bash
npm install
```

### Configurar ambiente

```env
VITE_API_URL=YOUR_API_URL
VITE_API_KEY=YOUR_API_KEY
```

### Executar projeto

```bash
npm run dev
```
