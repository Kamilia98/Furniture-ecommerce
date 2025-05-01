const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

router
  .route('/')
  .get(verifyToken, settingsController.getSettings)
  .patch(verifyToken, settingsController.updateSettings);

router
  .route('/reset')
  .post(verifyToken, settingsController.resetSettings);

module.exports = router;