const Category = require("../models/category.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const asyncWrapper = require("../middlewares/asyncWrapper.middleware");

const getAllCategories = asyncWrapper(async (req, res, next) => {
  const categories = await Category.find().select("-__v").lean();
  if (!categories.length) {
    return next(new AppError("No categories found.", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { categories },
  });
});

module.exports = {
  getAllCategories,
};
