const { Router } = require('express');
const controller = require('../controllers/AutorController');
const { autenticarToken, exigirRole } = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @openapi
 * {
 *   "/api/v1/autores": {
 *     "get": {
 *       "summary": "Listar autores",
 *       "tags": [
 *         "Autores"
 *       ],
 *       "operationId": "Listarautores",
 *       "security": [],
 *       "responses": {
 *         "200": {
 *           "description": "Operação realizada com sucesso.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "array",
 *                 "items": {
 *                   "$ref": "#/components/schemas/Autor"
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/ErroInterno"
 *         }
 *       },
 *       "description": "Consulta pública; retorna um array, inclusive vazio. Sem paginação ou filtros."
 *     }
 *   }
 * }
 */
router.get('/', (req, res, next) => controller.index(req, res, next));
/**
 * @openapi
 * {
 *   "/api/v1/autores": {
 *     "post": {
 *       "summary": "Cadastrar autor",
 *       "tags": [
 *         "Autores"
 *       ],
 *       "operationId": "Cadastrarautor",
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
 *                 "$ref": "#/components/schemas/Autor"
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
 *           "description": "O nome do autor é obrigatório.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Erro"
 *               },
 *               "example": {
 *                 "erro": "O nome do autor é obrigatório."
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
 *               "$ref": "#/components/schemas/NovoAutor"
 *             }
 *           }
 *         }
 *       },
 *       "description": "Exige ADMIN. Remove espaços das extremidades do nome. Nacionalidade omitida recebe Não informada."
 *     }
 *   }
 * }
 */
router.post('/', autenticarToken, exigirRole('ADMIN'), (req, res, next) => controller.store(req, res, next));

module.exports = router;