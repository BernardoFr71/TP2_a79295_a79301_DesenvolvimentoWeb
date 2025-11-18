// src/app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const helmet = require('helmet');
const cors = require('cors');

const dadosRoutes = require('./routes/dadosRoutes');
const syncData = require('./services/syncGeoApi');
const { serve, setup } = require('./config/swagger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger UI - público
app.use('/api-docs', serve, setup);

// Rotas protegidas
app.use('/api/municipios', dadosRoutes);

// Página inicial simples
app.get('/', (req, res) => {
  res.json({
    mensagem: "API de Integração geoapi.pt - TP2 DAWeb",
    documentacao: "http://localhost:3000/api-docs"
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