const mongoose = require('mongoose');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const AppError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');
const asyncWrapper = require('../middlewares/asyncWrapper.middleware');

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==============================
// GET /categories
// ==============================
const getAllCategories = asyncWrapper(async (req, res, next) => {
  const {
    searchQuery,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const matchStage = searchQuery
    ? { name: { $regex: searchQuery, $options: 'i' } }
    : {};

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const sortStage = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const categories = await Category.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'products',
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$$categoryId', '$categories'] },
                  { $eq: ['$deleted', false] },
                ],
              },
            },
          },
        ],
        as: 'products',
      },
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'products._id',
        foreignField: 'orderItems.id',
        as: 'orders',
      },
    },
    {
      $addFields: {
        productCount: { $size: '$products' }, // Count only non-deleted products
        totalSales: {
          $round: [
            {
              $sum: {
                $map: {
                  input: '$orders',
                  as: 'order',
                  in: {
                    $sum: {
                      $map: {
                        input: '$$order.orderItems',
                        as: 'item',
                        in: {
                          $cond: [
                            { $in: ['$$item.id', '$products._id'] },
                            { $multiply: ['$$item.price', '$$item.quantity'] },
                            0,
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
            2,
          ],
        },
      },
    },
    {
      $project: {
        name: 1,
        image: 1,
        description: 1,
        productCount: 1,
        totalSales: 1,
        createdAt: 1,
      },
    },
    { $sort: sortStage },
    { $skip: (pageNumber - 1) * pageSize },
    { $limit: pageSize },
  ]);

  const totalCategories = await Category.countDocuments(matchStage);

  if (!categories.length) {
    return next(new AppError('No categories found.', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      categories,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCategories / pageSize),
      totalCategories,
    },
  });
});

// ==============================
// GET /categories/:id
// ==============================
const getCategoryDetails = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid category ID.', 400, httpStatusText.FAIL));
  }

  const category = await Category.findById(id);
  if (!category) {
    return next(new AppError('Category not found.', 404, httpStatusText.FAIL));
  }

  const details = await Category.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'products',
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$$categoryId', '$categories'] }, // Match products in the category
                  { $eq: ['$deleted', false] }, // Ensure the product is not deleted
                ],
              },
            },
          },
        ],
        as: 'products',
      },
    },
    { $addFields: { totalProducts: { $size: '$products' } } },
    {
      $lookup: {
        from: 'orders',
        localField: 'products._id',
        foreignField: 'orderItems.id',
        as: 'orders',
      },
    },
    {
      $addFields: {
        totalSales: {
          $sum: {
            $map: {
              input: '$orders',
              as: 'order',
              in: {
                $round: [
                  {
                    $sum: {
                      $map: {
                        input: '$$order.orderItems',
                        as: 'item',
                        in: {
                          $cond: [
                            { $in: ['$$item.id', '$products._id'] },
                            { $multiply: ['$$item.price', '$$item.quantity'] },
                            0,
                          ],
                        },
                      },
                    },
                  },
                  2,
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        image: 1,
        totalProducts: 1,
        totalSales: 1,
      },
    },
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { category: details[0] },
  });
});

// ==============================
// GET /categories/analytics
// ==============================
const getCategoriesAnalytics = asyncWrapper(async (req, res, next) => {
  const analytics = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'categories',
        as: 'products',
      },
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'products._id',
        foreignField: 'orderItems.id',
        as: 'orders',
      },
    },
    {
      $addFields: {
        totalItemsSold: {
          $sum: {
            $map: {
              input: '$orders',
              as: 'order',
              in: {
                $sum: {
                  $map: {
                    input: '$$order.orderItems',
                    as: 'item',
                    in: {
                      $cond: [
                        { $in: ['$$item.id', '$products._id'] },
                        '$$item.quantity',
                        0,
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        totalItemsSold: 1,
      },
    },
    { $sort: { totalItemsSold: -1 } },
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        categories: {
          $push: { name: '$name', totalItemsSold: '$totalItemsSold' },
        },
      },
    },
    {
      $addFields: {
        mostSalledCategory: { $arrayElemAt: ['$categories', 0] },
        leastSalledCategory: { $arrayElemAt: ['$categories', -1] },
      },
    },
    {
      $project: {
        _id: 0,
        totalCategories: 1,
        mostSalledCategory: 1,
        leastSalledCategory: 1,
      },
    },
  ]);

  if (!analytics.length) {
    return next(new AppError('No categories found.', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: analytics[0],
  });
});

// ==============================
// Patch /categories/:id
// ==============================
const editCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image } = req.body;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid category ID.', 400, httpStatusText.FAIL));
  }

  const updated = await Category.findByIdAndUpdate(
    id,
    { name, description, image },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return next(new AppError('Category not found.', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { category: updated },
  });
});

// ==============================
// POST /categories
// ==============================
const addCategory = asyncWrapper(async (req, res, next) => {
  const { name, description, image } = req.body;

  const exists = await Category.findOne({ name });
  if (exists) {
    return next(
      new AppError(
        'Category with this name already exists.',
        400,
        httpStatusText.FAIL
      )
    );
  }

  const created = await Category.create({ name, description, image });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { category: created },
  });
});

// ==============================
// DELETE /categories/:id
// ==============================
const deleteCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid category ID.', 400, httpStatusText.FAIL));
  }

  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) {
    return next(new AppError('Category not found.', 404, httpStatusText.FAIL));
  }

  await Product.updateMany({ categories: id }, { $pull: { categories: id } });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message:
      'Category deleted successfully and references removed from products.',
  });
});

// ==============================
// Exports
// ==============================
module.exports = {
  getAllCategories,
  getCategoryDetails,
  getCategoriesAnalytics,
  editCategory,
  addCategory,
  deleteCategory,
};
