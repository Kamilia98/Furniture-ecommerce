const express = require('express');
const router = express.Router();
const shippingMethod = require('../controllers/shippingMethods.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

router
  .route('/')
  .get(verifyToken, shippingMethod.getShippingMethods)
  .put(verifyToken, shippingMethod.updatedShippingMethod)
  .delete(verifyToken, shippingMethod.deletShippingMethod)
  .post(verifyToken, shippingMethod.addShippingMethod);

module.exports = router;
