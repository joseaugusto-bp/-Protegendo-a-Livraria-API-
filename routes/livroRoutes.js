const { Router } = require('express');
const controller = require('../controllers/LivroController');
const { autenticarToken, exigirRole } = require('../middlewares/authMiddleware');

const router = Router();

// Rotas Públicas
/**
 * @openapi
 * {
 *   "/api/v1/livros": {
 *     "get": {
 *       "summary": "Listar livros",
 *       "tags": [
 *         "Livros"
 *       ],
 *       "operationId": "Listarlivros",
 *       "security": [],
 *       "responses": {
 *         "200": {
 *           "description": "Operação realizada com sucesso.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "array",
 *                 "items": {
 *                   "$ref": "#/components/schemas/LivroConsulta"
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/ErroInterno"
 *         }
 *       },
 *       "description": "Consulta pública sem paginação ou filtros. Cada livro inclui autor_nome e comentarios."
 *     }
 *   }
 * }
 */
router.get('/', (req, res, next) => controller.index(req, res, next));
/**
 * @openapi
 * {
 *   "/api/v1/livros/{id}": {
 *     "get": {
 *       "summary": "Consultar livro",
 *       "tags": [
 *         "Livros"
 *       ],
 *       "operationId": "Consultarlivro",
 *       "security": [],
 *       "responses": {
 *         "200": {
 *           "description": "Operação realizada com sucesso.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/LivroConsulta"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/ErroInterno"
 *         },
 *         "404": {
 *           "description": "Livro não localizado.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Erro"
 *               },
 *               "example": {
 *                 "erro": "Livro não localizado."
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "parameters": [
 *         {
 *           "$ref": "#/components/parameters/LivroId"
 *         }
 *       ]
 *     }
 *   }
 * }
 */
router.get('/:id', (req, res, next) => controller.show(req, res, next));

// Rota Restrita: ADMIN
/**
 * @openapi
 * {
 *   "/api/v1/livros": {
 *     "post": {
 *       "summary": "Cadastrar livro",
 *       "tags": [
 *         "Livros"
 *       ],
 *       "operationId": "Cadastrarlivro",
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "responses": {
 *         "201": {
 *           "description": "Operação realizada com sucesso.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Livro"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/ErroInterno"
 *         },
 *         "401": {
 *           "$ref": "#/components/responses/NaoAutenticado"
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/Proibido"
 *         },
 *         "400": {
 *           "description": "O título e o autor_id são obrigatórios.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Erro"
 *               },
 *               "example": {
 *                 "erro": "O título e o autor_id são obrigatórios."
 *               }
 *             }
 *           }
 *         },
 *         "404": {
 *           "description": "O autor informado não existe.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Erro"
 *               },
 *               "example": {
 *                 "erro": "O autor informado não existe."
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/NovoLivro"
 *             }
 *           }
 *         }
 *       },
 *       "description": "Exige ADMIN e autor previamente cadastrado. A criação retorna comentarios vazio e não inclui autor_nome; esse campo é acrescentado nas consultas."
 *     }
 *   }
 * }
 */
router.post('/', autenticarToken, exigirRole('ADMIN'), (req, res, next) => controller.store(req, res, next));

// Rota Restrita: Usuário Autenticado
/**
 * @openapi
 * {
 *   "/api/v1/livros/{id}/comentarios": {
 *     "post": {
 *       "summary": "Adicionar comentário",
 *       "tags": [
 *         "Comentários"
 *       ],
 *       "operationId": "Adicionarcomentario",
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "responses": {
 *         "201": {
 *           "description": "Operação realizada com sucesso.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Comentario"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/ErroInterno"
 *         },
 *         "401": {
 *           "$ref": "#/components/responses/NaoAutenticado"
 *         },
 *         "400": {
 *           "description": "O texto do comentário não pode estar vazio.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Erro"
 *               },
 *               "example": {
 *                 "erro": "O texto do comentário não pode estar vazio."
 *               }
 *             }
 *           }
 *         },
 *         "404": {
 *           "description": "Livro não localizado.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Erro"
 *               },
 *               "example": {
 *                 "erro": "Livro não localizado."
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/NovoComentario"
 *             }
 *           }
 *         }
 *       },
 *       "description": "USER ou ADMIN autenticado. autor_nome vem do JWT, não do corpo da requisição. Retorna somente o comentário criado.",
 *       "parameters": [
 *         {
 *           "$ref": "#/components/parameters/LivroId"
 *         }
 *       ]
 *     }
 *   }
 * }
 */
router.post('/:id/comentarios', autenticarToken, (req, res, next) => controller.storeComment(req, res, next));

module.exports = router;