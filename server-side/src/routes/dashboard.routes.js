const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.route('/metrics').get(dashboardController.getMetrics);
router.route('/montlySales').get(dashboardController.getMontlySales);

module.exports = router;
