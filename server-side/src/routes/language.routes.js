const express = require('express');
const router = express.Router();
const language = require('../controllers/language.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

router
  .route('/')
  .get(verifyToken, allowedTo('ADMIN', 'OWNER'), language.addLanguage)
  .put(verifyToken, allowedTo('ADMIN', 'OWNER'), language.updatedLanguage)
  .patch(
    verifyToken,
    allowedTo('ADMIN', 'OWNER'),
    language.updatedLanguageDefault
  )
  .delete(verifyToken, allowedTo('ADMIN', 'OWNER'), language.deletLanguage)
  .post(verifyToken, allowedTo('ADMIN', 'OWNER'), language.addLanguage);

module.exports = router;
