const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
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
 *   name: Payment
 *   description: Payment processing
 */

/**
 * @swagger
 * /payments/payment:
 *   post:
 *     summary: Create a payment intent
 *     tags: [Payment]
 *     responses:
 *       201:
 *         description: Payment intent created
 */
router
  .route('/payment')
  .post(verifyToken, paymentController.createPaymentIntent);

module.exports = router;
