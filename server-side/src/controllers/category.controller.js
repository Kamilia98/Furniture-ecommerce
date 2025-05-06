const Category = require('../models/category.model');
const Product = require('../models/product.model');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const mongoose = require('mongoose');

const getAllCategories = asyncWrapper(async (req, res, next) => {
  const categoriesWithProductCount = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'categories',
        as: 'products',
      },
    },
    {
      $project: {
        name: 1,
        image: 1,
        description: 1,
        productCount: { $size: '$products' },
      },
    },
  ]);

  if (!categoriesWithProductCount.length) {
    return next(new AppError('No categories found.', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { categories: categoriesWithProductCount },
  });
});

const getCategoryDetails = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid category ID.', 400, httpStatusText.FAIL));
  }

  const existingCategory = await Category.findById(id);
  if (!existingCategory) {
    return next(new AppError('Category not found.', 404, httpStatusText.FAIL));
  }

  const categoryDetails = await Category.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'categories',
        as: 'products',
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        image: 1,
        products: 1,
      },
    },
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { category: categoryDetails[0] },
  });
});

const editCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image } = req.body;

  // Validate the category ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid category ID.', 400, httpStatusText.FAIL));
  }

  // Find and update the category
  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { name, description, image },
    { new: true, runValidators: true } // Return the updated document and validate the input
  );

  // If the category is not found
  if (!updatedCategory) {
    return next(new AppError('Category not found.', 404, httpStatusText.FAIL));
  }

  // Respond with the updated category
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { category: updatedCategory },
  });
});

const addCategory = asyncWrapper(async (req, res, next) => {
  const { name, description, image } = req.body;

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return next(
      new AppError(
        'Category with this name already exists.',
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Create a new category
  const newCategory = await Category.create({ name, description, image });

  // Respond with the newly created category
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { category: newCategory },
  });
});

const deleteCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params; // Get the category ID from the request parameters
  console.log(id);
  // Validate the category ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid category ID.', 400, httpStatusText.FAIL));
  }

  // Find and delete the category
  const deletedCategory = await Category.findByIdAndDelete(id);

  // If the category is not found
  if (!deletedCategory) {
    return next(new AppError('Category not found.', 404, httpStatusText.FAIL));
  }

  // Remove the category reference from all products
  await Product.updateMany(
    { categories: id }, // Find products that reference the deleted category
    { $pull: { categories: id } } // Remove the category ID from the categories array
  );

  // Respond with a success message
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message:
      'Category deleted successfully and references removed from products.',
  });
});

module.exports = {
  getAllCategories,
  getCategoryDetails,
  editCategory,
  addCategory,
  deleteCategory,
};
