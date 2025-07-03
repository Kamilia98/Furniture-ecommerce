const express = require('express');
const router = express.Router();
const currency = require('../controllers/currency.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: Currency management
 */

/**
 * @swagger
 * /currency:
 *   get:
 *     summary: Get all currencies
 *     tags: [Currency]
 *     responses:
 *       200:
 *         description: List of currencies
 *   put:
 *     summary: Update a currency
 *     tags: [Currency]
 *     responses:
 *       200:
 *         description: Currency updated
 *   patch:
 *     summary: Set default currency
 *     tags: [Currency]
 *     responses:
 *       200:
 *         description: Default currency set
 *   delete:
 *     summary: Delete a currency
 *     tags: [Currency]
 *     responses:
 *       200:
 *         description: Currency deleted
 *   post:
 *     summary: Add a new currency
 *     tags: [Currency]
 *     responses:
 *       201:
 *         description: Currency added
 */
router
  .route('/')
  .get(verifyToken, currency.addCurrency)
  .put(verifyToken, currency.updatedCurrency)
  .patch(verifyToken, currency.updatedCurrencyDefault)
  .delete(verifyToken, currency.deletCurrency)
  .post(verifyToken, currency.addCurrency);

module.exports = router;
