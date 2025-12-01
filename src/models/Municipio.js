const mongoose = require('mongoose');

const MunicipioSchema = new mongoose.Schema({
  codigo: { type: String },
  nome: { type: String, required: true, unique: true },  // unique já cria índice automaticamente
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

// Índices para consultas rápidas (não duplicar o índice de 'nome' que já é unique)
MunicipioSchema.index({ distrito: 1 });
MunicipioSchema.index({ ultimaAtualizacao: -1 });

module.exports = mongoose.model('Municipio', MunicipioSchema);