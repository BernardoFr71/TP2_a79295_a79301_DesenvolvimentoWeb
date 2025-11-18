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

// Carrega o swagger.yaml
const swaggerDocument = YAML.load('./docs/swagger.yaml');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger UI corrigido e bonito
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument, {
  swaggerOptions: { docExpansion: 'none', filter: true },
  customCss: '.swagger-ui .topbar { display: none }', // remove barra preta feia
  customSiteTitle: "TP2 - Integração geoapi.pt"
}));

// Rotas protegidas
app.use('/api/municipios', dadosRoutes);

// Página inicial
app.get('/', (req, res) => {
  res.json({
    mensagem: "API TP2 DAWeb – Integração geoapi.pt",
    documentacao: "http://localhost:3000/api-docs",
    api_key_necessaria: "minha_chave_secreta_12345"
  });
});

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