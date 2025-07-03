const express = require('express');
const categoriesController = require('../controllers/category.controller');
const verifyToken = require('../middlewares/auth.middleware');
const permessionTo = require('../middlewares/permissionTo.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /categories/analytics:
 *   get:
 *     summary: Get categories analytics
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories analytics data
 */
router
  .route('/analytics')
  .get(verifyToken, categoriesController.getCategoriesAnalytics);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category details by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *   patch:
 *     summary: Edit category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     summary: Delete category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.route('/:id').get(verifyToken, categoriesController.getCategoryDetails);
router.route('/:id').patch(verifyToken, categoriesController.editCategory);
router.route('/:id').delete(verifyToken, categoriesController.deleteCategory);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Add a new category
 *     tags: [Categories]
 *     responses:
 *       201:
 *         description: Category added
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.route('/').post(verifyToken, categoriesController.addCategory);
router.route('/').get(categoriesController.getAllCategories);

module.exports = router;
