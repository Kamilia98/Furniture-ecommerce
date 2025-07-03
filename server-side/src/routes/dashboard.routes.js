const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const verifyToken = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics and metrics
 */

/**
 * @swagger
 * /dashboard/metrics:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard metrics
 */
router.route('/metrics').get(dashboardController.getMetrics);

/**
 * @swagger
 * /dashboard/montlySales:
 *   get:
 *     summary: Get monthly sales
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Monthly sales data
 */
router.route('/montlySales').get(dashboardController.getMontlySales);

/**
 * @swagger
 * /dashboard/orderStatus:
 *   get:
 *     summary: Get order status analytics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Order status analytics
 */
router.route('/orderStatus').get(dashboardController.getOrderStatus);

/**
 * @swagger
 * /dashboard/salesGrowth:
 *   get:
 *     summary: Get sales growth by period
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Sales growth data
 */
router.route('/salesGrowth').get(dashboardController.getSalesByPeriod);

/**
 * @swagger
 * /dashboard/featured:
 *   get:
 *     summary: Get featured entities
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Featured entities
 */
router.route('/featured').get(dashboardController.getBestEntities);

module.exports = router;
