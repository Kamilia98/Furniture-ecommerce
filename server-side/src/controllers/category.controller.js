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

module.exports = {
  getAllCategories,
  getCategoryDetails,
};
