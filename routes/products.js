
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /products - Get all products
router.get('/', productController.getAllProducts);

// GET /products/:id - Get single product
router.get('/:id', productController.getProductById);

module.exports = router;
