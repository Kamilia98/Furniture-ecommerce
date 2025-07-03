const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const Order = require('../models/order.model');

// Admin - Get All Orders
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
    userId,
  } = req.query;
  // Convert pagination to numbers
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

  // Start building the query
  let query = Order.find();

  // Apply filters
  if (userId) {
    query = query.where('userId').equals(userId);
    console.log('Filtering by userId:', userId);
  }

  // Search filter
  if (searchQuery) {
    const searchRegex = new RegExp(searchQuery, 'i');
    query = query.where('orderNumber').regex(searchRegex);
    console.log('Applying search filter:', searchRegex);
  }

  // Status filter
  if (status) {
    const statusArray = Array.isArray(status) ? status : status.split(',');
    query = query.where('status').in(statusArray);
    console.log('Applying status filter:', statusArray);
  }

  // Date range filter
  if (startDate || endDate) {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    query = query.where('createdAt').gte(dateFilter.$gte).lte(dateFilter.$lte);
    console.log('Applying date filter:', dateFilter);
  }

  // Amount validation
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

  // Amount range filter
  if (minAmount && minAmount !== '0') {
    query = query.where('totalAmount').gte(parseFloat(minAmount));
  }
  if (maxAmount && maxAmount !== '0') {
    query = query.where('totalAmount').lte(parseFloat(maxAmount));
  }

  // Apply sorting
  const sortOption = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  query = query.sort(sortOption);
  console.log('Sorting orders by:', sortOption);

  // Apply pagination
  query = query.skip(skip).limit(limit);

  // Execute the query with population
  const orders = await query
    .populate({ path: 'userId', select: 'username' })
    .select('_id orderNumber status orderItems totalAmount createdAt userId');

  // Get total count using the same filters
  const totalOrders = await Order.countDocuments(query.getFilter());

  const formattedOrders = orders.map((order) => ({
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
  }));

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

// Admin - Update Order Status
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
      console.warn(`Order not found: ${id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(`Updated order status for order ${id} to ${status}`);
    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (err) {
    console.error('Error updating order status:', err);
    res
      .status(500)
      .json({ message: 'Error updating order', error: err.message });
  }
};

// Utility: Get Date Range Based on Named Range
const getRangeDates = (range) => {
  const today = new Date();
  let startDate, endDate;

  switch (range) {
    case 'today':
      startDate = new Date(today.setHours(0, 0, 0, 0));
      endDate = new Date(today.setHours(23, 59, 59, 999));
      break;
    case 'this-week': {
      const firstDay = today.getDate() - today.getDay();
      startDate = new Date(today.setDate(firstDay));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today.setDate(firstDay + 6));
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    case 'this-month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'last-month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    default:
      throw new Error(`Invalid range specified: ${range}`);
  }

  return { startDate, endDate };
};

// Admin - Get Order Analytics
const getOrderAnalytics = async (req, res) => {
  try {
    const { range, userId } = req.query;
    const { startDate, endDate } = getRangeDates(range);

    console.log(`Getting analytics for range: ${range}`, {
      startDate,
      endDate,
      userId,
    });

    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    // Fetch orders based on the filter
    const orders = await Order.find(filter);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    console.log(filter);

    // Group orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the ordersByStatus result
    const statusCounts = ordersByStatus.reduce((acc, status) => {
      acc[status._id] = status.count;
      return acc;
    }, {});

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        statusCounts,
      },
    });
  } catch (err) {
    console.error('Error fetching order analytics:', err);
    res.status(500).json({
      status: httpStatusText.ERROR,
      message: 'Failed to fetch order analytics',
      error: err.message,
    });
  }
};

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
    country: order.shippingAddress.country,
    paymentMethod: order.paymentMethod,
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
