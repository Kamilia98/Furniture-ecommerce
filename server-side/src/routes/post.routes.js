const express = require('express');
const router = express.Router();
const postControllers = require('../controllers/post.controller');
// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // max 100 requests per windowMs
// });

// router.use(limiter);

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Blog post management
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     responses:
 *       201:
 *         description: Post created
 *   delete:
 *     summary: Delete all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: All posts deleted
 */
router.route('/').get(postControllers.getAllPosts).post().delete();

/**
 * @swagger
 * /posts/recent:
 *   get:
 *     summary: Get recent posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of recent posts
 */
router.route('/recent').get(postControllers.getRecentPosts);

/**
 * @swagger
 * /posts/categories:
 *   get:
 *     summary: Get post categories
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of post categories
 */
router.route('/categories').get(postControllers.getCategories);

/**
 * @swagger
 * /posts/related:
 *   get:
 *     summary: Get related posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of related posts
 */
router.route('/related').get(postControllers.getRelatedPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 */
router.route('/:id').get(postControllers.getPostById);

module.exports = router;
