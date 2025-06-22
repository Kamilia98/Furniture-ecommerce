const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const currencyModel = require('../models/settings/currency.model');

const deletCurrency = asyncWrapper(async (req, res, next) => {
  const { id } = req.query;
  const data = await currencyModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true }
  );
  const currencies = await currencyModel.find({
    isDeleted: false,
    isActive: true,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      supportedCurrencies: currencies,
    },
  });
});

const updatedCurrency = asyncWrapper(async (req, res, next) => {
  const { id } = req.query;
  const { code, name, symbol, exchangeRate } = req.body;
  console.log(code, name, symbol, exchangeRate);
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (code !== undefined) updates.code = code;
  if (symbol !== undefined) updates.symbol = symbol;
  if (exchangeRate !== undefined) updates.exchangeRate = exchangeRate;
  if (Object.keys(updates).length === 0) {
    return next(
      new AppError('No valid fields to update', 400, httpStatusText.FAIL)
    );
  }
  const currency = await currencyModel.findByIdAndUpdate(
    { _id: id },
    { $set: updates },
    { new: true }
  );
  const currencies = await currencyModel.find({
    isDeleted: false,
    isActive: true,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      supportedCurrencies: currencies,
    },
  });
});

const updatedCurrencyDefault = asyncWrapper(async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    return next(
      new AppError('Currency ID is required', 400, httpStatusText.FAIL)
    );
  }
  const currency = await currencyModel.findByIdAndUpdate(
    id,
    { $set: { isDefault: true } },
    { new: true }
  );
  console.log(currency);
  await currencyModel.updateMany(
    { _id: { $ne: id } },
    { $set: { isDefault: false } }
  );
  const currencies = await currencyModel.find({
    isDeleted: false,
    isActive: true,
  });
  console.log(currencies);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      supportedCurrencies: currencies,
    },
  });
});
const addCurrency = asyncWrapper(async (req, res, next) => {
  const { code, name, symbol, exchangeRate } = req.body;
  console.log(code, name, symbol, exchangeRate);
  const currency = { code, name, symbol, exchangeRate };
  const currencyAdded = await currencyModel.create(currency);
  console.log(currency, currencyAdded);
  const currencies = await currencyModel.find({
    isDeleted: false,
    isActive: true,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      supportedCurrencies: currencies,
    },
  });
});

module.exports = {
  updatedCurrency,
  deletCurrency,
  addCurrency,
  updatedCurrencyDefault,
};
