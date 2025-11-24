const mongoose = require('mongoose');

const MunicipioSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  distrito: { type: String, required: true },
  coordenadas: {
    latitude: Number,
    longitude: Number
  },
  populacao2025: { type: Number },      // campo processado (exemplo)
  densidade: { type: Number },          // campo calculado (exemplo)
  ultimaAtualizacao: { type: Date, default: Date.now },
  fonte: { type: String, default: 'geoapi.pt' }
});

// Índices para consultas rápidas
MunicipioSchema.index({ distrito: 1 });
MunicipioSchema.index({ ultimaAtualizacao: -1 });

module.exports = mongoose.model('Municipio', MunicipioSchema);