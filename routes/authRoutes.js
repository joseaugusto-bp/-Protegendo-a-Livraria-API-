const { Router } = require('express');
const controller = require('../controllers/AuthController');

const router = Router();
/**
 * @openapi
 * {
 *   "/api/v1/auth/register": {
 *     "post": {
 *       "summary": "Cadastrar usuário",
 *       "tags": [
 *         "Autenticação"
 *       ],
 *       "operationId": "Cadastrarusuario",
 *       "security": [],
 *       "responses": {
 *         "201": {
 *           "description": "Operação realizada com sucesso.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Usuario"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/ErroInterno"
 *         },
 *         "400": {
 *           "description": "Campos obrigatórios ausentes: nome, email ou senha.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Erro"
 *               },
 *               "example": {
 *                 "erro": "Campos obrigatórios ausentes: nome, email ou senha."
 *               }
 *             }
 *           }
 *         },
 *         "409": {
 *           "description": "E-mail já cadastrado no sistema.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Erro"
 *               },
 *               "example": {
 *                 "erro": "E-mail já cadastrado no sistema."
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
 *               "$ref": "#/components/schemas/Registro"
 *             }
 *           }
 *         }
 *       },
 *       "description": "Retorna o usuário sem senha_hash. O cadastro atual aceita role no corpo; trata-se de uma limitação do projeto base, não de um fluxo seguro de provisionamento de ADMIN."
 *     }
 *   }
 * }
 */
router.post('/register', (req, res, next) => controller.register(req, res, next));
/**
 * @openapi
 * {
 *   "/api/v1/auth/login": {
 *     "post": {
 *       "summary": "Autenticar usuário",
 *       "tags": [
 *         "Autenticação"
 *       ],
 *       "operationId": "Autenticarusuario",
 *       "security": [],
 *       "responses": {
 *         "200": {
 *           "description": "Operação realizada com sucesso.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/LoginResposta"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/ErroInterno"
 *         },
 *         "400": {
 *           "description": "E-mail e senha são obrigatórios.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Erro"
 *               },
 *               "example": {
 *                 "erro": "E-mail e senha são obrigatórios."
 *               }
 *             }
 *           }
 *         },
 *         "401": {
 *           "description": "Credenciais inválidas.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Erro"
 *               },
 *               "example": {
 *                 "erro": "Credenciais inválidas."
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
 *               "$ref": "#/components/schemas/Login"
 *             }
 *           }
 *         }
 *       },
 *       "description": "Copie o token da resposta para Authorize, sem escrever Bearer. Expira em 1 hora. Não existe refresh token nesta API."
 *     }
 *   }
 * }
 */
router.post('/login', (req, res, next) => controller.login(req, res, next));

module.exports = router;