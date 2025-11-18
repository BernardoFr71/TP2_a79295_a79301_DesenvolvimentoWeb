const Municipio = require('../models/Municipio');

// GET todos (com paginação e filtro por distrito)
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const distrito = req.query.distrito;

    const filter = distrito ? { distrito: new RegExp(distrito, 'i') } : {};

    const total = await Municipio.countDocuments(filter);
    const dados = await Municipio.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ nome: 1 });

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: dados
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET por ID (_id do MongoDB)
exports.getById = async (req, res) => {
  try {
    const dado = await Municipio.findById(req.params.id);
    if (!dado) return res.status(404).json({ erro: 'Município não encontrado' });
    res.json(dado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET por distrito (ex: /distrito/porto)
exports.getByDistrito = async (req, res) => {
  try {
    const dados = await Municipio.find({ 
      distrito: new RegExp(req.params.distrito, 'i') 
    }).sort({ nome: 1 });
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST (criar manualmente - útil para testes)
exports.create = async (req, res) => {
  try {
    const novo = new Municipio(req.body);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

// PUT (atualizar)
exports.update = async (req, res) => {
  try {
    const atualizado = await Municipio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!atualizado) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const removido = await Municipio.findByIdAndDelete(req.params.id);
    if (!removido) return res.status(404).json({ erro: 'Não encontrado' });
    res.json({ mensagem: 'Removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};