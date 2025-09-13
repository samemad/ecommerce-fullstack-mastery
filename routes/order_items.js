const express = require('express');
const router = express.Router();
const order_itemsController = require('../controllers/order_itemsController');

router.get('/', order_itemsController.getAllOrder_items);

module.exports = router;