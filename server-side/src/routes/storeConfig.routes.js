const express = require('express');
const router = express.Router();
const storeConfigController = require('../controllers/storeConfig.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

router
  .route('/')
  .get(verifyToken, storeConfigController.getStoreConfig)
  .put(verifyToken, storeConfigController.updateStoreConfig);

module.exports = router;
