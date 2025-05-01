const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

// Admin - Get all orders
router.get('/all', orderController.getAllOrders);
router.get('/analytics', orderController.getOrderAnalytics);

// User - Get their own orders
router.get('/', verifyToken, orderController.getUserOrders);

// User/Admin - Get details of a single order
router.get('/:id', orderController.getOrderDetails);

// Admin - Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
