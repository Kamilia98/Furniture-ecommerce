const verifyToken = require('../middlewares/auth.middleware');
const permessionTo = require('../middlewares/permissionTo.middleware');
const express = require("express");
const productController = require("../controllers/product.controller");
const router = express.Router();
// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // max 100 requests per windowMs
// });

// router.use(limiter);

router.route("/").get(productController.getAllProducts);
router.route("/color").get(productController.getAllProductsWithColors);
router.route("/search").get(productController.getSearchProducts);
router.route("/min-price").get(productController.getMinEffectivePrice);
router.route("/max-price").get(productController.getMaxEffectivePrice);
router.route("/comparison/:id").get(productController.getProductForComparison);
router.route("/:id").get(productController.getProductById);

router.route("/create").get(verifyToken,permessionTo("manage_products"), productController.createProduct);
router.route("/update/:id").get(verifyToken,permessionTo("manage_products"),productController.updateProduct);
router.route("/:id").delete(verifyToken,permessionTo("manage_products"),productController.deleteProduct);

module.exports = router;
