const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth.middleware");
const oderController = require("../controllers/order.controller");

router.route("/").get(verifyToken, oderController.getOrders); // GET All Orders
module.exports = router;
