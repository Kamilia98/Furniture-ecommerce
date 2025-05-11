const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const languageModel = require('../models/settings/language.model');

const deletLanguage = asyncWrapper(async (req, res, next) => {
  const { id } = req.query;
  console.log(id);
  const data = await languageModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true }
  );
  const languages = await languageModel.find({
    isDeleted: false,
    isActive: true,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      supportedlanguages: languages,
    },
  });
});

const updatedLanguage = asyncWrapper(async (req, res, next) => {
  const { id } = req.query;
  const { code, name } = req.body;
  console.log(code, name);
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (code !== undefined) updates.code = code;

  if (Object.keys(updates).length === 0) {
    return next(
      new AppError('No valid fields to update', 400, httpStatusText.FAIL)
    );
  }
  const language = await languageModel.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  console.log(language);
  const languages = await languageModel.find({
    isDeleted: false,
  });
  console.log(languages);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      supportedLanguages: languages,
    },
  });
});
const updatedLanguageDefault = asyncWrapper(async (req, res, next) => {
  const { id } = req.query;
  console.log(id);
  if (!id) {
    return next(
      new AppError('Currency ID is required', 400, httpStatusText.FAIL)
    );
  }
  const language = await languageModel.findByIdAndUpdate(
    id,
    { $set: { isDefault: true } },
    { new: true }
  );
  console.log(language);
  await languageModel.updateMany(
    { _id: { $ne: id } },
    { $set: { isDefault: false } }
  );
  const languages = await languageModel.find({
    isDeleted: false,
  });
  console.log(languages);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      supportedLanguages: languages,
    },
  });
});
const addLanguage = asyncWrapper(async (req, res, next) => {
  const { name } = req.body;
  const code = name.toLowerCase().slice(0, 2);
  const language = { name, code };
  const languageAdded = await languageModel.create(language);
  const languages = await languageModel.find({
    isDeleted: false,
  });
  console.log(languages);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      supportedLanguages: languages,
    },
  });
});

module.exports = {
  updatedLanguage,
  deletLanguage,
  addLanguage,
  updatedLanguageDefault,
};
