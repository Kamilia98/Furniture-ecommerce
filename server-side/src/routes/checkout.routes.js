const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkout.controller");
const verifyToken = require("../middlewares/auth.middleware");
router.route("/").post(verifyToken, checkoutController.placeOrder);

module.exports = router;
