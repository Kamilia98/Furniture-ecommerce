const mongoose = require('mongoose');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const asyncWrapper = require('../middlewares/asyncWrapper.middleware');

const getAllUsers = asyncWrapper(async (req, res, next) => {
  let { limit = 10, page = 1 } = req.query;
  console.log('query', limit, page);
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
  const totalUsers = await User.countDocuments();
  const users = await User.find()
    .select('_id username email favourites role')
    .limit(limit)
    .skip(skip)
    .lean();
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { totalUsers, users },
  });
});

const getUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid User ID', 400, httpStatusText.FAIL));
  }

  const user = await User.findById(userId).select(
    'username email favourites role'
  );

  if (!user) {
    return next(
      new AppError(
        'User not found with this id.',
        404,
        httpStatusText.NOT_FOUND
      )
    );
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { user },
  });
});

const getProfile = asyncWrapper(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(
      new AppError(
        'User not found with this id.',
        404,
        httpStatusText.NOT_FOUND
      )
    );
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { user },
  });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid User ID', 400, httpStatusText.FAIL));
  }
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    return next(
      new AppError(
        'User not found with this id.',
        404,
        httpStatusText.NOT_FOUND
      )
    );
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'User deleted successfully.',
    data: null,
  });
});

const editUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  const { username, email, favourites, role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid User ID', 400, httpStatusText.FAIL));
  }

  const updates = {};
  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (favourites !== undefined) updates.favourites = favourites;
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return next(
      new AppError('No valid fields to update', 400, httpStatusText.FAIL)
    );
  }

  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return next(
        new AppError('Email already in use', 400, httpStatusText.FAIL)
      );
    }
  }
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $set: updates },
    { new: true, runValidators: true }
  ).select('username email favourites role');

  if (!user) {
    return next(new AppError('User not found', 404, httpStatusText.NOT_FOUND));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'User updated successfully',
    data: { user },
  });
});

const toggleFavourite = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const productId = req.body.productId;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('Invalid product ID', 400));
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User Not found', 404, httpStatusText.NOT_FOUND));
  }
  const index = user.favourites.indexOf(productId);
  let isFavourite;
  if (index !== -1) {
    isFavourite = false;
    user.favourites.splice(index, 1);
  } else {
    isFavourite = true;
    user.favourites.push(productId);
  }
  await user.save();
  res.status(200).json({
    status: 'success',
    message: isFavourite
      ? 'Product added to favourites'
      : 'Product removed from favourites',
    data: { favourites: user.favourites },
  });
});

const getFavourites = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  console.log('user id', userId);
  console.log('hers is get favourites', userId);

  const user = await User.findById(userId)
    .populate('favourites', '_id productName productImages productPrice')
    .lean();

  if (!user) {
    return next(
      new AppError('User not found with', 404, httpStatusText.NOT_FOUND)
    );
  }
  res.status(200).json({
    status: 'success',
    data: { favourites: user.favourites },
  });
});

module.exports = {
  getAllUsers,
  getUser,
  getProfile,
  deleteUser,
  editUser,
  toggleFavourite,
  getFavourites,
};
