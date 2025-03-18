const mongoose = require("mongoose");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const Post = require("../models/blog.model");
const asyncWrapper = require("../middlewares/asyncWrapper.middleware");

const getAllPosts = asyncWrapper(async (req, res, next) => {
  let { limit = 4, page = 1 } = req.query;
  limit = Math.max(1, limit);
  page = Math.max(1, page);

  if (isNaN(limit) || isNaN(page)) {
    return next(
      new AppError("Invalid pagination parameters.", 400, httpStatusText.FAIL)
    );
  }

  const skip = (page - 1) * limit;
  const totalPosts = await Post.countDocuments();
  const posts = await Post.find()
    .select("_id title excerpt content description user img category date adminUser")
    .limit(limit)
    .skip(skip)
    .sort({ date: -1 })
    .lean();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { totalPosts, posts },
  });
});

const getRecentPosts = asyncWrapper(async (req, res, next) => {
  const posts = await Post.find()
    .select("_id blogTitle description image tags")
    .limit(5)
    .sort({ date: -1 })
    .lean();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { posts },
  });
});


const getPostById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id).select("_id title excerpt content description user img category date adminUser content");

  if (!post) return next(new AppError("Post not found.", 404, httpStatusText.FAIL));

  res.status(200).json({ status: httpStatusText.SUCCESS, data: { post } });
});

const getRelatedPosts = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) return next(new AppError("Post not found.", 404, httpStatusText.FAIL));

  const relatedPosts = await Post.find({
    _id: { $ne: id }, 
    $or: [{ category: post.category }, { tags: { $in: post.tags } }],
  })
    .limit(3)
    .select("blogTitle description image category tags");

  res.status(200).json({ status: httpStatusText.SUCCESS, data: { relatedPosts } });
});

const getCategories = asyncWrapper(async (req, res, next) => {
  const categories = await Post.distinct("category"); 
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { categories } });
});


module.exports = {
  getAllPosts,
  getRecentPosts,
  getPostById,
  getRelatedPosts,
  getCategories
};
