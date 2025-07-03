const express = require('express');
const router = express.Router();
const currency = require('../controllers/currency.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

router
  .route('/')
  .get(verifyToken, currency.addCurrency)
  .put(verifyToken, currency.updatedCurrency)
  .patch(verifyToken, currency.updatedCurrencyDefault)
  .delete(verifyToken, currency.deletCurrency)
  .post(verifyToken, currency.addCurrency);

module.exports = router;
