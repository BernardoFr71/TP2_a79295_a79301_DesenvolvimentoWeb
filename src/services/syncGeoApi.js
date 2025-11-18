const axios = require('axios');
const Municipio = require('../models/Municipio');

const syncData = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Iniciando sincronização com geoapi.pt...`);
    const response = await axios.get('https://json.geoapi.pt/municipios');
    const municipios = response.data;

    let contador = 0;
    for (const m of municipios) {
      // Filtragem: apenas continente
      if (['Açores', 'Madeira'].includes(m.distrito)) continue;

      // Processamento exemplo (valores fictícios para demonstração)
      const areaKm2 = Math.random() * 800 + 20;
      const populacao2025 = Math.floor(Math.random() * 300000 + 5000);
      const densidade = Math.round(populacao2025 / areaKm2);

      await Municipio.updateOne(
        { codigo: m.codigo },
        {
          $set: {
            nome: m.nome,
            distrito: m.distrito,
            coordenadas: m.coordenadas || null,
            populacao2025,
            densidade,
            ultimaAtualizacao: new Date(),
            fonte: 'geoapi.pt'
          }
        },
        { upsert: true }
      );
      contador++;
    }
    console.log(`Sincronização concluída: ${contador} municípios processados/armazenados.`);
  } catch (error) {
    console.error('Erro na sincronização:', error.message);
  }
};

module.exports = syncData;