const express = require('express');
const router = express.Router();
const storeConfigController = require('../controllers/storeConfig.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware'); 

router.route('/')
  .get(verifyToken, allowedTo('ADMIN',"MANAGER"), storeConfigController.getStoreConfig)
  .put(verifyToken, allowedTo('ADMIN',"MANAGER"), storeConfigController.updateStoreConfig);

module.exports = router;