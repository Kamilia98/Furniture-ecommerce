const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
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
 *   name: Cart
 *   description: User cart management
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: User cart details
 *   post:
 *     summary: Add items to cart
 *     tags: [Cart]
 *     responses:
 *       201:
 *         description: Items added to cart
 *   patch:
 *     summary: Update user cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart updated
 */
router.route('/').get(verifyToken, cartController.getUserCart);
router
  .route('/')
  .post(verifyToken, cartController.addToCart)
  .patch(verifyToken, cartController.updateCart);

module.exports = router;
