const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Rotas para relatórios
router.get('/balance/:truck_id', reportController.getTruckBalance);
router.get('/monthly/:truck_id', reportController.getMonthlyTruckSummary);
router.get('/monthly', reportController.getGeneralMonthlySummary);
router.get('/driver_expenses', reportController.getDriverExpensesTotal);

module.exports = router;

