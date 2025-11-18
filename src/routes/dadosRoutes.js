const express = require('express');
const router = express.Router();
const controller = require('../controllers/dadosController');
const auth = require('../middleware/auth');

// Todas as rotas protegidas por API Key
router.use(auth);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/distrito/:distrito', controller.getByDistrito);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;