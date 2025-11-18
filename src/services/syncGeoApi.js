const axios = require('axios');
const Municipio = require('../models/Municipio');

const syncData = async () => {
  try {
    console.log('Iniciando sincronização com geoapi.pt...');
    const response = await axios.get('https://json.geoapi.pt/municipios');
    const dados = response.data;

    for (const item of dados) {
      // Filtragem: apenas continente (exclui Açores e Madeira)
      if (item.distrito === 'Açores' || item.distrito === 'Madeira') continue;

      // Processamento: adicionar dados enriquecidos (exemplo fictício)
      const populacao2025 = Math.round(Math.random() * 300000 + 5000);
      const areaKm2 = Math.random() * 500 + 10;
      const densidade = Math.round(populacao2025 / areaKm2);

      await Municipio.updateOne(
        { codigo: item.codigo },
        {
          $set: {
            nome: item.nome,
            distrito: item.distrito,
            coordenadas: item.coordenadas,
            populacao2025,
            densidade,
            ultimaAtualizacao: new Date()
          }
        },
        { upsert: true }
      );
    }
    console.log('Sincronização concluída com sucesso!');
  } catch (error) {
    console.error('Erro na sincronização:', error.message);
  }
};

module.exports = syncData;