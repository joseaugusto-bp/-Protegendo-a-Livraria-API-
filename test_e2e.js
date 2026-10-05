const http = require('http');

async function testFlow() {
  
  console.log("1. Registrar ADMIN");
  const resAdminReg = await fetch('http://127.0.0.1:3000/api/v1/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: 'AdminTest', email: 'admintest@livraria.com', senha: '123', role: 'ADMIN' })
  });
  console.log("Admin register:", await resAdminReg.text());

  console.log("2. Login ADMIN");
  const resAdminLog = await fetch('http://127.0.0.1:3000/api/v1/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admintest@livraria.com', senha: '123' })
  });
  const adminData = await resAdminLog.json();
  const tokenAdmin = adminData.token;
  console.log("Token Admin:", tokenAdmin ? "Gerado com sucesso" : "Falha");

  console.log("3. Registrar USER");
  const resUserReg = await fetch('http://127.0.0.1:3000/api/v1/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: 'UserTest', email: 'usertest@livraria.com', senha: '123', role: 'USER' })
  });
  console.log("User register:", await resUserReg.text());

  console.log("4. Login USER");
  const resUserLog = await fetch('http://127.0.0.1:3000/api/v1/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'usertest@livraria.com', senha: '123' })
  });
  const userData = await resUserLog.json();
  const tokenUser = userData.token;
  
  console.log("5. USER tentando cadastrar livro (esperado: 403)");
  const resUserLivro = await fetch('http://127.0.0.1:3000/api/v1/livros', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenUser}` },
    body: JSON.stringify({ titulo: 'Livro do User', ano: 2024, autor_id: 1 })
  });
  console.log("User cria livro status:", resUserLivro.status);

  console.log("6. ADMIN tentando cadastrar livro (esperado: 201)");
  const resAdminLivro = await fetch('http://127.0.0.1:3000/api/v1/livros', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAdmin}` },
    body: JSON.stringify({ titulo: 'Livro do Admin', ano: 2024, autor_id: 1 })
  });
  const livroAdminCriado = await resAdminLivro.json();
  console.log("Admin cria livro status:", resAdminLivro.status, livroAdminCriado.id ? "ID gerado" : "");

  console.log("7. USER tentando cadastrar autor (esperado: 403)");
  const resUserAutor = await fetch('http://127.0.0.1:3000/api/v1/autores', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenUser}` },
    body: JSON.stringify({ nome: 'Autor do User', nacionalidade: 'Br' })
  });
  console.log("User cria autor status:", resUserAutor.status);

  console.log("8. ADMIN tentando cadastrar autor (esperado: 201)");
  const resAdminAutor = await fetch('http://localhost:3000/api/v1/autores', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAdmin}` },
    body: JSON.stringify({ nome: 'Autor do Admin', nacionalidade: 'Br' })
  });
  console.log("Admin cria autor status:", resAdminAutor.status);

  console.log("9. USER adicionando comentario (esperado: 201)");
  const resUserComentario = await fetch(`http://localhost:3000/api/v1/livros/${livroAdminCriado.id}/comentarios`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenUser}` },
    body: JSON.stringify({ texto: 'Muito bom', autor_nome: 'UserTest' })
  });
  console.log("User cria comentário status:", resUserComentario.status);
  
  console.log("10. Public endpoint (esperado: 200)");
  const resPublic = await fetch(`http://localhost:3000/api/v1/livros`);
  console.log("Public endpoint status:", resPublic.status);
  
  process.exit(0);
}

testFlow().catch(err => { console.error(err); process.exit(1); });
