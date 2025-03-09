const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const verifyToken = require("../middlewares/auth.middleware");

router.route("/").get(verifyToken, cartController.getUserCart); // GET User Cart

router
  .route("/")
  .post(verifyToken, cartController.addToCart) // Add Items
  .patch(verifyToken, cartController.updateCart);

module.exports = router;
