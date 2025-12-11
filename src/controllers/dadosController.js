const db = require('../models/database');

// Função auxiliar para formatar município (manter compatibilidade com formato anterior)
const formatMunicipio = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    codigo: row.codigo,
    nome: row.nome,
    distrito: row.distrito,
    coordenadas: {
      latitude: row.latitude,
      longitude: row.longitude
    },
    populacao2025: row.populacao2025,
    densidade: row.densidade,
    ultimaAtualizacao: row.ultimaAtualizacao,
    fonte: row.fonte
  };
};

// GET todos (com paginação e filtro por distrito)
exports.getAll = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const distrito = req.query.distrito;

    const total = db.countAll(distrito ? { distrito } : {});
    const dados = db.findAll({ page, limit, distrito });

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: dados.map(formatMunicipio)
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET por ID
exports.getById = (req, res) => {
  try {
    const dado = db.findById(req.params.id);
    if (!dado) return res.status(404).json({ erro: 'Município não encontrado' });
    res.json(formatMunicipio(dado));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET por código (ex: /codigo/0802)
exports.getByCodigo = (req, res) => {
  try {
    const dado = db.findByCodigo(req.params.codigo);
    if (!dado) return res.status(404).json({ erro: 'Município não encontrado com este código' });
    res.json(formatMunicipio(dado));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET por nome (ex: /nome/Lisboa)
exports.getByNome = (req, res) => {
  try {
    const dado = db.findByNome(req.params.nome);
    if (!dado) return res.status(404).json({ erro: 'Município não encontrado com este nome' });
    res.json(formatMunicipio(dado));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET por distrito (ex: /distrito/porto)
exports.getByDistrito = (req, res) => {
  try {
    const dados = db.findByDistrito(req.params.distrito);
    res.json(dados.map(formatMunicipio));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST (criar manualmente - útil para testes)
exports.create = (req, res) => {
  try {
    const novo = db.create(req.body);
    res.status(201).json(formatMunicipio(novo));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

// PUT (atualizar)
exports.update = (req, res) => {
  try {
    const atualizado = db.update(req.params.id, req.body);
    if (!atualizado) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(formatMunicipio(atualizado));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

// DELETE
exports.remove = (req, res) => {
  try {
    const removido = db.remove(req.params.id);
    if (!removido) return res.status(404).json({ erro: 'Não encontrado' });
    res.json({ mensagem: 'Removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};