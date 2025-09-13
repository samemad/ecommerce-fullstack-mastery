const express = require('express');
const router = express.Router();
const totalController = require('../controllers/totalController');

router.get('/', totalController.gettotal);

module.exports = router;