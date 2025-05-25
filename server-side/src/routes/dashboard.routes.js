const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.route('/metrics').get(dashboardController.getMetrics);
router.route('/montlySales').get(dashboardController.getMontlySales);
router.route('/orderStatus').get(dashboardController.getOrderStatus);
router.route('/salesGrowth').get(dashboardController.getSalesByPeriod);
router.route('/featured').get(dashboardController.getBestEntities);

module.exports = router;
