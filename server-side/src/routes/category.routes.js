const express = require('express');
const categoriesController = require('../controllers/category.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

// 1- Get all categories
router.route('/analytics').get(verifyToken, categoriesController.getCategoriesAnalytics);
router.route('/:id').get(verifyToken, categoriesController.getCategoryDetails);
router.route('/:id').patch(verifyToken, categoriesController.editCategory);
router.route('/:id').delete(verifyToken, categoriesController.deleteCategory);
router.route('/').post(verifyToken, categoriesController.addCategory);
router.route('/').get(categoriesController.getAllCategories);


module.exports = router;
