const express = require('express');
const router = express.Router();
const driverExpenseController = require('../controllers/driverExpenseController');

router.post('/', driverExpenseController.createDriverExpense);
router.get('/truck/:truck_id', driverExpenseController.getDriverExpensesByTruck);
router.get('/by-period', driverExpenseController.getDriverExpensesByPeriod); // <—
router.get('/', driverExpenseController.getAllDriverExpenses);

router.get('/:id', driverExpenseController.getDriverExpenseById);
router.put('/:id', driverExpenseController.updateDriverExpense);
router.delete('/:id', driverExpenseController.deleteDriverExpense);

module.exports = router;
