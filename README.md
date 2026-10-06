# 📚 Livraria API - Segurança com JWT e RBAC

Esta é uma API RESTful de Livros e Autores desenvolvida com **Clean Architecture**. O foco principal deste projeto é a implementação de uma camada completa de segurança.

## 🛡️ Funcionalidades de Segurança Implementadas

- **Armazenamento Seguro de Credenciais:** As senhas dos usuários são protegidas usando hashes criptográficos com **BCrypt** (aplicando Salt + Work Factor).
- **Autenticação Stateless:** Emissão e validação de tokens **JWT** (JSON Web Token). O acesso às rotas protegidas requer o cabeçalho `Authorization: Bearer <token>`.
- **Controle de Acesso Baseado em Perfis (RBAC):** Proteção de endpoints utilizando Middlewares que distinguem usuários comuns (`USER`) de administradores (`ADMIN`).

## 🛠️ Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [BCrypt.js](https://www.npmjs.com/package/bcryptjs)
- [JSON Web Token (JWT)](https://jwt.io/)
- Banco de Dados local baseado em arquivo JSON (`database.txt`)

## 🚀 Como executar o projeto

1. Clone este repositório:
   ```bash
   git clone https://github.com/joseaugusto-bp/-Protegendo-a-Livraria-API-.git
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd -Protegendo-a-Livraria-API-
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor:
   ```bash
   node server.js
   ```
A API estará rodando em `http://localhost:3000`.

## 🔑 Credenciais de Teste

Para testar a aplicação facilmente (pode usar o arquivo `index.html` fornecido), utilize os seguintes usuários que já estão pré-cadastrados no banco:

| Perfil | E-mail | Senha | Permissões |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admintest@livraria.com` | `123` | Pode cadastrar livros e autores, além de comentar. |
| **USER** | `usertest@livraria.com` | `123` | Pode apenas visualizar o catálogo e fazer comentários. |

## 📋 Matriz de Permissões (Endpoints)

| Método | Rota | Acesso | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| `GET`  | `/api/v1/livros` | Público 🟢 | `200 OK` |
| `GET`  | `/api/v1/livros/:id` | Público 🟢 | `200 OK` |
| `POST` | `/api/v1/auth/register` | Público 🟢 | `201 Created` |
| `POST` | `/api/v1/auth/login` | Público 🟢 | `200 OK` |
| `POST` | `/api/v1/livros/:id/comentarios` | Autenticado (`USER` ou `ADMIN`) 🟡 | `201 Created` |
| `POST` | `/api/v1/autores` | Exclusivo `ADMIN` 🔴 | `201 Created` |
| `POST` | `/api/v1/livros` | Exclusivo `ADMIN` 🔴 | `201 Created` |

---
*Projeto desenvolvido como atividade prática de segurança e controle de acessos em APIs.*
