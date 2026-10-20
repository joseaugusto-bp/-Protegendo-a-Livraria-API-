# Livraria API

API REST para gerenciamento de livros, autores e comentários, com autenticação JWT e controle de acesso por perfil (RBAC). O projeto utiliza camadas de rotas, controladores, serviços e repositórios, com persistência local em arquivo JSON.

## Autenticação e controle de acesso

- **Armazenamento Seguro de Credenciais:** As senhas dos usuários são protegidas usando hashes criptográficos com **BCrypt** (aplicando Salt + Work Factor).
- **Autenticação Stateless:** Emissão e validação de tokens **JWT** (JSON Web Token). O acesso às rotas protegidas requer o cabeçalho `Authorization: Bearer <token>`.
- **Controle de Acesso Baseado em Perfis (RBAC):** Proteção de endpoints utilizando Middlewares que distinguem usuários comuns (`USER`) de administradores (`ADMIN`).

## Tecnologias

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [BCrypt.js](https://www.npmjs.com/package/bcryptjs)
- [JSON Web Token (JWT)](https://jwt.io/)
- Banco de Dados local baseado em arquivo JSON (`database.txt`)

## Execução local

Requer Node.js 20 ou superior.

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
   npm ci
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```
A API estará rodando em `http://localhost:3000`.

## Usuários de teste

Em bancos usados pelo script manual `test_e2e.js`, os seguintes usuários fictícios podem existir. Um clone limpo não garante essas credenciais; use o cadastro/login da API para criar um usuário de teste. Os novos testes automatizados usam dados isolados.

| Perfil | E-mail | Senha | Permissões |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admintest@livraria.com` | `123` | Pode cadastrar livros e autores, além de comentar. |
| **USER** | `usertest@livraria.com` | `123` | Pode apenas visualizar o catálogo e fazer comentários. |

## Endpoints e permissões

| Método | Rota | Acesso | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| `GET`  | `/api/v1/livros` | Público | `200 OK` |
| `GET`  | `/api/v1/livros/:id` | Público | `200 OK` |
| `GET`  | `/api/v1/autores` | Público | `200 OK` |
| `POST` | `/api/v1/auth/register` | Público | `201 Created` |
| `POST` | `/api/v1/auth/login` | Público | `200 OK` |
| `POST` | `/api/v1/livros/:id/comentarios` | Autenticado (`USER` ou `ADMIN`) | `201 Created` |
| `POST` | `/api/v1/autores` | Exclusivo `ADMIN` | `201 Created` |
| `POST` | `/api/v1/livros` | Exclusivo `ADMIN` | `201 Created` |

## Documentação Swagger/OpenAPI

- Swagger UI: `http://localhost:3000/api/docs/`
- Contrato JSON: `http://localhost:3000/api/docs/openapi.json`
- Exportação: `npm run docs:export` gera `docs/openapi.json`.
- Verificação: `npm test` valida a especificação e os fluxos HTTP com dados temporários.
- Requisições prontas: `docs/roteiro.http` para REST Client do VS Code.

`PORT` permite escolher outra porta. A documentação usa a mesma origem da API.
Swagger UI e o endpoint JSON são desativados com `NODE_ENV=production`.

### Testar pelo Swagger UI

1. Em **Autenticação**, execute `POST /api/v1/auth/register` com nome, e-mail fictício e senha de exemplo. O perfil padrão é USER.
2. Faça login em `POST /api/v1/auth/login` com as mesmas credenciais.
3. Copie somente `token` para **Authorize**, sem o prefixo Bearer.
4. Consulte livros/autores e adicione um comentário em um livro existente.
5. A criação de livros/autores exige token ADMIN; um USER recebe 403.

O token expira em uma hora e não é salvo pelo Swagger após recarregar a página.
Não há refresh token, logout, paginação, filtros ou ordenação por query nesta API.
**Try it out** executa chamadas reais: escritas alteram `database.txt`.

### Contrato e manutenção

Os comentários `@openapi` junto às rotas documentam oito operações, incluindo a
listagem pública de autores. `docs/openapi.js` concentra metadados, esquemas,
parâmetros e Bearer JWT. Cada operação descreve entrada, saída e erros aplicáveis
(400, 401, 403, 404, 409 e 500), com o corpo real `{ "erro": "mensagem" }`.
As respostas documentadas correspondem aos códigos implementados pela API.

O cadastro de livro retorna `comentarios: []`, sem `autor_nome`; esse campo é
acrescentado nas consultas. O comentário recebe seu autor do JWT. O cadastro
não devolve o hash da senha. Os esquemas distinguem esses retornos.

Ao mudar uma rota, atualize seu `@openapi`, rode `npm test` e exporte o contrato.
Os testes usam um diretório temporário e não alteram o banco de desenvolvimento.
O OpenAPI descreve os tipos de uso esperado; as validações em tempo de execução
continuam nas camadas existentes, sem validação automática de todas as entradas
pelo contrato.

### Limitações conhecidas

O cadastro público aceita `role`, inclusive ADMIN: um cliente pode atribuir a si
mesmo o perfil administrativo. Antes de produção, restrinja o
provisionamento de ADMIN. Também há chave JWT de fallback, persistência síncrona
em arquivo e validação de tipos incompleta. Use apenas dados fictícios neste
ambiente acadêmico e configure `JWT_SECRET` no ambiente.

### Referências de implementação

- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)
