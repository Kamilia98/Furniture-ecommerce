const express = require("express");
const { getAllCategories } = require("../controllers/category.controller");

const router = express.Router();

// 1- Get all categories
router.route("/").get(getAllCategories);

module.exports = router;