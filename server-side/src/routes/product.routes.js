const express = require('express');
const productController = require('../controllers/product.controller');
const router = express.Router();

router.route('/').get(productController.getAllProducts);
router.route('/search').get(productController.getSearchProducts);
router.route('/min-price').get(productController.getMinEffectivePrice);
router.route('/max-price').get(productController.getMaxEffectivePrice);

router
  .route('/comparison/:product_id')
  .get(productController.getProductForComparison);

module.exports = router;
