const express = require('express');
const router = express.Router();
const shippingMethod = require('../controllers/shippingMethods.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

/**
 * @swagger
 * tags:
 *   name: ShippingMethods
 *   description: Shipping methods management
 */

/**
 * @swagger
 * /shippings:
 *   get:
 *     summary: Get all shipping methods
 *     tags: [ShippingMethods]
 *     responses:
 *       200:
 *         description: List of shipping methods
 *   put:
 *     summary: Update a shipping method
 *     tags: [ShippingMethods]
 *     responses:
 *       200:
 *         description: Shipping method updated
 *   delete:
 *     summary: Delete a shipping method
 *     tags: [ShippingMethods]
 *     responses:
 *       200:
 *         description: Shipping method deleted
 *   post:
 *     summary: Add a new shipping method
 *     tags: [ShippingMethods]
 *     responses:
 *       201:
 *         description: Shipping method added
 */
router
  .route('/')
  .get(verifyToken, shippingMethod.getShippingMethods)
  .put(verifyToken, shippingMethod.updatedShippingMethod)
  .delete(verifyToken, shippingMethod.deletShippingMethod)
  .post(verifyToken, shippingMethod.addShippingMethod);

module.exports = router;
