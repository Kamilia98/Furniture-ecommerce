const mongoose = require("mongoose");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const asyncWrapper = require("../middlewares/asyncWrapper.middleware");

// Helper: Calculate product display data
const formatProductData = (id, quantity, color) => {
  if (!id) return null;

  const colorVariant = id.colors.find((c) => c.hex === color.hex);
  if (!colorVariant) return null;

  const availableQuantity = colorVariant.quantity || 0;
  const finalQuantity = Math.min(quantity, availableQuantity);

  const effectivePrice = id.sale ? id.price * (1 - id.sale / 100) : id.price;

  return {
    _id: id._id,
    name: id.name,
    color: { name: colorVariant.name, hex: colorVariant.hex },
    quantity: finalQuantity,
    image: colorVariant.images?.[0]?.url || null,
    price: effectivePrice,
    subtotal: +(finalQuantity * effectivePrice).toFixed(2),
  };
};

// GET: Retrieve user cart
const getUserCart = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  console.log(`[Cart] Fetching cart for user: ${userId}`);

  const cart = await Cart.findOne({ userId })
    .populate("products.id", "_id name colors price sale")
    .lean();

  if (!cart) {
    console.warn(`[Cart] No cart found for user: ${userId}`);
    return next(new AppError("Cart not found.", 404, httpStatusText.FAIL));
  }

  const products = cart.products
    .map(({ id, quantity, color }) => formatProductData(id, quantity, color))
    .filter(Boolean);

  const totalPrice = cart.totalPrice;

  console.log(
    `[Cart] Cart retrieved for user: ${userId}, Total products: ${products.length}`
  );
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { products, totalPrice },
  });
});

// POST: Add products to cart
const addToCart = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const items = req.body;

  console.log(`[Cart] Adding to cart for user: ${userId}`);

  if (!Array.isArray(items) || items.length === 0) {
    console.warn(`[Cart] Invalid or empty cart items from user: ${userId}`);
    return next(new AppError("Invalid cart items.", 400, httpStatusText.FAIL));
  }

  // Validate all items
  for (const item of items) {
    const { id, quantity, colorHex } = item;

    if (!mongoose.Types.ObjectId.isValid(id) || quantity < 1) {
      return next(
        new AppError("Invalid id or quantity.", 400, httpStatusText.FAIL)
      );
    }

    const product = await Product.findById(id).select("colors");
    if (!product) {
      return next(new AppError("Product not found.", 404, httpStatusText.FAIL));
    }

    const chosenColor = colorHex || product.colors[0]?.hex;
    if (!chosenColor) {
      return next(
        new AppError(
          "Product has no available colors.",
          400,
          httpStatusText.FAIL
        )
      );
    }

    const colorVariant = product.colors.find((c) => c.hex === chosenColor);
    if (!colorVariant) {
      return next(
        new AppError(
          `Color "${chosenColor}" not available.`,
          400,
          httpStatusText.FAIL
        )
      );
    }

    item.color = {
      name: colorVariant.name,
      hex: colorVariant.hex,
    };
  }

  // Find or create cart
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, products: [] });
    console.log(`[Cart] Created new cart for user: ${userId}`);
  }

  // Add or update products in cart
  for (const { id, quantity, color } of items) {
    const product = await Product.findById(id).lean();
    console.log(color);
    const colorVariant = product.colors.find((c) => c.name === color.name);
    console.log(colorVariant);
    const availableQuantity = colorVariant?.quantity ?? 0;
    const finalQuantity = Math.min(quantity, availableQuantity);

    if (finalQuantity === 0) {
      console.warn(`[Cart] Product out of stock: ${id}`);
      continue;
    }

    const existing = cart.products.find(
      (p) => p.id.toString() === id && p.color.hex === color.hex
    );

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + finalQuantity,
        availableQuantity
      );
    } else {
      cart.products.push({ id, quantity: finalQuantity, color });
    }
  }

  await cart.save();
  console.log(`[Cart] Cart updated for user: ${userId}`);

  // Return updated cart
  const updatedCart = await Cart.findOne({ userId })
    .populate("products.id", "_id name colors price sale")
    .lean();

  const products = updatedCart.products
    .map(({ id, quantity, color }) => formatProductData(id, quantity, color))
    .filter(Boolean);
  console.log(products);
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { products, totalPrice: cart.totalPrice },
  });
});

// PATCH: Update cart
const updateCart = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  let { id, quantity, color } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id) || quantity < 0) {
    return next(
      new AppError("Invalid id or quantity.", 400, httpStatusText.FAIL)
    );
  }

  const product = await Product.findById(id).select("colors");
  if (!product) {
    return next(new AppError("Product not found.", 404, httpStatusText.FAIL));
  }

  if (!color) {
    color = product.colors[0]?.hex;
    if (!color) {
      return next(
        new AppError("No available color found.", 400, httpStatusText.FAIL)
      );
    }
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError("Cart not found.", 404, httpStatusText.FAIL));
  }

  const productIndex = cart.products.findIndex(
    (p) => p.id.toString() === id && p.color.hex === color
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
  await cart.populate("products.id", "_id name colors price");

  console.log(
    `[Cart] Cart updated for user: ${userId}, action: ${
      quantity > 0 ? "update" : "remove"
    }`
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
