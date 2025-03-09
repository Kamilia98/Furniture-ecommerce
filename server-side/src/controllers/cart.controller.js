const mongoose = require("mongoose");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const Cart = require("../models/cart.model");
const asyncWrapper = require("../middlewares/asyncWrapper.middleware");
const Product = require("../models/product.model");

// GET: Retrieve user cart
const getUserCart = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ userId })
    .populate(
      "products.productId",
      "_id productName productImages productPrice"
    )
    .lean();

  if (!cart) {
    return next(new AppError("Cart not found.", 404, httpStatusText.FAIL));
  }

  const products = cart.products.map(({ productId, quantity }) => ({
    product_id: productId._id,
    quantity,
    productName: productId.productName,
    productImage: productId.productImages,
    productPrice: productId.productPrice,
    subtotal: quantity * productId.productPrice,
  }));

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      products,
      totalPrice: cart.totalPrice,
    },
  });
});

// POST: Add products to cart
const addToCart = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const items = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new AppError("Invalid cart items.", 400, httpStatusText.FAIL));
  }

  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId) || item.quantity < 1) {
      return next(
        new AppError("Invalid productId or quantity.", 400, httpStatusText.FAIL)
      );
    }
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, products: [] });
  }

  for (const { productId, quantity } of items) {
    const existingProduct = cart.products.find(
      (p) => p.productId.toString() === productId
    );
    if (existingProduct) {
      const product = await Product.findById(productId);
      existingProduct.quantity = Math.min(
        product.productQuantity,
        existingProduct.quantity + quantity
      );
    } else {
      cart.products.push({ productId, quantity });
    }
  }

  await cart.save();
  await cart.populate(
    "products.productId",
    "_id productName productImages productPrice"
  );
  await cart.populate(
    "products.productId",
    "_id productName productImages productPrice"
  );

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { cart },
  });
});

// PATCH: Update cart (change quantity or remove a product)
const updateCart = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId) || quantity < 0) {
    return next(
      new AppError("Invalid productId or quantity.", 400, httpStatusText.FAIL)
    );
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return next(new AppError("Cart not found.", 404, httpStatusText.FAIL));
  }

  const productIndex = cart.products.findIndex(
    (p) => p.productId.toString() === productId
  );

  if (productIndex === -1) {
    return next(
      new AppError("Product not found in cart.", 404, httpStatusText.FAIL)
    );
  }

  if (quantity > 0) {
    cart.products[productIndex].quantity = quantity;
  } else {
    cart.products.splice(productIndex, 1);
  }

  await cart.save();
  await cart.populate(
    "products.productId",
    "_id productName productImages productPrice"
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { cart },
  });
});

module.exports = {
  getUserCart,
  addToCart,
  updateCart,
};
