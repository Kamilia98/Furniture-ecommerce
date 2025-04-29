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
    searchQuery,
    minAmount,
    maxAmount,
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

  if (searchQuery) {
    const searchRegex = new RegExp(searchQuery, 'i');
    console.log('Generated search regex:', searchRegex);
    filter.$or = [{ orderNumber: { $regex: searchRegex } }];
  }

  // Filter by status if provided
  if (status) {
    if (Array.isArray(status)) {
      filter.status = { $in: status };
    } else if (typeof status === 'string') {
      const statusArray = status.split(',');
      filter.status = { $in: statusArray };
    }
  }

  // Filter by date range if provided
  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (startDate) {
    filter.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.createdAt = { $lte: new Date(endDate) };
  }

  if (
    minAmount &&
    maxAmount &&
    minAmount !== '0' &&
    maxAmount !== '0' &&
    parseFloat(minAmount) >= parseFloat(maxAmount)
  ) {
    return next(
      new AppError(
        "'minAmount' should be less than 'maxAmount'.",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Filter by amount range if minAmount or maxAmount are provided
  if (minAmount && minAmount !== '0') {
    // Avoid checking if minAmount is '0'
    filter.totalAmount = { ...filter.totalAmount, $gte: parseFloat(minAmount) };
  }
  if (maxAmount && maxAmount !== '0') {
    // Avoid checking if maxAmount is '0'
    filter.totalAmount = { ...filter.totalAmount, $lte: parseFloat(maxAmount) };
  }

  // Sorting logic
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
    return {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: `${order.totalAmount.toFixed(2)}`,
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

// Utility function to calculate start and end dates for different ranges
const getRangeDates = (range) => {
  const today = new Date();
  let startDate, endDate;

  switch (range) {
    case 'today':
      startDate = new Date(today.setHours(0, 0, 0, 0)); // Start of the day
      endDate = new Date(today.setHours(23, 59, 59, 999)); // End of the day
      break;
    case 'this-week':
      const firstDayOfWeek = today.getDate() - today.getDay(); // Get the first day of the week
      startDate = new Date(today.setDate(firstDayOfWeek)).setHours(0, 0, 0, 0); // Start of the week
      endDate = new Date(today.setDate(firstDayOfWeek + 6)).setHours(
        23,
        59,
        59,
        999
      ); // End of the week
      break;
    case 'this-month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the month
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the month
      break;
    case 'last-month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); // First day of last month
      endDate = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of last month
      break;
    default:
      throw new Error('Invalid range specified');
  }

  // Make sure to return Date objects
  return { startDate: new Date(startDate), endDate: new Date(endDate) };
};

// Controller function for order analytics
const getOrderAnalytics = async (req, res) => {
  try {
    const { range } = req.query;
    const { startDate, endDate } = getRangeDates(range);
    // Fetch the orders within the selected date range
    const orders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // Calculate total orders
    const totalOrders = orders.length;

    // Calculate total revenue
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Calculate average order value (if there are orders)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Return the analytics data
    res.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching order analytics', error });
  }
};

//user-admin
const getOrderDetails = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate({
      path: 'userId',
      select: 'username email',
    })
    .populate({
      path: 'orderItems.id',
      select: 'name price colors images',
      model: 'Product',
    })
    .exec();

  if (!order) {
    return next(new AppError('Order not found', 404, httpStatusText.FAIL));
  }

  const formattedOrder = {
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount.toFixed(2),
    shippingAddress: {
      name: order.shippingAddress.name,
      phone: order.shippingAddress.phone,
      email: order.shippingAddress.email,
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      zipCode: order.shippingAddress.zipCode,
      country: order.shippingAddress.country,
    },
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: {
      id: order.userId?._id || null,
      username: order.userId?.username || 'N/A',
      email: order.userId?.email || 'N/A',
    },
    orderItems: order.orderItems.map((item) => {
      const product = item.id;
      const selectedColor = product?.colors?.find(
        (color) => color.hex === item.color.hex
      );

      console.log(selectedColor);
      return {
        id: product?._id || null,
        name: product?.name || 'Unknown Product',
        price: item.price.toFixed(2),
        quantity: item.quantity,
        color: item.color,
        image: selectedColor?.images?.[0]?.url || null,
        sku: selectedColor?.sku || item.sku,
        total: (item.price * item.quantity).toFixed(2),
      };
    }),
  };

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: formattedOrder,
  });
});
//User
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
  getOrderAnalytics,
};
