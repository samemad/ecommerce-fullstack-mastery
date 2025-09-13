const express = require('express');
const router = express.Router();
const sales_reportController = require('../controllers/sales_reportController');

router.get('/', sales_reportController.getsales_report);

module.exports = router;