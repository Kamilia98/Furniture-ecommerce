const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const verifyToken = (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    return next(new AppError("Token is required", 401, httpStatusText.ERROR));
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (err) {
    return next(new AppError("Invalid Token", 401, httpStatusText.ERROR));
  }
};

module.exports = verifyToken;
