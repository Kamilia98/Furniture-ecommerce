const mongoose = require('mongoose');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const Order = require('../models/order.model');
const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const getAllUsers = asyncWrapper(async (req, res, next) => {
  let { limit = 10, page = 1, search = '', role = '' } = req.query;
  console.log('query', limit, page, search);
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
  const searchFilter = search
    ? {
        username: { $regex: search, $options: 'i' },
        isDeleted: false,
        role: role,
      }
    : { isDeleted: false, role: role };
  const totalUsers = await User.countDocuments(searchFilter);
  console.log('totalUsers', totalUsers);
  const users = await User.find(searchFilter)
    .select(
      '_id username email favourites role thumbnail createdAt gender phone'
    )
    .limit(limit)
    .skip(skip)
    .lean();
  const usersWithOrders = await Order.distinct('userId');
  const totalUsersWithOrders = usersWithOrders.length;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const newCustomers = await User.countDocuments({
    role: 'USER',
    isDeleted: false,
    createdAt: {
      $gte: startOfMonth,
      $lt: endOfMonth,
    },
  });

  console.log('users', users);
  console.log('totalUsers', totalUsers);
  console.log('newCustomers', newCustomers);
  console.log('usersWithOrders', totalUsersWithOrders);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { totalUsers, users, newCustomers, totalUsersWithOrders },
  });
});

const getUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid User ID', 400, httpStatusText.FAIL));
  }

  const user = await User.findById(userId).select(
    'username email favourites role createdAt thumbnail gender phone'
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
  const userFounded = await User.findById(user._id);
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
    data: { user: userFounded },
  });
});
const changeIMG = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const { thumbnail } = req.body;
  if (!thumbnail) {
    return next(new AppError('No image URL provided', 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { thumbnail } },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Avatar updated successfully',
    data: { thumbnail: user.thumbnail },
  });
});

const changePassword = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const { password } = req.body;
  console.log(`Password change request received for user: ${userId}`);
  if (!password) {
    return next(new AppError('Password is required', 400, httpStatusText.FAIL));
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404, httpStatusText.NOT_FOUND));
  }
  if (!user.googleId) {
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return next(
        new AppError(
          'New password must be different from the old one',
          400,
          httpStatusText.FAIL
        )
      );
    }
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  await user.save();
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'Password changed successfully',
    data: null,
  });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid User ID', 400, httpStatusText.FAIL));
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true }
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
    message: 'User deleted successfully.',
    data: null,
  });
});

const editUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  const { username, email, favourites, role } = req.body;
  console.log('🚀 ~ editUser ~ role:', role);
  console.log('🚀 ~ editUser ~ username:', username);
  console.log('🚀 ~ editUser ~ email:', email);
  console.log('🚀 ~ editUser ~ favourites:', favourites);

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
    const existingUser = await User.findOne({
      email: { $eq: email },
      _id: { $ne: userId },
    });
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
  const id = req.body.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product ID', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User Not found', 404, httpStatusText.NOT_FOUND));
  }

  const index = user.favourites.indexOf(id);
  let isFavourite;

  if (index !== -1) {
    isFavourite = false;
    user.favourites.splice(index, 1);
  } else {
    isFavourite = true;
    user.favourites.push(id);
  }

  await user.save();

  // Populate and transform the response
  const updatedUser = await User.findById(userId)
    .populate({
      path: 'favourites',
      select: '_id name subtitle colors',
    })
    .lean();

  const formattedFavourites = updatedUser.favourites.map((product) => {
    const firstColor = product.colors?.[0];
    const firstImage = firstColor?.images?.[0]?.url || null;

    return {
      _id: product._id,
      name: product.name,
      subtitle: product.subtitle,
      image: firstImage,
    };
  });

  res.status(200).json({
    status: 'success',
    data: { favourites: formattedFavourites },
  });
});

const getFavourites = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .populate({
      path: 'favourites',
      select: '_id name subtitle colors',
    })
    .lean();

  if (!user) {
    return next(new AppError('User not found', 404, httpStatusText.NOT_FOUND));
  }

  const formattedFavourites = user.favourites.map((product) => {
    const firstColor = product.colors?.[0];
    const firstImage = firstColor?.images?.[0]?.url || null;

    return {
      _id: product._id,
      name: product.name,
      subtitle: product.subtitle,
      image: firstImage,
    };
  });

  res.status(200).json({
    status: 'success',
    data: { favourites: formattedFavourites },
  });
});

const updateProfile = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const { fname, lname, phone, bio, country, city } = req.body;

  if (!fname || !lname) {
    return next(
      new AppError(
        'First name and last name are required',
        400,
        httpStatusText.FAIL
      )
    );
  }

  const updates = {
    username: `${fname} ${lname}`.trim(),
    phone,
    bio,
    country,
    city,
  };

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -googleId');

  if (!user) {
    return next(new AppError('User not found', 404, httpStatusText.NOT_FOUND));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'Profile updated successfully',
    data: { user },
  });
});

// Admin user management routes
const getAllAdminUsers = asyncWrapper(async (req, res, next) => {
  const users = await User.find({
    role: { $in: ['ADMIN', 'EDITOR', 'SUPPORT', 'MANAGER'] },
    isDeleted: { $ne: true },
  }).select('_id username email role status createdAt');
  res.status(200).json({ status: httpStatusText.SUCCESS, data: users });
});

const editAdminUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid User ID', 400, httpStatusText.FAIL));
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select('_id username email role status');

  if (!updatedUser) {
    return next(
      new AppError('Admin user not found.', 404, httpStatusText.NOT_FOUND)
    );
  }

  res.status(200).json({ status: httpStatusText.SUCCESS, data: updatedUser });
});

const deleteAdminUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid User ID', 400, httpStatusText.FAIL));
  }

  const deletedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true }
  );

  if (!deletedUser) {
    return next(
      new AppError('Admin user not found.', 404, httpStatusText.NOT_FOUND)
    );
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'Admin user deleted successfully.',
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
  changePassword,
  changeIMG,
  updateProfile,
  getAllAdminUsers,
  editAdminUser,
  deleteAdminUser,
};
