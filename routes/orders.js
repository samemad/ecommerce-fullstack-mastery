const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.get('/details', orderController.getOrdersWithDetails);

module.exports = router;