const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const ShippingMethod = require('../models/settings/shippingMethod.model');

const getShippingMethods = asyncWrapper(async (req, res, next) => {
  const shippingMethods = await ShippingMethod.find({
    isDeleted: false,
    isActive: true,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      shippingMethods: shippingMethods,
    },
  });
});
const deletShippingMethod = asyncWrapper(async (req, res, next) => {
  const { id } = req.query;
  console.log(id);
  const data = await ShippingMethod.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  const methods = await ShippingMethod.find({
    isDeleted: false,
    isActive: true,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      shippingMethods: methods,
    },
  });
});

const updatedShippingMethod = asyncWrapper(async (req, res, next) => {
  const { id } = req.query;
  const { name, cost } = req.body;
  console.log(id, name, cost);
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (cost !== undefined) updates.cost = cost;
  if (Object.keys(updates).length === 0) {
    return next(
      new AppError('No valid fields to update', 400, httpStatusText.FAIL)
    );
  }
  const method = await ShippingMethod.findByIdAndUpdate(
    { _id: id },
    { $set: updates },
    { new: true }
  );
  console.log(method);
  const methods = await ShippingMethod.find({
    isDeleted: false,
    isActive: true,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      shippingMethods: methods,
    },
  });
});
const addShippingMethod = asyncWrapper(async (req, res, next) => {
  const { name, cost } = req.body;
  console.log(name, cost);
  const method = { name, cost };
  const methodAdded = await ShippingMethod.create(method);
  console.log(method, methodAdded);
  const methods = await ShippingMethod.find({
    isDeleted: false,
    isActive: true,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      shippingMethods: methods,
    },
  });
});

module.exports = {
  getShippingMethods,
  updatedShippingMethod,
  deletShippingMethod,
  addShippingMethod,
};
