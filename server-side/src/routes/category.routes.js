const express = require('express');
const categoriesController = require('../controllers/category.controller');
const router = express.Router();

// 1- Get all categories
router.route('/:id').get(categoriesController.getCategoryDetails);
router.route('/').get(categoriesController.getAllCategories);

module.exports = router;
