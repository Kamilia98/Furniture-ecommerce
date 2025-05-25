const AppError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');

module.exports = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return next(
        new AppError(
          'You are not authenticated or permissions are missing.',
          403,
          httpStatusText.ERROR
        )
      );
    }

    const hasPermission = requiredPermissions.some((permission) =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return next(
        new AppError(
          'You are not allowed to access this route, unauthorized user.',
          403,
          httpStatusText.ERROR
        )
      );
    }

    next();
  };
};
