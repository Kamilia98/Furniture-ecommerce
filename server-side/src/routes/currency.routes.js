const express = require('express');
const router = express.Router();
const currency = require('../controllers/currency.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

router
  .route('/')
  .get(verifyToken, allowedTo('ADMIN', 'OWNER'), currency.addCurrency)
  .put(verifyToken, allowedTo('ADMIN', 'OWNER'), currency.updatedCurrency)
  .patch(
    verifyToken,
    allowedTo('ADMIN', 'OWNER'),
    currency.updatedCurrencyDefault
  )
  .delete(verifyToken, allowedTo('ADMIN', 'OWNER'), currency.deletCurrency)
  .post(verifyToken, allowedTo('ADMIN', 'OWNER'), currency.addCurrency);

module.exports = router;
