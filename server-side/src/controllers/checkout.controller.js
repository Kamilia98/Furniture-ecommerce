const mongoose = require('mongoose');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

const asyncWrapper = require('../middlewares/asyncWrapper.middleware');

const placeOrder = asyncWrapper(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, transactionId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new AppError('Invalid User ID', 400, httpStatusText.FAIL));
    }

    const cart = await Cart.findOne({ userId }).populate('products.id');
    if (!cart || cart.products.length === 0) {
      return next(new AppError('Cart is empty', 400, httpStatusText.FAIL));
    }
    console.log(cart.products);
    const orderItems = cart.products.map((item) => {
      return {
        id: item.id._id,
        name: item.id.name,
        quantity: item.quantity,
        price: item.subtotal,
        color: item.color,
      };
    });
    for (const item of cart.products) {
      if (item.quantity > item.id.quantity) {
        return next(
          new AppError(
            `Not enough stock for ${item.id.name}. Available: ${item.id.quantity} Requested: ${item.quantity}`,
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
      paymentMethod,
      transactionId,
      totalAmount: cart.totalPrice.toFixed(2),
    });

    await order.save();

    const updatePromises = cart.products.map((item) =>
      Product.updateOne(
        { _id: item.id._id },
        { $inc: { quantity: -item.quantity } }
      )
    );

    await Promise.all(updatePromises);
    await Cart.findOneAndDelete(userId);

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (error) {
    console.error('Error placing order:', error);
    return next(
      new AppError('Failed to place order', 500, httpStatusText.ERROR)
    );
  }
});

module.exports = { placeOrder };
