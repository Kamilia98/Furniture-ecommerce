const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const httpStatusText = require('../utils/httpStatusText');

const mongoose = require('mongoose');

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

  const totalOrders = await Order.countDocuments({});
  const totalCustomers = await User.countDocuments({
    role: 'USER',
    isDeleted: false,
  });

  const totalOrdersThisMonth = await Order.countDocuments({
    createdAt: { $gte: startOfCurrentMonth },
  });

  const totalCustomersThisMonth = await User.countDocuments({
    role: 'USER',
    isDeleted: false,
    createdAt: { $gte: startOfCurrentMonth },
  });

  const totalOrdersLastMonth = await Order.countDocuments({
    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
  });

  const totalCustomersLastMonth = await User.countDocuments({
    role: 'USER',
    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
  });

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

  const ordersPercentageChange = calculatePercentageChange(
    totalOrdersThisMonth,
    totalOrdersLastMonth
  );

  const customersPercentageChange = calculatePercentageChange(
    totalCustomersThisMonth,
    totalCustomersLastMonth
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      totalOrders: totalOrdersThisMonth,
      totalCustomers: totalCustomersThisMonth,
      trends: {
        orders: {
          trend: ordersTrend,
          percentageChange: ordersPercentageChange.toFixed(2),
        },
        customers: {
          trend: customersTrend,
          percentageChange: customersPercentageChange.toFixed(2),
        },
      },
    },
  });
});

const getMontlySales = asyncWrapper(async (req, res, next) => {
  const { period } = req.query;
  const now = new Date();
  let selectedYear;

  if (period === 'last') {
    selectedYear = now.getFullYear() - 1;
  } else {
    selectedYear = now.getFullYear();
  }

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${selectedYear}-12-31T23:59:59.999Z`),
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

const getOrderStatus = asyncWrapper(async (req, res, next) => {
  const { userId } = req.query;
  let filter = {};
  if (userId) {
    filter.userId = userId;
  }

  // Current month range
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Add date filter for this month and last month
  const filterThisMonth = {
    ...filter,
    createdAt: { $gte: startOfCurrentMonth },
  };
  const filterLastMonth = {
    ...filter,
    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
  };

  // Orders by status (all time, with user filter)
  const ordersByStatus = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
  const statusCounts = ordersByStatus.reduce((acc, status) => {
    acc[status._id] = status.count;
    return acc;
  }, {});

  // Total orders (all time, with user filter)
  const totalOrders = await Order.countDocuments(filter);

  // This month
  const totalOrdersThisMonth = await Order.countDocuments(filterThisMonth);
  const salesThisMonthAgg = await Order.aggregate([
    { $match: filterThisMonth },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const totalSalesThisMonth = salesThisMonthAgg[0]?.total || 0;
  const canceledOrdersThisMonth = await Order.countDocuments({
    ...filterThisMonth,
    status: 'Cancelled',
  });
  const cancelationRateThisMonth =
    totalOrdersThisMonth === 0
      ? 0
      : (canceledOrdersThisMonth / totalOrdersThisMonth) * 100;
  const avgOrderValueThisMonth =
    totalOrdersThisMonth === 0 ? 0 : totalSalesThisMonth / totalOrdersThisMonth;

  // Last month
  const totalOrdersLastMonth = await Order.countDocuments(filterLastMonth);
  const salesLastMonthAgg = await Order.aggregate([
    { $match: filterLastMonth },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const totalSalesLastMonth = salesLastMonthAgg[0]?.total || 0;
  const canceledOrdersLastMonth = await Order.countDocuments({
    ...filterLastMonth,
    status: 'Cancelled',
  });
  const cancelationRateLastMonth =
    totalOrdersLastMonth === 0
      ? 0
      : (canceledOrdersLastMonth / totalOrdersLastMonth) * 100;
  const avgOrderValueLastMonth =
    totalOrdersLastMonth === 0 ? 0 : totalSalesLastMonth / totalOrdersLastMonth;

  // Trend helpers
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  const getTrend = (current, previous) =>
    current > previous
      ? 'increasing'
      : current < previous
      ? 'decreasing'
      : 'stable';

  // Trends
  const ordersTrend = getTrend(totalOrdersThisMonth, totalOrdersLastMonth);
  const salesTrend = getTrend(totalSalesThisMonth, totalSalesLastMonth);
  const cancelationTrend = getTrend(
    cancelationRateThisMonth,
    cancelationRateLastMonth
  );
  const avgOrderValueTrend = getTrend(
    avgOrderValueThisMonth,
    avgOrderValueLastMonth
  );

  const ordersPercentageChange = calculatePercentageChange(
    totalOrdersThisMonth,
    totalOrdersLastMonth
  );
  const salesPercentageChange = calculatePercentageChange(
    totalSalesThisMonth,
    totalSalesLastMonth
  );
  const cancelationPercentageChange = calculatePercentageChange(
    cancelationRateThisMonth,
    cancelationRateLastMonth
  );
  const avgOrderValuePercentageChange = calculatePercentageChange(
    avgOrderValueThisMonth,
    avgOrderValueLastMonth
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      totalOrders,
      totalSales: totalSalesThisMonth.toFixed(2),
      cancelationRate: cancelationRateThisMonth.toFixed(2),
      avgOrderValue: avgOrderValueThisMonth.toFixed(2),
      statusCounts,
      trends: {
        orders: {
          trend: ordersTrend,
          percentageChange: ordersPercentageChange.toFixed(2),
        },
        sales: {
          trend: salesTrend,
          percentageChange: salesPercentageChange.toFixed(2),
        },
        cancelationRate: {
          trend: cancelationTrend,
          percentageChange: cancelationPercentageChange.toFixed(2),
        },
        avgOrderValue: {
          trend: avgOrderValueTrend,
          percentageChange: avgOrderValuePercentageChange.toFixed(2),
        },
      },
    },
  });
});

const getSalesByPeriod = asyncWrapper(async (req, res, next) => {
  const { period } = req.query;
  const now = new Date();
  let selectedYear;

  if (period === 'last') {
    selectedYear = now.getFullYear() - 1;
  } else {
    selectedYear = now.getFullYear();
  }

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${selectedYear}-12-31T23:59:59.999Z`),
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

const getBestEntities = asyncWrapper(async (req, res, next) => {
  // Best Product (by number of distinct orders it was included in)
  const bestProduct = await Product.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'orderItems.id',
        as: 'orders',
      },
    },
    {
      $addFields: {
        matchingOrderItems: {
          $filter: {
            input: '$orders',
            as: 'order',
            cond: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$$order.orderItems',
                      as: 'item',
                      cond: { $eq: ['$$item.id', '$_id'] },
                    },
                  },
                },
                0,
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        orderCount: { $size: '$matchingOrderItems' },
        allColors: {
          $reduce: {
            input: '$matchingOrderItems',
            initialValue: [],
            in: {
              $concatArrays: [
                '$$value',
                {
                  $map: {
                    input: {
                      $filter: {
                        input: '$$this.orderItems',
                        as: 'item',
                        cond: { $eq: ['$$item.id', '$_id'] },
                      },
                    },
                    as: 'matchItem',
                    in: '$$matchItem.color.name',
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        mostPopularColor: {
          $let: {
            vars: {
              uniqueColors: { $setUnion: ['$allColors', []] },
            },
            in: {
              $first: {
                $map: {
                  input: '$$uniqueColors',
                  as: 'color',
                  in: {
                    color: '$$color',
                    count: {
                      $size: {
                        $filter: {
                          input: '$allColors',
                          as: 'c',
                          cond: { $eq: ['$$c', '$$color'] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'mostPopularColor.color',
        foreignField: 'colors.name',
        as: 'productDetails',
      },
    },
    {
      $addFields: {
        productColor: {
          $arrayElemAt: [
            {
              $filter: {
                input: { $arrayElemAt: ['$productDetails.colors', 0] },
                as: 'color',
                cond: { $eq: ['$$color.name', '$mostPopularColor.color'] },
              },
            },
            0,
          ],
        },
      },
    },
    { $unwind: '$productDetails' },
    {
      $addFields: {
        firstImage: { $arrayElemAt: ['$productColor.images', 0] },
      },
    },
    {
      $sort: { orderCount: -1 },
    },
    { $limit: 1 },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        orderCount: 1,
        'productColor.name': 1,
        'productColor.hex': 1,
        'productColor.quantity': 1,
        productImage: '$firstImage.url',
        'productDetails.name': 1,
        'productDetails.brand': 1,
        'productDetails.subtitle': 1,
        'productDetails.price': 1,
        'productDetails.sale': 1,
      },
    },
  ]);

  // Best Category (by number of orders its products are in)
  const bestCategory = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'categories',
        as: 'products',
      },
    },
    {
      $addFields: {
        productIds: {
          $map: {
            input: '$products',
            as: 'p',
            in: '$$p._id',
          },
        },
      },
    },
    {
      $lookup: {
        from: 'orders',
        let: { productIds: '$productIds' },
        pipeline: [
          {
            $match: {
              $expr: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: '$orderItems',
                        as: 'item',
                        cond: {
                          $in: ['$$item.id', '$$productIds'],
                        },
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        ],
        as: 'orders',
      },
    },
    {
      $addFields: {
        orderCount: { $size: '$orders' },
        totalSales: {
          $sum: {
            $map: {
              input: '$orders',
              as: 'order',
              in: {
                $sum: {
                  $map: {
                    input: '$$order.orderItems',
                    as: 'item',
                    in: {
                      $cond: [
                        { $in: ['$$item.id', '$productIds'] },
                        { $multiply: ['$$item.price', '$$item.quantity'] },
                        0,
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        productCount: { $size: '$products' },
      },
    },
    {
      $sort: { orderCount: -1 },
    },
    {
      $limit: 1,
    },
    {
      $project: {
        name: 1,
        description: 1,
        image: 1,
        orderCount: 1,
        totalSales: { $round: ['$totalSales', 2] },
        productCount: 1,
      },
    },
  ]);

  // Best User (by total spent)
  const bestUser = await User.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'userId',
        as: 'orders',
      },
    },
    {
      $addFields: {
        totalSpent: {
          $sum: {
            $map: {
              input: '$orders',
              as: 'order',
              in: '$$order.totalAmount',
            },
          },
        },
      },
    },
    {
      $sort: { totalSpent: -1 },
    },
    {
      $limit: 1,
    },
    {
      $project: {
        name: '$username',
        thumbnail: 1,
        email: 1,
        gender: 1,
        totalSpent: { $round: ['$totalSpent', 2] },
      },
    },
  ]);

  res.status(200).json({
    status: 'SUCCESS',
    data: {
      bestProduct: bestProduct[0] || null,
      bestCategory: bestCategory[0] || null,
      bestUser: bestUser[0] || null,
    },
  });
});

module.exports = {
  getMetrics,
  getMontlySales,
  getOrderStatus,
  getSalesByPeriod,
  getBestEntities,
};
