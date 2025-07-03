const express = require('express');
const router = express.Router();
const language = require('../controllers/language.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');

/**
 * @swagger
 * tags:
 *   name: Language
 *   description: Language management
 */

/**
 * @swagger
 * /language:
 *   get:
 *     summary: Get all languages
 *     tags: [Language]
 *     responses:
 *       200:
 *         description: List of languages
 *   put:
 *     summary: Update a language
 *     tags: [Language]
 *     responses:
 *       200:
 *         description: Language updated
 *   patch:
 *     summary: Set default language
 *     tags: [Language]
 *     responses:
 *       200:
 *         description: Default language set
 *   delete:
 *     summary: Delete a language
 *     tags: [Language]
 *     responses:
 *       200:
 *         description: Language deleted
 *   post:
 *     summary: Add a new language
 *     tags: [Language]
 *     responses:
 *       201:
 *         description: Language added
 */
router
  .route('/')
  .get(verifyToken, language.addLanguage)
  .put(verifyToken, language.updatedLanguage)
  .patch(verifyToken, language.updatedLanguageDefault)
  .delete(verifyToken, language.deletLanguage)
  .post(verifyToken, language.addLanguage);

module.exports = router;
