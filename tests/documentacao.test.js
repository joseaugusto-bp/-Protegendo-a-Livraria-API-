const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const SwaggerParser = require('@apidevtools/swagger-parser');
const Ajv = require('ajv');
const bcrypt = require('bcryptjs');

test('OpenAPI corresponde aos fluxos HTTP da Livraria', async (t) => {
  const oldCwd = process.cwd();
  const oldEnv = process.env.NODE_ENV;
  const oldSecret = process.env.JWT_SECRET;
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'livraria-contrato-'));
  process.chdir(temp);
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'chave-ficticia-exclusiva-do-teste';
  const senha = 'SenhaTeste123!';
  const senha_hash = await bcrypt.hash(senha, 10);
  fs.writeFileSync('database.txt', JSON.stringify({
    usuarios: [
      { id: 1, nome: 'Admin de teste', email: 'admin@example.com', senha_hash, role: 'ADMIN' },
      { id: 2, nome: 'Leitor de teste', email: 'leitor@example.com', senha_hash, role: 'USER' },
    ],
    autores: [{ id: 1, nome: 'Autora de teste', nacionalidade: 'Brasileira' }],
    livros: [{ id: 1, titulo: 'Livro de teste', ano: 2026, autor_id: 1, comentarios: [] }],
  }));
  const app = require('../server');
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    process.chdir(oldCwd);
    if (oldEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldEnv;
    if (oldSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = oldSecret;
    fs.rmSync(temp, { recursive: true, force: true });
  });
  const spec = await (await fetch(`${base}/api/docs/openapi.json`)).json();
  await t.test('especificação OpenAPI válida com oito operações e JWT', async () => {
    await SwaggerParser.validate(structuredClone(spec));
    assert.equal(Object.values(spec.paths).flatMap((p) => Object.keys(p)).length, 8);
    assert.equal(spec.components.securitySchemes.bearerAuth.scheme, 'bearer');
    assert.equal(spec.paths['/api/v1/livros'].post.security[0].bearerAuth.length, 0);
    assert.deepEqual(spec.paths['/api/v1/livros'].get.security, []);
    assert.ok(!JSON.stringify(spec).includes(process.env.JWT_SECRET));
    assert.ok(!JSON.stringify(spec.components.schemas.Usuario).includes('senha_hash'));
  });
  const ajv = new Ajv({ strict: false });
  async function request(route, method, expected, body, token, contractPath = route) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(base + route, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await response.json();
    assert.equal(response.status, expected, `${method} ${route}: ${JSON.stringify(data)}`);
    const contract = spec.paths[contractPath][method.toLowerCase()].responses[String(expected)];
    assert.ok(contract, `Status ${expected} não documentado`);
    const resolved = contract.$ref ? spec.components.responses[contract.$ref.split('/').at(-1)] : contract;
    const schema = resolved.content['application/json'].schema;
    const validate = ajv.compile({ components: spec.components, ...schema });
    assert.ok(validate(data), JSON.stringify(validate.errors));
    return data;
  }
  let adminToken, userToken;
  await t.test('registro 201, conflito 409, validação 400 e login 200/401', async () => {
    const created = await request('/api/v1/auth/register', 'POST', 201, { nome: 'Novo leitor', email: 'novo@example.com', senha });
    assert.equal(created.role, 'USER');
    assert.equal(created.senha_hash, undefined);
    await request('/api/v1/auth/register', 'POST', 409, { nome: 'Novo leitor', email: 'novo@example.com', senha });
    await request('/api/v1/auth/register', 'POST', 400, {});
    await request('/api/v1/auth/login', 'POST', 400, {});
    await request('/api/v1/auth/login', 'POST', 401, { email: 'admin@example.com', senha: 'incorreta' });
    adminToken = (await request('/api/v1/auth/login', 'POST', 200, { email: 'admin@example.com', senha })).token;
    userToken = (await request('/api/v1/auth/login', 'POST', 200, { email: 'leitor@example.com', senha })).token;
  });
  await t.test('catálogo público, detalhes, autores e livro ausente', async () => {
    await request('/api/v1/livros', 'GET', 200);
    const livro = await request('/api/v1/livros/1', 'GET', 200, undefined, undefined, '/api/v1/livros/{id}');
    assert.equal(livro.autor_nome, 'Autora de teste');
    await request('/api/v1/livros/-1', 'GET', 404, undefined, undefined, '/api/v1/livros/{id}');
    await request('/api/v1/autores', 'GET', 200);
  });
  await t.test('401 ausente/inválido/expirado e 403 sem ADMIN', async () => {
    await request('/api/v1/autores', 'POST', 401, { nome: 'Autora' });
    await request('/api/v1/autores', 'POST', 401, { nome: 'Autora' }, 'invalido');
    const expired = require('jsonwebtoken').sign({ id: 1, role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: -1 });
    await request('/api/v1/autores', 'POST', 401, { nome: 'Autora' }, expired);
    await request('/api/v1/autores', 'POST', 403, { nome: 'Autora' }, userToken);
    await request('/api/v1/livros', 'POST', 403, { titulo: 'Livro', autor_id: 1 }, userToken);
  });
  await t.test('criação ADMIN, campos obrigatórios e autor inexistente', async () => {
    await request('/api/v1/autores', 'POST', 400, {}, adminToken);
    const autor = await request('/api/v1/autores', 'POST', 201, { nome: 'Outra autora' }, adminToken);
    assert.equal(autor.nacionalidade, 'Não informada');
    await request('/api/v1/livros', 'POST', 400, {}, adminToken);
    await request('/api/v1/livros', 'POST', 404, { titulo: 'Sem autor', autor_id: -1 }, adminToken);
    const livro = await request('/api/v1/livros', 'POST', 201, { titulo: 'Novo livro', autor_id: 1 }, adminToken);
    assert.deepEqual(livro.comentarios, []);
    assert.equal(livro.autor_nome, undefined);
  });
  await t.test('comentários usam nome do JWT e documentam 201/400/401/404', async () => {
    const route = '/api/v1/livros/1/comentarios';
    const contract = '/api/v1/livros/{id}/comentarios';
    await request(route, 'POST', 401, { texto: 'Bom' }, undefined, contract);
    await request(route, 'POST', 400, { texto: ' ' }, userToken, contract);
    const comentario = await request(route, 'POST', 201, { texto: 'Bom', autor_nome: 'Nome falsificado' }, userToken, contract);
    assert.equal(comentario.autor_nome, 'Leitor de teste');
    await request('/api/v1/livros/-1/comentarios', 'POST', 404, { texto: 'Bom' }, userToken, contract);
  });
  await t.test('Swagger UI e arquivos estáticos respondem', async () => {
    const html = await fetch(`${base}/api/docs/`);
    assert.equal(html.status, 200);
    assert.match(await html.text(), /swagger-ui/);
    assert.equal((await fetch(`${base}/api/docs/swagger-ui.css`)).status, 200);
  });
  await t.test('documentação desativada em produção', async () => {
    process.env.NODE_ENV = 'production';
    delete require.cache[require.resolve('../server')];
    const production = require('../server').listen(0, '127.0.0.1');
    await once(production, 'listening');
    try {
      const origin = `http://127.0.0.1:${production.address().port}`;
      for (const route of ['/api/docs/', '/api/docs/openapi.json']) assert.equal((await fetch(origin + route)).status, 404);
    } finally {
      await new Promise((resolve) => production.close(resolve));
      process.env.NODE_ENV = 'test';
    }
  });
});
