const { HttpStatusCode } = require("axios");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

function validateRequest(schema) {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error) {
      next(new AppError(error.message, 400, httpStatusText.FAIL));
    }
  };
}

module.exports = validateRequest;
