const verifyToken = require('../middlewares/auth.middleware');
const permessionTo = require('../middlewares/permissionTo.middleware');
const express = require('express');
const productController = require('../controllers/product.controller');

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
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
router.route('/').get(productController.getAllProducts);

/**
 * @swagger
 * /products/analytics:
 *   get:
 *     summary: Get product analytics
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Product analytics data
 */
router.route('/analytics').get(productController.getProductMetrics);

/**
 * @swagger
 * /products/color:
 *   get:
 *     summary: Get all products with colors
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products with colors
 */
router.route('/color').get(productController.getAllProductsWithColors);

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Search results
 */
router.route('/search').get(productController.getSearchProducts);

/**
 * @swagger
 * /products/min-price:
 *   get:
 *     summary: Get minimum effective price
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Minimum price
 */
router.route('/min-price').get(productController.getMinEffectivePrice);

/**
 * @swagger
 * /products/max-price:
 *   get:
 *     summary: Get maximum effective price
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Maximum price
 */
router.route('/max-price').get(productController.getMaxEffectivePrice);

/**
 * @swagger
 * /products/comparison/{id}:
 *   get:
 *     summary: Get product for comparison
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product for comparison
 */
router.route('/comparison/:id').get(productController.getProductForComparison);

/**
 * @swagger
 * /products/create:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     responses:
 *       201:
 *         description: Product created
 */
router.route('/create').post(productController.createProduct);

/**
 * @swagger
 * /products/update/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product updated
 */
router.route('/update/:id').patch(productController.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *   delete:
 *     summary: Delete product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.route('/:id').get(productController.getProductById);
router.route('/:id').delete(productController.deleteProduct);

module.exports = router;
