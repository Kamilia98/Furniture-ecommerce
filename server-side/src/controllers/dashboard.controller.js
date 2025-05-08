const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const httpStatusText = require('../utils/httpStatusText');

const getMetrics = asyncWrapper(async (req, res, next) => {
  const currentDate = new Date();
  const startOfCurrentMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const startOfLastMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );
  const endOfLastMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  );

  const paidOrders = await Order.find({ status: 'Delivered' }).select(
    'orderItems'
  );
  const totalProductsPaid = paidOrders.reduce((sum, order) => {
    const orderQuantity = order.orderItems.reduce((itemSum, item) => {
      return itemSum + (item.quantity || 0);
    }, 0);
    return sum + orderQuantity;
  }, 0);

  const totalOrders = await Order.countDocuments({});
  const totalCustomers = await User.countDocuments({ role: 'USER',isDeleted:false });
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
  ]);

  // This month - delivered orders
  const deliveredOrdersThisMonth = await Order.find({
    status: 'Delivered',
    createdAt: { $gte: startOfCurrentMonth },
  });

  const totalProductsPaidThisMonth = deliveredOrdersThisMonth.reduce(
    (sum, order) => {
      return (
        sum +
        order.orderItems.reduce(
          (itemSum, item) => itemSum + (item.quantity || 0),
          0
        )
      );
    },
    0
  );

  // Last month - delivered orders
  const deliveredOrdersLastMonth = await Order.find({
    status: 'Delivered',
    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
  });

  const totalProductsPaidLastMonth = deliveredOrdersLastMonth.reduce(
    (sum, order) => {
      return (
        sum +
        order.orderItems.reduce(
          (itemSum, item) => itemSum + (item.quantity || 0),
          0
        )
      );
    },
    0
  );

  const totalOrdersThisMonth = await Order.countDocuments({
    createdAt: { $gte: startOfCurrentMonth },
  });
  const totalCustomersThisMonth = await User.countDocuments({
    role: 'USER',
    createdAt: { $gte: startOfCurrentMonth },
  });
  const totalOrdersLastMonth = await Order.countDocuments({
    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
  });
  const totalCustomersLastMonth = await User.countDocuments({
    role: 'USER',
    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
  });

  const salesThisMonth = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfCurrentMonth } } },
    { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
  ]);
  const salesLastMonth = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
    { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
  ]);

  const totalSalesThisMonth =
    salesThisMonth.length > 0 ? salesThisMonth[0].totalSales : 0;
  const totalSalesLastMonth =
    salesLastMonth.length > 0 ? salesLastMonth[0].totalSales : 0;

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const ordersTrend =
    totalOrdersThisMonth > totalOrdersLastMonth
      ? 'increasing'
      : totalOrdersThisMonth < totalOrdersLastMonth
      ? 'decreasing'
      : 'stable';

  const customersTrend =
    totalCustomersThisMonth > totalCustomersLastMonth
      ? 'increasing'
      : totalCustomersThisMonth < totalCustomersLastMonth
      ? 'decreasing'
      : 'stable';

  const salesTrend =
    totalSalesThisMonth > totalSalesLastMonth
      ? 'increasing'
      : totalSalesThisMonth < totalSalesLastMonth
      ? 'decreasing'
      : 'stable';

  const productsTrend =
    totalProductsPaidThisMonth > totalProductsPaidLastMonth
      ? 'increasing'
      : totalProductsPaidThisMonth < totalProductsPaidLastMonth
      ? 'decreasing'
      : 'stable';

  const ordersPercentageChange = calculatePercentageChange(
    totalOrdersThisMonth,
    totalOrdersLastMonth
  );
  const customersPercentageChange = calculatePercentageChange(
    totalCustomersThisMonth,
    totalCustomersLastMonth
  );
  const salesPercentageChange = calculatePercentageChange(
    totalSalesThisMonth,
    totalSalesLastMonth
  );
  const productsPercentageChange = calculatePercentageChange(
    totalProductsPaidThisMonth,
    totalProductsPaidLastMonth
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      totalProducts: totalProductsPaid,
      totalOrders,
      totalCustomers,
      totalSales: totalSales[0]?.totalSales.toFixed(2) || '0.00',
      trends: {
        orders: {
          trend: ordersTrend,
          percentageChange: ordersPercentageChange.toFixed(2),
        },
        customers: {
          trend: customersTrend,
          percentageChange: customersPercentageChange.toFixed(2),
        },
        sales: {
          trend: salesTrend,
          percentageChange: salesPercentageChange.toFixed(2),
        },
        products: {
          trend: productsTrend,
          percentageChange: productsPercentageChange.toFixed(2),
        },
      },
    },
  });
});

const getMontlySales = asyncWrapper(async (req, res, next) => {
  const currentYear = new Date().getFullYear();

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalSales: { $sum: '$totalAmount' },
      },
    },
    {
      $project: {
        month: '$_id',
        totalSales: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  // Format result to include all months even if sales are 0
  const result = Array.from({ length: 12 }, (_, index) => {
    const monthData = monthlySales.find((m) => m.month === index + 1);
    return {
      month: index + 1,
      totalSales: monthData ? monthData.totalSales.toFixed(2) : '0.00',
    };
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: result,
  });
});

module.exports = {
  getMetrics,
  getMontlySales,
};
