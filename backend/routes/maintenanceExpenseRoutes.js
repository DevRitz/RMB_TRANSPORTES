const express = require('express');
const router = express.Router();
const maintenanceExpenseController = require('../controllers/maintenanceExpenseController');

router.post('/', maintenanceExpenseController.createMaintenanceExpense);
router.get('/truck/:truck_id', maintenanceExpenseController.getMaintenanceExpensesByTruck);
router.get('/by-period', maintenanceExpenseController.getMaintenanceExpensesByPeriod); // <- aqui
router.get('/', maintenanceExpenseController.getAllMaintenanceExpenses);

router.get('/:id', maintenanceExpenseController.getMaintenanceExpenseById);
router.put('/:id', maintenanceExpenseController.updateMaintenanceExpense);
router.delete('/:id', maintenanceExpenseController.deleteMaintenanceExpense);

module.exports = router;
