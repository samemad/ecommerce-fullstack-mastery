const express = require('express');
const router = express.Router();
const ratingsController= require('../controllers/ratingsController');

router.get('/', ratingsController.getratings);

module.exports = router;