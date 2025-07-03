const express = require('express');
const {
  updatedImages,
  getImages,
  cloudinaryWebhookHandler,
} = require('../controllers/gallery.controller');

const router = express.Router();
// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // max 100 requests per windowMs
// });

// router.use(limiter);

/**
 * @swagger
 * tags:
 *   name: Gallery
 *   description: Gallery image management
 */

/**
 * @swagger
 * /api/updated-images:
 *   get:
 *     summary: Get updated images
 *     tags: [Gallery]
 *     responses:
 *       200:
 *         description: List of updated images
 */
router.get('/updated-images', updatedImages);

/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: Get all images
 *     tags: [Gallery]
 *     responses:
 *       200:
 *         description: List of images
 */
router.get('/images', getImages);
// router.post("/cloudinary-webhook", cloudinaryWebhookHandler);

module.exports = router;
