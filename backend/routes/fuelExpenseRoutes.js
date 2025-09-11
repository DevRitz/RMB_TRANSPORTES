const express = require('express');
const router = express.Router();
const fuelExpenseController = require('../controllers/fuelExpenseController');

router.post('/', fuelExpenseController.createFuelExpense);
router.get('/truck/:truck_id', fuelExpenseController.getFuelExpensesByTruck);
router.get('/by-period', fuelExpenseController.getFuelExpensesByPeriod); // <—
router.get('/', fuelExpenseController.getAllFuelExpenses);

router.get('/:id', fuelExpenseController.getFuelExpenseById);
router.put('/:id', fuelExpenseController.updateFuelExpense);
router.delete('/:id', fuelExpenseController.deleteFuelExpense);

module.exports = router;
