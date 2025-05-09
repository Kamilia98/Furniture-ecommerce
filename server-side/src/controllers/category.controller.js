const Category = require('../models/category.model');
const Product = require('../models/product.model');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const mongoose = require('mongoose');

const getAllCategories = asyncWrapper(async (req, res, next) => {
  const { searchQuery, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const matchStage = searchQuery
    ? { name: { $regex: searchQuery, $options: 'i' } }
    : {};

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  const sortStage = {
    [sortBy]: sortOrder === 'desc' ? -1 : 1,
  };

  const categoriesWithProductCountAndSales = await Category.aggregate([
    { $match: matchStage },
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
        productCount: { $size: '$products' },
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
  if (!categoriesWithProductCountAndSales.length) {
    return next(new AppError('No categories found.', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      categories: categoriesWithProductCountAndSales,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCategories / pageSize),
      totalCategories,
    },
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
      $addFields: {
        totalProducts: { $size: '$products' },
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
        totalSales: {
          $sum: {
            $map: {
              input: '$orders',
              as: 'order',
              in: {
$round:[

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
  },2
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

  console.log(categoryDetails[0])

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { category: categoryDetails[0] },
  });
});


const getCategoriesAnalytics = asyncWrapper(async (req, res, next) => {
  console.log(1)
  const categorySummary = await Category.aggregate([
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
                        '$$item.quantity', // Sum the quantity of items sold
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
    {
      $sort: { totalItemsSold: -1 }, // Sort by total items sold in descending order
    },
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 }, // Count total categories
        categories: { $push: { name: '$name', totalItemsSold: '$totalItemsSold' } }, // Push all categories with their sales
      },
    },
    {
      $addFields: {
        mostSalledCategory: { $arrayElemAt: ['$categories', 0] }, // Most sold category
        leastSalledCategory: { $arrayElemAt: ['$categories', -1] }, // Least sold category
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

  if (!categorySummary.length) {
    return next(new AppError('No categories found.', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: categorySummary[0],
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
  const { id } = req.params;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid category ID.', 400, httpStatusText.FAIL));
  }

  const deletedCategory = await Category.findByIdAndDelete(id);

  if (!deletedCategory) {
    return next(new AppError('Category not found.', 404, httpStatusText.FAIL));
  }

  await Product.updateMany(
    { categories: id }, 
    { $pull: { categories: id } } 
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
  getCategoriesAnalytics,
  editCategory,
  addCategory,
  deleteCategory,
};
