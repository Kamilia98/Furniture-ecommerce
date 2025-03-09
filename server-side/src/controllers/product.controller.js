const mongoose = require("mongoose");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const Product = require("../models/product.model");
const asyncWrapper = require("../middlewares/asyncWrapper.middleware");

// - get a product by id
// - get products full data for compariosn
// - get all-products (name and id ) usred in search
// - get all products by search -- pagination 16

const getAllProducts = asyncWrapper(async (req, res, next) => {
  let { limit = 16, page = 1, order = "desc" } = req.query;

  limit = Math.max(1, limit);
  page = Math.max(1, page);

  if (isNaN(limit) || isNaN(page)) {
    return next(
      new AppError(
        "Invalid pagination parameters. 'limit' and 'page' must be positive numbers.",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const skip = (page - 1) * limit;
  const totalProducts = await Product.countDocuments();
  const sortOrder = order === "asc" ? 1 : -1;

  const products = await Product.find()
    .select(
      "_id productName productSubtitle productImages productPrice productDate productSale productCategories productQuantity"
    )
    .limit(limit)
    .skip(skip)
    .sort({ productDate: sortOrder })
    .populate("productCategories", "catName")
    .lean();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { totalProducts, products },
  });
});

const getProductsByCategory = asyncWrapper(async (req, res, next) => {
  let { category_id } = req.params;
  let { limit = 16, page = 1, order = "desc" } = req.query;
  if (!category_id) {
    return next(
      new AppError("Category ID is required.", 400, httpStatusText.FAIL)
    );
  }
  if (!mongoose.isValidObjectId(category_id)) {
    return next(
      new AppError("Invalid Category ID format.", 400, httpStatusText.FAIL)
    );
  }
  limit = Math.max(1, limit);
  page = Math.max(1, page);

  if (isNaN(limit) || isNaN(page)) {
    return next(
      new AppError(
        "Invalid pagination parameters. 'limit' and 'page' must be positive numbers.",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === "asc" ? 1 : -1;
  const totalProducts = await Product.countDocuments({
    productCategories: category_id,
  });

  const products = await Product.find({ productCategories: category_id })
    .select(
      "_id productName productSubtitle productImages productPrice productDate productSale productCategories productQuantity"
    )
    .limit(limit)
    .skip(skip)
    .sort({ productDate: sortOrder })
    .populate("productCategories", "catName")
    .lean();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { totalProducts, products },
  });
});

const getProductById = asyncWrapper(async (req, res, next) => {
  const { product_id } = req.params;
  if (!product_id) {
    return next(
      new AppError("Product ID is required", 400, httpStatusText.FAIL)
    );
  }
  if (!mongoose.isValidObjectId(product_id)) {
    return next(
      new AppError("Invalid Product ID format", 400, httpStatusText.FAIL)
    );
  }

  const product = await Product.findById(product_id)
    .select(
      "_id productName productSubtitle productImages productPrice productQuantity productDate productSale productCategories productDescription colors sizes brand"
    )
    .populate("productCategories", "catName")
    .lean();

  if (!product) {
    return next(new AppError("Product not found", 404, httpStatusText.FAIL));
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      product,
    },
  });
});

const getProductForComparison = asyncWrapper(async (req, res, next) => {
  const { product_id } = req.params;
  if (!product_id) {
    return next(
      new AppError("Product ID is required", 400, httpStatusText.FAIL)
    );
  }

  if (!mongoose.isValidObjectId(product_id)) {
    return next(
      new AppError("Invalid Product ID format", 400, httpStatusText.FAIL)
    );
  }

  const product = await Product.findById(product_id)
    .select(
      "_id productName productSubtitle productImages productPrice productQuantity productDate productSale productCategories productDescription colors sizes brand additionalInformation"
    )
    .populate("productCategories", "catName")
    .lean();

  if (!product) {
    return next(new AppError("Product not found", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      product,
    },
  });
});

const getAllProductNamesAndIds = asyncWrapper(async (req, res, next) => {
  const products = await Product.find()
    .select({ _id: 1, productName: 1 })
    .lean();
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      products,
    },
  });
});

const getSearchProducts = asyncWrapper(async (req, res, next) => {
  const { query } = req.query;
  if (!query) {
    return next(
      new AppError("Please enter a search keyword!", 400, httpStatusText.FAIL)
    );
  }

  const categoryIds = await getCategoryIds(query);

  const products = await Product.find({
    $or: [
      { productName: { $regex: query, $options: "i" } },
      { productCategories: { $in: categoryIds } },
    ],
  })
    .populate("productCategories", "catName")
    .lean();

  if (!products.length) {
    return next(new AppError("No products found.", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: products,
  });
});

async function getCategoryIds(query) {
  const categories = await require("../models/category.model")
    .find({ catName: { $regex: query, $options: "i" } })
    .select("_id")
    .lean();
  return categories.map((cat) => cat._id);
}

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  getAllProductNamesAndIds,
  getProductForComparison,
  getSearchProducts,
};
