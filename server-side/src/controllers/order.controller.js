const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const Order = require('../models/order.model');

// Admin
const getAllOrders = asyncWrapper(async (req, res, next) => {
  let {
    limit = 10,
    page = 1,
    status,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  limit = parseInt(limit);
  page = parseInt(page);

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
    return next(
      new AppError(
        "Invalid pagination parameters. 'limit' and 'page' must be positive numbers.",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const skip = (page - 1) * limit;

  let filter = {};
  if (status) filter.status = status;
  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (startDate) {
    filter.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.createdAt = { $lte: new Date(endDate) };
  }

  const sortOption = {};
  sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const orders = await Order.find(filter)
    .populate({ path: 'userId', select: 'username' }) 
    .select('_id orderNumber status orderItems totalAmount createdAt userId')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments(filter);

  if (orders.length === 0) {
    return next(
      new AppError(
        'No orders found with the specified filters',
        404,
        httpStatusText.FAIL
      )
    );
  }

  const formattedOrders = orders.map((order) => {
    console.log('order', order);
    return {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: `${order.totalAmount.toFixed(2)}`,
      createdAt: order.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      userName: order.userId?.username || 'N/A',
    };
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      orders: formattedOrders,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
    },
  });
});

const getOrderDetails = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  console.log('id', id);

  const order = await Order.findById(id)
    .populate({ path: 'userId', select: 'username email' })
    .populate('orderItems.id')
    .exec();

  if (!order) {
    return next(new AppError('Order not found', 404, httpStatusText.FAIL));
  }
  console.log('order', order);

  const formattedOrder = {
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount.toFixed(2),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: {
      id: order.userId?._id || null,
      username: order.userId?.username || 'N/A',
      email: order.userId?.email || 'N/A',
    },
    orderItems: order.orderItems.map((item) => ({
      name: item?.name || 'Unknown',
      price: item.price,
      quantity: item.quantity,
      total: (item.price * item.quantity).toFixed(2),
    })),
  };

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: formattedOrder,
  });
});

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error updating order', error: err.message });
  }
};

const getUserOrders = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;

  let { limit = 10, page = 1 } = req.query;

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

  const orders = await Order.find({ userId })
    .select('orderNumber status orderItems totalAmount createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments({ userId });

  if (orders.length === 0) {
    return next(
      new AppError('No orders found for this user', 404, httpStatusText.FAIL)
    );
  }

  const formattedOrders = orders.map((order) => ({
    orderNumber: order.orderNumber,
    status: order.status,
    orderNumber: order.orderNumber,
    total: `${order.totalAmount.toFixed(2)}`,
    createdAt: order.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { orders: formattedOrders, totalOrders },
  });
});

module.exports = {
  getUserOrders,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
};
