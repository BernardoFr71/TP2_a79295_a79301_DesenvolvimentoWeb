const mongoose = require('mongoose');

const MunicipioSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  distrito: { type: String, required: true },
  coordenadas: {
    latitude: Number,
    longitude: Number
  },
  populacao2025: Number,        // campo processado
  densidade: Number,            // campo calculado
  ultimaAtualizacao: { type: Date, default: Date.now },
  fonte: { type: String, default: 'geoapi.pt' }
});

module.exports = mongoose.model('Municipio', MunicipioSchema);