const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders/all:
 *   get:
 *     summary: Get all orders (admin)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get('/all', verifyToken, orderController.getAllOrders);

/**
 * @swagger
 * /orders/analytics:
 *   get:
 *     summary: Get order analytics (admin)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order analytics data
 */
router.get('/analytics', verifyToken, orderController.getOrderAnalytics);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/', verifyToken, orderController.getUserOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', verifyToken, orderController.getOrderDetails);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status by ID (admin)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch('/:id/status', verifyToken, orderController.updateOrderStatus);

module.exports = router;
