// backend/routes/otherExpenses.js
const express = require('express');
const router = express.Router();
const otherExpenseController = require('../controllers/otherExpenseController');

// CRUD
router.post('/', otherExpenseController.create);
router.get('/', otherExpenseController.getAll);
router.get('/period', otherExpenseController.getByPeriod);           // ?year=YYYY&month=M
router.get('/totals', otherExpenseController.getTotalsByPeriod);     // opcional
router.get('/totals_by_category', otherExpenseController.getTotalsByCategory); // opcional
router.get('/:id', otherExpenseController.getById);
router.put('/:id', otherExpenseController.update);
router.delete('/:id', otherExpenseController.remove);

module.exports = router;
