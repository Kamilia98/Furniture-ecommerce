const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You are not allowed to access this route , unauthorized user",
          403,
          httpStatusText.ERROR
        )
      );
    }
    next();
  };
};
