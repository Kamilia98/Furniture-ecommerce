const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout.controller');
const verifyToken = require('../middlewares/auth.middleware');
// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // max 100 requests per windowMs
// });

// router.use(limiter);

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Checkout and order placement
 */

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Place an order
 *     tags: [Checkout]
 *     responses:
 *       201:
 *         description: Order placed
 */
router.route('/').post(verifyToken, checkoutController.placeOrder);

module.exports = router;
