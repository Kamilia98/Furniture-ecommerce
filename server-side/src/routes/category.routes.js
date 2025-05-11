const express = require('express');
const categoriesController = require('../controllers/category.controller');
const verifyToken = require('../middlewares/auth.middleware');
const permessionTo = require('../middlewares/permissionTo.middleware');

const router = express.Router();

// 1- Get all categories
router.route('/analytics').get(verifyToken, categoriesController.getCategoriesAnalytics);
router.route('/:id').get(verifyToken, categoriesController.getCategoryDetails);
router.route('/:id').patch(verifyToken,permessionTo("manage_categories"), categoriesController.editCategory);
router.route('/:id').delete(verifyToken,permessionTo("manage_categories"), categoriesController.deleteCategory);
router.route('/').post(verifyToken,permessionTo("manage_categories"), categoriesController.addCategory);
router.route('/').get(categoriesController.getAllCategories);


module.exports = router;
