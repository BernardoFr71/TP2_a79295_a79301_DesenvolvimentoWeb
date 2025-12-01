const express = require('express');
const router = express.Router();
const controller = require('../controllers/dadosController');
const auth = require('../middleware/auth');

// Todas as rotas protegidas por API Key
router.use(auth);

// IMPORTANTE: Rotas mais específicas primeiro!
router.get('/distrito/:distrito', controller.getByDistrito);
router.get('/codigo/:codigo', controller.getByCodigo);
router.get('/nome/:nome', controller.getByNome);

// Rotas gerais
router.get('/', controller.getAll);
router.get('/:id', controller.getById);  // Busca por ObjectId do MongoDB

// Rotas de modificação
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;