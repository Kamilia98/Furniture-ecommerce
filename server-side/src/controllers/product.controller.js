const mongoose = require('mongoose');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const Product = require('../models/product.model');
const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const Joi = require('joi');

const getAllProducts = asyncWrapper(async (req, res, next) => {
  let {
    limit = 16,
    page = 1,
    categories = '',
    order = 'desc',
    sortBy = 'date',
    minPrice,
    maxPrice,
  } = req.query;

  limit = Number(limit);
  page = Number(page);
  if (isNaN(limit) || isNaN(page) || limit < 1 || page < 1) {
    return next(
      new AppError('Invalid pagination parameters.', 400, httpStatusText.FAIL)
    );
  }

  const skip = (page - 1) * limit;
  const sortFields = {
    name: 'name',
    date: 'date',
    price: 'effectivePrice',
  };
  const sortField = sortFields[sortBy] || sortFields.date;
  const sortOrder = order === 'asc' ? 1 : -1;

  const categoryFilter = {
    deleted: false,
    ...(categories && {
      categories: {
        $in: categories.split(',').map((id) => {
          if (!mongoose.isValidObjectId(id.trim())) {
            throw new AppError(
              'Invalid Category ID format.',
              400,
              httpStatusText.FAIL
            );
          }
          return new mongoose.Types.ObjectId(id.trim());
        }),
      },
    }),
  };

  // Fetch min & max price dynamically if not provided
  if (!minPrice || !maxPrice) {
    const range = await getPriceRange();
    minPrice = minPrice ?? range.minPrice;
    maxPrice = maxPrice ?? range.maxPrice;
  }

  const priceFilter = {
    effectivePrice: {
      $gte: Number(minPrice),
      $lte: Number(maxPrice),
    },
  };

  const combinedFilter = [
    { $match: categoryFilter },
    { $addFields: { effectivePrice: calculateEffectivePrice() } },
    { $match: priceFilter },
  ];

  const [totalProducts, products] = await Promise.all([
    getTotalProducts(combinedFilter),
    getFilteredProducts(combinedFilter, sortField, sortOrder, skip, limit),
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { totalProducts, products },
  });
});

const getAllProductsWithColors = asyncWrapper(async (req, res, next) => {
  let {
    limit = 16,
    page = 1,
    categories = '',
    order = 'desc',
    sortBy = 'date',
    minPrice,
    maxPrice,
    searchQuery = '',
  } = req.query;

  limit = Number(limit);
  page = Number(page);
  const skip = (page - 1) * limit;

  if (isNaN(limit) || isNaN(page) || limit < 1 || page < 1) {
    return next(
      new AppError('Invalid pagination parameters.', 400, httpStatusText.FAIL)
    );
  }

  const sortFields = {
    name: 'name',
    date: 'date',
    price: 'price',
    sale: 'sale',
  };
  const sortField = sortFields[sortBy] || sortFields.date;
  const sortOrder = order === 'asc' ? 1 : -1;

  // Category filter
  const categoryFilter = {
    deleted: false,
    ...(categories && {
      categories: {
        $in: categories.split(',').map((id) => {
          if (!mongoose.isValidObjectId(id.trim())) {
            throw new AppError(
              'Invalid Category ID format.',
              400,
              httpStatusText.FAIL
            );
          }
          return new mongoose.Types.ObjectId(id.trim());
        }),
      },
    }),
  };

  const searchFilter = searchQuery
    ? {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { 'categories.name': { $regex: searchQuery, $options: 'i' } },
        ],
      }
    : {};

  // Fetch raw products first
  const products = await Product.find({ ...categoryFilter, ...searchFilter })
    .select('name price sale colors categories date')
    .populate('categories', 'name')
    .lean();

  // Format with color variations
  let flatProducts = products.map((product) => {
    const effectivePrice =
      product.sale > 0
        ? product.price * (1 - product.sale / 100)
        : product.price;
    return {
      _id: product._id,
      name: product.name,
      price: product.price,
      sale: product.sale,
      categories: product.categories.map((cat) => cat.name).join(', '),
      date: product.date,
      effectivePrice,
      salePrice: effectivePrice.toFixed(2),
      varients: product.colors.map((color) => ({
        color: { hex: color.hex, name: color.name },
        quantity: color.quantity,
      })),
    };
  });

  // Determine min/max price if not provided
  if (!minPrice || !maxPrice) {
    const prices = flatProducts.map((p) => p.effectivePrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    minPrice = minPrice ?? min;
    maxPrice = maxPrice ?? max;
  }

  // Apply price filtering
  flatProducts = flatProducts.filter(
    (item) =>
      item.effectivePrice >= Number(minPrice) &&
      item.effectivePrice <= Number(maxPrice)
  );

  // Sorting
  flatProducts.sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'string') {
      return sortOrder * valA.localeCompare(valB);
    } else {
      return sortOrder * (valA - valB);
    }
  });

  const totalProducts = flatProducts.length;

  // Pagination
  const paginatedProducts = flatProducts.slice(skip, skip + limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      totalProducts,
      products: paginatedProducts,
    },
  });
});

const getPriceRange = async () => {
  const [result] = await Product.aggregate([
    { $addFields: { effectivePrice: calculateEffectivePrice() } },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$effectivePrice' },
        maxPrice: { $max: '$effectivePrice' },
      },
    },
  ]);
  return result || { minPrice: 0, maxPrice: 0 };
};

const getTotalProducts = async (filters) => {
  const result = await Product.aggregate([...filters, { $count: 'total' }]);
  return result[0]?.total || 0;
};

const getFilteredProducts = async (
  filters,
  sortField,
  sortOrder,
  skip,
  limit
) => {
  return await Product.aggregate([
    ...filters,
    { $sort: { [sortField]: sortOrder } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'categories',
        localField: 'categories',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $addFields: {
        firstColor: { $arrayElemAt: ['$colors', 0] },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        subtitle: 1,
        image: { $arrayElemAt: ['$firstColor.images.url', 0] },
        price: 1,
        date: 1,
        sale: 1,
        quantity: '$firstColor.quantity',
        effectivePrice: 1,
        mainColor: '$firstColor.hex',
        categories: {
          $map: {
            input: '$categories',
            as: 'category',
            in: { _id: '$$category._id', name: '$$category.name' },
          },
        },
      },
    },
  ]);
};

const calculateEffectivePrice = () => ({
  $cond: {
    if: { $gt: ['$sale', 0] },
    then: {
      $multiply: ['$price', { $subtract: [1, { $divide: ['$sale', 100] }] }],
    },
    else: '$price',
  },
});

const getProductById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(
      new AppError('Product ID is required', 400, httpStatusText.FAIL)
    );
  }
  if (!mongoose.isValidObjectId(id)) {
    return next(
      new AppError('Invalid Product ID format', 400, httpStatusText.FAIL)
    );
  }

  const product = await Product.findById(id)
    .select(
      '_id name subtitle price date sale categories description brand colors additionalInformation'
    )
    .populate('categories', 'name')
    .lean();

  if (!product) {
    return next(new AppError('Product not found', 404, httpStatusText.FAIL));
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { product },
  });
});

const getMinEffectivePrice = asyncWrapper(async (req, res, next) => {
  const minPrice = await Product.aggregate([
    {
      $addFields: {
        effectivePrice: {
          $cond: {
            if: { $gt: ['$sale', 0] },
            then: {
              $multiply: [
                '$price',
                { $subtract: [1, { $divide: ['$sale', 100] }] },
              ],
            },
            else: '$price',
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        minEffectivePrice: { $min: '$effectivePrice' },
      },
    },
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      minEffectivePrice: minPrice.length ? minPrice[0].minEffectivePrice : 0,
    },
  });
});

const getMaxEffectivePrice = asyncWrapper(async (req, res, next) => {
  const maxPrice = await Product.aggregate([
    {
      $addFields: {
        effectivePrice: {
          $cond: {
            if: { $gt: ['$sale', 0] },
            then: {
              $multiply: [
                '$price',
                { $subtract: [1, { $divide: ['$sale', 100] }] },
              ],
            },
            else: '$price',
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        maxEffectivePrice: { $max: '$effectivePrice' },
      },
    },
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      maxEffectivePrice: maxPrice.length ? maxPrice[0].maxEffectivePrice : 0,
    },
  });
});

const getProductForComparison = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(
      new AppError('Product ID is required', 400, httpStatusText.FAIL)
    );
  }

  if (!mongoose.isValidObjectId(id)) {
    return next(
      new AppError('Invalid Product ID format', 400, httpStatusText.FAIL)
    );
  }

  const product = await Product.findById(id)
    .select(
      '_id name subtitle productImages price quantity date sale categories description colors sizes brand additionalInformation'
    )
    .populate('categories', 'name')
    .lean();

  if (!product) {
    return next(new AppError('Product not found', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      product,
    },
  });
});

const getSearchProducts = asyncWrapper(async (req, res, next) => {
  const { query } = req.query;
  if (!query) {
    return next(
      new AppError('Please enter a search keyword!', 400, httpStatusText.FAIL)
    );
  }

  const categoryIds = await getCategoryIds(query);

  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { categories: { $in: categoryIds } },
    ],
  })
    .populate('categories', 'name')
    .lean();

  if (!products.length) {
    return next(new AppError('No products found.', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: products,
  });
});

const getProductMetrics = asyncWrapper(async (req, res) => {
  const totalProducts = await Product.countDocuments({ deleted: false });

  const lowStockAggregation = await Product.aggregate([
    { $unwind: '$colors' },
    { $match: { 'colors.quantity': { $lt: 5 } } },
    {
      $group: {
        _id: '$_id',
        productName: { $first: '$name' },
      },
    },
    { $count: 'lowStockCount' },
  ]);
  const lowStockCount = lowStockAggregation[0]?.lowStockCount || 0;

  const bestSeller = await Product.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'orderItems.id',
        as: 'orders',
      },
    },
    { $unwind: '$orders' },
    { $unwind: '$orders.orderItems' },
    {
      $match: {
        $expr: { $eq: ['$orders.orderItems.id', '$_id'] },
      },
    },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        brand: { $first: '$brand' },
        count: { $sum: '$orders.orderItems.quantity' },
        image: { $first: { $arrayElemAt: ['$colors.images.url', 0] } },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  const bestSellingProduct = bestSeller[0] || null;

  res.status(200).json({
    status: 'success',
    data: {
      totalProducts,
      lowStockCount,
      bestSellingProduct,
    },
  });
});

async function getCategoryIds(query) {
  const categories = await require('../models/category.model')
    .find({ name: { $regex: query, $options: 'i' } })
    .select('_id')
    .lean();
  return categories.map((cat) => cat._id);
}

const deleteProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError('Invalid product ID.', 400, httpStatusText.FAIL));
  }

  const product = await Product.findByIdAndUpdate(id, { deleted: true });

  if (!product) {
    return next(new AppError('Product not found.', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'Product soft-deleted successfully.',
  });
});

const productSchema = Joi.object({
  name: Joi.string().required(),
  subtitle: Joi.string().optional().allow(''),
  price: Joi.number().required().min(0),
  sale: Joi.number().min(0).max(100).optional(),
  colors: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().required().min(0),
        images: Joi.array()
          .items(
            Joi.object({
              url: Joi.string().uri().required(),
            })
          )
          .required(),
      })
    )
    .required(),
  categories: Joi.alternatives()
    .try(
      Joi.string().custom((value, helpers) => {
        const ids = value.split(',').map((id) => id.trim());
        if (!ids.every((id) => mongoose.isValidObjectId(id))) {
          return helpers.message('Invalid category ID(s)');
        }
        return ids;
      }),
      Joi.array().items(
        Joi.string().custom((id, helpers) => {
          if (!mongoose.isValidObjectId(id)) {
            return helpers.message('Invalid category ID');
          }
          return id;
        })
      )
    )
    .required(),
});

const createProduct = asyncWrapper(async (req, res, next) => {
  // const { error, value } = productSchema.validate(req.query, {
  //   abortEarly: false,
  // });

  // if (error) {
  //   return next(
  //     new AppError(
  //       error.details.map((e) => e.message).join(", "),
  //       400,
  //       httpStatusText.FAIL
  //     )
  //   );
  // }

  const {
    name,
    subtitle,
    price,
    sale = 0,
    colors,
    categories,
    description,
    brand,
    additionalInformation,
  } = req.body;
  const categoryArray = Array.isArray(categories)
    ? categories
    : categories.split(',').map((id) => id.trim());

  const product = await Product.create({
    name,
    subtitle,
    price,
    sale,
    colors,
    description,
    brand,
    additionalInformation,
    categories: categoryArray.map((id) => new mongoose.Types.ObjectId(id)),
    deleted: false,
    date: new Date(),
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: 'Product created successfully.',
    data: product,
  });
});

const updateProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { error, value } = productSchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    return next(
      new AppError(
        error.details.map((e) => e.message).join(', '),
        400,
        httpStatusText.FAIL
      )
    );
  }

  const { name, subtitle, price, sale = 0, colors, categories } = value;

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError('Invalid product ID.', 400, httpStatusText.FAIL));
  }

  const categoryArray = Array.isArray(categories)
    ? categories
    : categories.split(',').map((id) => id.trim());

  const updated = await Product.findByIdAndUpdate(
    id,
    {
      name,
      subtitle,
      price,
      sale,
      colors,
      categories: categoryArray.map((id) => new mongoose.Types.ObjectId(id)),
    },
    { new: true }
  );

  if (!updated) {
    return next(new AppError('Product not found.', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'Product updated successfully.',
    data: updated,
  });
});

module.exports = {
  getAllProducts,
  getProductById,
  getMinEffectivePrice,
  getMaxEffectivePrice,
  getProductForComparison,
  getSearchProducts,
  getProductMetrics,
  deleteProduct,
  createProduct,
  updateProduct,
  getAllProductsWithColors,
};
