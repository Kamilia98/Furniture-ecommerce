const express = require("express");
const productController = require("../controllers/product.controller");
const router = express.Router();
const varifyToken = require("../middlewares/auth.middleware");

router.route("/").get(productController.getAllProducts);
router.route("/all").get(productController.getAllProductNamesAndIds);
router.route("/search").get(productController.getSearchProducts);
router.route("/:product_id").get(productController.getProductById);
router
  .route("/category/:category_id")
  .get(productController.getProductsByCategory);
router
  .route("/comparison/:product_id")
  .get(productController.getProductForComparison);

module.exports = router;
