const mongoose = require("mongoose");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/appError");

const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");

const asyncWrapper = require("../middlewares/asyncWrapper.middleware");

const placeOrder = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const { shippingAddress, paymentMethod, transactionId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("Invalid User ID", 400, httpStatusText.FAIL));
  }

  const cart = await Cart.findOne({ userId }).populate("products.productId");
  if (!cart || cart.products.length === 0) {
    return next(new AppError("Cart is empty", 400, httpStatusText.FAIL));
  }

  const orderItems = cart.products.map((item) => ({
    productId: item.productId._id,
    quantity: item.quantity,
    price: item.productId.productPrice,
    subtotal: item.subtotal,
  }));

  for (const item of cart.products) {
    console.log("quantiti", item.quantity, item.productId.productQuantity);
    if (item.quantity > item.productId.productQuantity) {
      return next(
        new AppError(
          `Not enough stock for ${item.productId.productName}. Available: ${item.productId.productQuantity} Requested: ${item.quantity}`,
          400,
          httpStatusText.FAIL
        )
      );
    }
  }

  const order = new Order({
    userId,
    orderItems,
    shippingAddress,
    totalAmount: cart.totalPrice,
    paymentMethod,
    transactionId,
  });

  await order.save();

  const updatePromises = cart.products.map((item) =>
    Product.updateOne(
      { _id: item.productId._id },
      { $inc: { productQuantity: -item.quantity } }
    )
  );

  await Promise.all(updatePromises);
  await Cart.findOneAndDelete({ userId });

  res.status(201).json({ message: "Order placed successfully!", order });
});

module.exports = { placeOrder };
