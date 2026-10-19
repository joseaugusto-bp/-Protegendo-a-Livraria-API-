const path = require('node:path');
const swaggerJsdoc = require('swagger-jsdoc');

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const string = (example) => ({ type: 'string', example });
const integer = (example) => ({ type: 'integer', example });
const object = (properties, required) => ({ type: 'object', properties, required });

function createOpenApi() {
  return swaggerJsdoc({
    failOnErrors: true,
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'Livraria API',
        version: '1.1.0',
        description: 'Catálogo de livros e autores com comentários, JWT e perfis USER/ADMIN. '
          + 'Projeto acadêmico com persistência local em database.txt. '
          + 'Faça login e cole somente o token em Authorize. O JWT expira em uma hora. '
          + 'A API atual não oferece paginação, filtros, refresh token ou logout. '
          + 'Limitação existente: o cadastro público aceita role; não utilizar esta versão em produção.',
      },
      // URL relativa: Try it out usa a mesma origem do servidor da documentação.
      servers: [{ url: '/', description: 'Mesmo servidor da API' }],
      tags: [
        { name: 'Autenticação', description: 'Cadastro e obtenção de JWT.' },
        { name: 'Autores', description: 'Consulta pública e criação exclusiva de ADMIN.' },
        { name: 'Livros', description: 'Catálogo público e criação exclusiva de ADMIN.' },
        { name: 'Comentários', description: 'Inclusão por usuários autenticados.' },
      ],
      security: [],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token retornado por POST /api/v1/auth/login; cole sem o prefixo Bearer.' },
        },
        schemas: {
          Erro: object({ erro: string('Mensagem de erro da API.') }, ['erro']),
          Registro: object({
            nome: string('Leitor de Exemplo'),
            email: string('leitor@example.com'),
            senha: { type: 'string', writeOnly: true, example: 'SenhaSomenteExemplo123!' },
            role: { type: 'string', default: 'USER', example: 'USER', description: 'Opcional. A implementação atual converte para maiúsculas e aceita o valor informado, inclusive ADMIN. Limitação de segurança do projeto base.' },
          }, ['nome', 'email', 'senha']),
          Usuario: object({ id: integer(12345), nome: string('Leitor de Exemplo'), email: string('leitor@example.com'), role: string('USER') }, ['id', 'nome', 'email', 'role']),
          Login: object({ email: string('leitor@example.com'), senha: { type: 'string', writeOnly: true, example: 'SenhaSomenteExemplo123!' } }, ['email', 'senha']),
          LoginResposta: object({ usuario: object({ id: integer(12345), nome: string('Leitor de Exemplo'), role: string('USER') }, ['id', 'nome', 'role']), token: { type: 'string', description: 'JWT assinado pelo servidor, válido por uma hora.' } }, ['usuario', 'token']),
          NovoAutor: object({ nome: string('Autora de Exemplo'), nacionalidade: { type: 'string', default: 'Não informada', example: 'Brasileira' } }, ['nome']),
          Autor: object({ id: integer(12345), nome: string('Autora de Exemplo'), nacionalidade: string('Brasileira') }, ['id', 'nome', 'nacionalidade']),
          NovoLivro: object({ titulo: string('Livro de Exemplo'), ano: { type: 'integer', example: 2026, description: 'Opcional; quando omitido ou igual a zero, usa o ano atual.' }, autor_id: { type: 'integer', example: 1, description: 'Identificador de um autor existente.' } }, ['titulo', 'autor_id']),
          Comentario: object({ id: integer(12346), autor_nome: string('Leitor de Exemplo'), texto: string('Leitura recomendada.') }, ['id', 'autor_nome', 'texto']),
          Livro: object({ id: integer(12347), titulo: string('Livro de Exemplo'), ano: integer(2026), autor_id: integer(1), comentarios: { type: 'array', items: ref('Comentario') } }, ['id', 'titulo', 'ano', 'autor_id', 'comentarios']),
          LivroConsulta: { allOf: [ref('Livro'), object({ autor_nome: string('Autora de Exemplo') }, ['autor_nome'])] },
          NovoComentario: object({ texto: string('Leitura recomendada.') }, ['texto']),
        },
        parameters: {
          LivroId: { name: 'id', in: 'path', required: true, description: 'Identificador do livro.', schema: { type: 'integer' }, example: 1 },
        },
        responses: {
          NaoAutenticado: { description: 'Token ausente, inválido ou expirado.', content: { 'application/json': { schema: ref('Erro'), examples: { ausente: { value: { erro: 'Token de autenticação não fornecido.' } }, invalido: { value: { erro: 'Token inválido ou expirado.' } } } } } },
          Proibido: { description: 'Usuário autenticado sem perfil ADMIN.', content: { 'application/json': { schema: ref('Erro'), example: { erro: 'Acesso proibido: privilégio de ADMIN exigido.' } } } },
          ErroInterno: { description: 'Falha inesperada da aplicação; a versão atual retorna { erro: mensagem }.', content: { 'application/json': { schema: ref('Erro'), example: { erro: 'Ocorreu um erro interno no servidor.' } } } },
        },
      },
    },
    apis: [path.join(__dirname, '../routes/*.js').replaceAll('\\', '/')],
  });
}

module.exports = { createOpenApi };
