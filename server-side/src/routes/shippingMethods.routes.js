const express = require('express');
const router = express.Router();
const shippingMethod = require('../controllers/shippingMethods.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

router
  .route('/')
  .get(
    verifyToken,
    allowedTo('ADMIN', 'OWNER'),
    shippingMethod.getShippingMethods
  )
  .put(
    verifyToken,
    allowedTo('ADMIN', 'OWNER'),
    shippingMethod.updatedShippingMethod
  )
  .delete(
    verifyToken,
    allowedTo('ADMIN', 'OWNER'),
    shippingMethod.deletShippingMethod
  )
  .post(
    verifyToken,
    allowedTo('ADMIN', 'OWNER'),
    shippingMethod.addShippingMethod
  );

module.exports = router;
