const express = require('express');
const router = express.Router();
const { social, socialVerify } = require('../controllers/auth');

router.get('/social/:social', social);
router.post('/social/:social', socialVerify);

module.exports = router;
