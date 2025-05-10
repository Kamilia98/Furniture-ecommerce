const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const Currency = require('../models/settings/currency.model');
const Language = require('../models/settings/language.model');
const ShippingMethod = require('../models/settings/shippingMethod.model');
const StoreSettings = require('../models/settings/storeSettings.model'); 

const getStoreConfig = asyncWrapper(async (req, res, next) => {
  const storeSettings = await StoreSettings.findOne() || {}; 
  const currencies = await Currency.find({ deletedAt: null, isActive: true });
  const languages = await Language.find({ deletedAt: null, isActive: true });
  const shippingMethods = await ShippingMethod.find({ deletedAt: null, isActive: true });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      storeName: storeSettings.storeName || '',
      defaultCurrency: storeSettings.defaultCurrency || 'USD',
      defaultLanguage: storeSettings.defaultLanguage || 'en',
      supportedCurrencies: currencies,
      supportedLanguages: languages,
      shippingMethods: shippingMethods,
    },
  });
});

const updateStoreConfig = asyncWrapper(async (req, res, next) => {
  const { storeName, defaultCurrency, defaultLanguage, supportedCurrencies, supportedLanguages, shippingMethods } = req.body;


  await StoreSettings.findOneAndUpdate({}, { storeName, defaultCurrency, defaultLanguage }, { upsert: true });


  if (supportedCurrencies && Array.isArray(supportedCurrencies)) {
    for (const currencyData of supportedCurrencies) {
      if (currencyData.code) {
        await Currency.findOneAndUpdate({ code: currencyData.code }, currencyData, { upsert: true, new: true });
      } else if (currencyData._id) { 
        await Currency.findByIdAndUpdate(currencyData._id, currencyData, { new: true });
      } else {
        await Currency.create(currencyData);
      }
    }

    const receivedCurrencyCodes = supportedCurrencies.map(c => c.code).filter(Boolean);
    await Currency.updateMany(
      { code: { $nin: receivedCurrencyCodes }, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } }
    );
  }


  if (supportedLanguages && Array.isArray(supportedLanguages)) {
    for (const languageData of supportedLanguages) {
      if (languageData.code) {
        await Language.findOneAndUpdate({ code: languageData.code }, languageData, { upsert: true, new: true });
      } else if (languageData._id) {
        await Language.findByIdAndUpdate(languageData._id, languageData, { new: true });
      } else {
        await Language.create(languageData);
      }
    }
    const receivedLanguageCodes = supportedLanguages.map(l => l.code).filter(Boolean);
    await Language.updateMany(
      { code: { $nin: receivedLanguageCodes }, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } }
    );
  }

 
  if (shippingMethods && Array.isArray(shippingMethods)) {
    for (const methodData of shippingMethods) {
      if (methodData._id) {
        await ShippingMethod.findByIdAndUpdate(methodData._id, methodData, { new: true });
      } else {
        await ShippingMethod.create(methodData);
      }
    }
    const receivedMethodIds = shippingMethods.map(m => m._id).filter(Boolean);
    await ShippingMethod.updateMany(
      { _id: { $nin: receivedMethodIds }, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } }
    );
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'Store configuration updated successfully',
  });
});

module.exports = {
  getStoreConfig,
  updateStoreConfig,
};