const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const livroRoutes = require('./routes/livroRoutes');
const autorRoutes = require('./routes/autorRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const swaggerUi = require('swagger-ui-express');
const { createOpenApi } = require('./docs/openapi');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Documentação interativa disponível em desenvolvimento, desativada em produção.
if (process.env.NODE_ENV !== 'production') {
  const specification = createOpenApi();
  app.get('/api/docs/openapi.json', (req, res) => res.json(specification));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specification, {
    customSiteTitle: 'Livraria API - Documentação',
    swaggerOptions: { persistAuthorization: false, validatorUrl: null },
  }));
}

// Agrupamento Semântico de Rotas (RESTful /api/v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/livros', livroRoutes);
app.use('/api/v1/autores', autorRoutes);

// Middleware Global de Tratamento de Erros
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Livraria API rodando em http://localhost:${PORT}`);
    if (process.env.NODE_ENV !== 'production') console.log(`Swagger UI: http://localhost:${PORT}/api/docs`);
  });
}

module.exports = app;
