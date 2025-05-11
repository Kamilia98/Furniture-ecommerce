const express = require('express');
const router = express.Router();
const currency = require('../controllers/currency.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

router
  .route('/')
  .get(verifyToken, allowedTo('ADMIN', 'MANAGER'), currency.addCurrency)
  .put(verifyToken, allowedTo('ADMIN', 'MANAGER'), currency.updatedCurrency)
  .patch(
    verifyToken,
    allowedTo('ADMIN', 'MANAGER'),
    currency.updatedCurrencyDefault
  )
  .delete(verifyToken, allowedTo('ADMIN', 'MANAGER'), currency.deletCurrency)
  .post(verifyToken, allowedTo('ADMIN', 'MANAGER'), currency.addCurrency);

module.exports = router;
