const express = require('express');
const router = express.Router();
const language = require('../controllers/language.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

router
  .route('/')
  .get(verifyToken, language.addLanguage)
  .put(verifyToken, language.updatedLanguage)
  .patch(verifyToken, language.updatedLanguageDefault)
  .delete(verifyToken, language.deletLanguage)
  .post(verifyToken, language.addLanguage);

module.exports = router;
