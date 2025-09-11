const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');

// criar / listar
router.post('/', revenueController.createRevenue);
router.get('/truck/:truck_id', revenueController.getRevenuesByTruck);
router.get('/', revenueController.getAllRevenues);

// crud por id
router.get('/:id', revenueController.getRevenueById);
router.put('/:id', revenueController.updateRevenue);
router.delete('/:id', revenueController.deleteRevenue);

module.exports = router;
