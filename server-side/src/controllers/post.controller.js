const mongoose = require('mongoose');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const Post = require('../models/blog.model');
const asyncWrapper = require('../middlewares/asyncWrapper.middleware');

// Get all posts with pagination
const getAllPosts = asyncWrapper(async (req, res, next) => {
  let { limit = 4, page = 1, category } = req.query;

  // Ensure limit and page are integers and handle invalid values
  limit = Math.max(1, parseInt(limit));
  page = Math.max(1, parseInt(page));

  if (isNaN(limit) || isNaN(page)) {
    return next(
      new AppError('Invalid pagination parameters.', 400, httpStatusText.FAIL)
    );
  }

  // Filter by category if provided
  let filter = {};
  if (category) {
    filter.categories = { $in: [category] }; // Match posts that have the specified category
  }

  const skip = (page - 1) * limit;
  const totalPosts = await Post.countDocuments(filter); // Count the total posts that match the filter
  const posts = await Post.find(filter)
    .select('_id title description img categories date adminUser')
    .limit(limit)
    .skip(skip)
    .sort({ date: -1 })
    .populate('adminUser', 'username -_id') // Populate only the username and exclude the _id
    .lean();

  // Modify posts to return adminUser as "user: name"
  const modifiedPosts = posts.map((post) => ({
    ...post,
    user: post.adminUser ? post.adminUser.username : null,
    adminUser: undefined, // Remove adminUser from the final response
  }));

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { totalPosts, posts: modifiedPosts },
  });
});

// Get a specific post by ID
const getPostById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // Check if post exists
  const post = await Post.findById(id)
    .select('_id title content description img categories date adminUser')
    .populate('adminUser', 'username -_id') // Populate only the username and exclude the _id
    .lean();

  if (!post)
    return next(new AppError('Post not found.', 404, httpStatusText.FAIL));

  // Modify post to return adminUser as "user: name"
  const modifiedPost = {
    ...post,
    user: post.adminUser ? post.adminUser.username : null,
    adminUser: undefined, // Remove adminUser from the final response
  };

  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { post: modifiedPost } });
});

// Get recent posts
const getRecentPosts = asyncWrapper(async (req, res, next) => {
  const posts = await Post.find()
    .select('_id title description img categories')
    .limit(5)
    .sort({ date: -1 })
    .lean();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { posts },
  });
});

// Get related posts by category or tags
const getRelatedPosts = asyncWrapper(async (req, res, next) => {
  const { id } = req.query;
  // Find the current post
  const post = await Post.findById(id);
  if (!post)
    return next(new AppError('Post not found.', 404, httpStatusText.FAIL));
  // Ensure categories is an array
  const categories = Array.isArray(post.categories) ? post.categories : [];

  // Find related posts by category or matching categories
  const relatedPosts = await Post.find({
    _id: { $ne: id },
    $or: [{ category: post.category }, { categories: { $in: categories } }],
  })
    .limit(3)
    .select('_id title description img date')
    .lean();

  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { relatedPosts } });
});

// Get all categories from posts
const getCategories = asyncWrapper(async (req, res, next) => {
  const categories = await Post.distinct('categories');

  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { categories } });
});

module.exports = {
  getAllPosts,
  getRecentPosts,
  getPostById,
  getRelatedPosts,
  getCategories,
};
