const express = require('express');
const router = express.Router();
const language = require('../controllers/language.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

router
  .route('/')
  .get(verifyToken, allowedTo('ADMIN', 'MANAGER'), language.addLanguage)
  .put(verifyToken, allowedTo('ADMIN', 'MANAGER'), language.updatedLanguage)
  .patch(
    verifyToken,
    allowedTo('ADMIN', 'MANAGER'),
    language.updatedLanguageDefault
  )
  .delete(verifyToken, allowedTo('ADMIN', 'MANAGER'), language.deletLanguage)
  .post(verifyToken, allowedTo('ADMIN', 'MANAGER'), language.addLanguage);

module.exports = router;
