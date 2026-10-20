const fs = require('node:fs');
const path = require('node:path');
const { createOpenApi } = require('../docs/openapi');
const target = path.join(__dirname, '../docs/openapi.json');
fs.writeFileSync(target, JSON.stringify(createOpenApi(), null, 2) + '\n');
console.log('Contrato exportado para docs/openapi.json');
