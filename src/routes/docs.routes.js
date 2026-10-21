const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

const router = express.Router();

// Endpoint for raw OpenAPI JSON
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI options
const swaggerUiOptions = {
  customSiteTitle: '📚 Dokumentasi RESTful API Perpustakaan',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 25px 0 }
    .swagger-ui .info .title { font-size: 28px; color: #1e293b; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    filter: true,
    tryItOutEnabled: true,
  },
};

// Mount Swagger UI
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

module.exports = router;
