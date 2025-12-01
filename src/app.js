require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const dadosRoutes = require('./routes/dadosRoutes');
const syncData = require('./services/syncGeoApi');
const path = require('path');

// Carrega o swagger.yaml de forma robusta (usando caminho absoluto)
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas protegidas
app.use('/api/municipios', dadosRoutes);

// Conexão MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geoapi_db')
  .then(() => console.log('MongoDB conectado com sucesso'))
  .catch(err => console.error('Erro MongoDB:', err));

// Sincronização agendada (a cada hora)
cron.schedule('0 * * * *', () => {
  console.log('Sincronização agendada iniciada...');
  syncData();
});

// Primeira sincronização ao iniciar
syncData();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});